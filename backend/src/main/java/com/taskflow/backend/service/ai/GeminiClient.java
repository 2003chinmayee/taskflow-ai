package com.taskflow.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.taskflow.backend.config.AiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiClient {

    private final RestClient geminiRestClient;
    private final AiConfig aiConfig;
    private final ObjectMapper objectMapper;

    private static final long RETRY_DELAY_MS = 1000;

    /**
     * Calls Gemini's generateContent endpoint. Resilience behavior:
     * - 503/429 on the primary model: one retry after a short backoff,
     *   then falls back to a secondary model once.
     * - 400/401/403: surfaced immediately, no retry — these are
     *   configuration/auth/request errors, not transient.
     * Never logs the API key or the full user prompt — only model names
     * and high-level failure reasons.
     */
    public String generateContent(String systemInstruction, String userPrompt) {
        String primaryModel = aiConfig.getGeminiModel();
        String fallbackModel = aiConfig.getGeminiFallbackModel();

        log.info("Calling Gemini model '{}' (attempt 1)", primaryModel);
        try {
            return callModel(primaryModel, systemInstruction, userPrompt);
        } catch (RetryableGeminiException firstFailure) {
            log.warn("Gemini model '{}' unavailable ({}), retrying once after backoff",
                    primaryModel, firstFailure.getMessage());
            sleepQuietly(RETRY_DELAY_MS);

            log.info("Calling Gemini model '{}' (attempt 2, after backoff)", primaryModel);
            try {
                return callModel(primaryModel, systemInstruction, userPrompt);
            } catch (RetryableGeminiException secondFailure) {
                log.warn("Gemini model '{}' still unavailable, trying fallback model '{}'",
                        primaryModel, fallbackModel);

                log.info("Calling fallback Gemini model '{}'", fallbackModel);
                try {
                    return callModel(fallbackModel, systemInstruction, userPrompt);
                } catch (RetryableGeminiException fallbackFailure) {
                    log.error("Fallback model '{}' also unavailable ({})",
                            fallbackModel, fallbackFailure.getMessage());
                    throw new AiUnavailableException("AI is temporarily unavailable. Please try again in a few minutes.");
                }
            }
        }
    }

    private String callModel(String model, String systemInstruction, String userPrompt) {
        ObjectNode requestBody = objectMapper.createObjectNode();

        ObjectNode systemInstructionNode = objectMapper.createObjectNode();
        systemInstructionNode.putArray("parts").addObject().put("text", systemInstruction);
        requestBody.set("system_instruction", systemInstructionNode);

        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        userContent.putArray("parts").addObject().put("text", userPrompt);
        requestBody.putArray("contents").add(userContent);

        String path = "/" + model + ":generateContent";

        String rawResponse;
        try {
            rawResponse = geminiRestClient.post()
                    .uri(path)
                    .header("x-goog-api-key", aiConfig.getGeminiApiKey())
                    .body(requestBody.toString())
                    .retrieve()
                    .body(String.class);
        } catch (HttpServerErrorException.ServiceUnavailable e) {
            throw new RetryableGeminiException("503 from model " + model);
        } catch (HttpClientErrorException.TooManyRequests e) {
            throw new RetryableGeminiException("429 from model " + model);
        } catch (HttpClientErrorException e) {
            // 400/401/403 and similar — real config/request problems.
            // Surface immediately, no retry, no fallback.
            log.error("Gemini request error for model '{}': {} {}",
                    model, e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiUnavailableException("AI service is unavailable right now.");
        } catch (ResourceAccessException e) {
            throw new AiTimeoutException("AI is taking too long to respond. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini model '{}'", model, e);
            throw new AiUnavailableException("AI service is unavailable right now.");
        }

        return extractText(rawResponse);
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String extractText(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new AiInvalidResponseException("AI returned no answer.");
            }
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                throw new AiInvalidResponseException("AI returned an empty answer.");
            }
            String text = parts.get(0).path("text").asText(null);
            if (text == null || text.isBlank()) {
                throw new AiInvalidResponseException("AI returned an empty answer.");
            }
            return text;
        } catch (AiInvalidResponseException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini response");
            throw new AiInvalidResponseException("Could not understand the AI's response. Please try again.");
        }
    }

    // ─── Exceptions ────────────────────────────────────────────────

    /** Internal signal only — triggers retry/fallback, never surfaced to controllers. */
    private static class RetryableGeminiException extends RuntimeException {
        RetryableGeminiException(String message) { super(message); }
    }

    public static class AiTimeoutException extends RuntimeException {
        public AiTimeoutException(String message) { super(message); }
    }

    public static class AiQuotaExceededException extends RuntimeException {
        public AiQuotaExceededException(String message) { super(message); }
    }

    public static class AiUnavailableException extends RuntimeException {
        public AiUnavailableException(String message) { super(message); }
    }

    public static class AiInvalidResponseException extends RuntimeException {
        public AiInvalidResponseException(String message) { super(message); }
    }
}