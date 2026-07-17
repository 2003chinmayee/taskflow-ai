package com.taskflow.backend.service.ai;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class AiRateLimiter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_SECONDS = 5 * 60; // 5 minutes

    // Per-user sliding window of request timestamps. Simple in-memory
    // limiter — sufficient for a single-instance app; documented as a
    // known limitation if this ever scales to multiple backend instances.
    private final ConcurrentHashMap<String, Deque<Instant>> requestLog = new ConcurrentHashMap<>();

    /**
     * Returns true if the user is allowed to make another AI request right
     * now, and records this attempt. Returns false if they've hit the
     * limit within the current window.
     */
    public boolean tryConsume(String userId) {
        Deque<Instant> timestamps = requestLog.computeIfAbsent(userId, k -> new ConcurrentLinkedDeque<>());
        Instant now = Instant.now();
        Instant windowStart = now.minusSeconds(WINDOW_SECONDS);

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= MAX_REQUESTS) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }
}