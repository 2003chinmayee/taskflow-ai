package com.taskflow.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class AiConfig {

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.model}")
    private String geminiModel;

    @Value("${app.gemini.fallback-model}")
    private String geminiFallbackModel;

    @Value("${app.gemini.api-url}")
    private String geminiApiUrl;

    @Value("${app.gemini.timeout-ms}")
    private int timeoutMs;

    public String getGeminiApiKey() {
        return geminiApiKey;
    }

    public String getGeminiModel() {
        return geminiModel;
    }

    public String getGeminiFallbackModel() {
        return geminiFallbackModel;
    }

    public String getGeminiApiUrl() {
        return geminiApiUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    // Shared RestClient used only for calling Gemini. Base URL is set here
    // so GeminiClient just appends "/{model}:generateContent". Connect
    // and read timeouts are now actually enforced — previously timeout-ms
    // was configured but never wired in, so a hung request could block
    // indefinitely with no error ever logged.
    @Bean
    public RestClient geminiRestClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(timeoutMs))
                .build();

        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofMillis(timeoutMs));

        return RestClient.builder()
                .baseUrl(geminiApiUrl)
                .requestFactory(requestFactory)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}