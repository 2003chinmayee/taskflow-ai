package com.taskflow.backend.exception;

// Thrown when a requested resource does not exist or is not accessible
// in this context. Mapped to HTTP 404 in GlobalExceptionHandler, separate
// from ForbiddenException (403) and generic RuntimeException (400).
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}