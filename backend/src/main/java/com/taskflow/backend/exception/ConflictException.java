package com.taskflow.backend.exception;

// Thrown when a request conflicts with existing state (e.g. duplicate
// pending invitation for the same email). Mapped to HTTP 409.
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}