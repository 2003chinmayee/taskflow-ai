package com.taskflow.backend.exception;

// Thrown when an authenticated user lacks permission for an action.
// Mapped to HTTP 403 in GlobalExceptionHandler, separate from generic
// RuntimeException (400) used for business/validation errors.
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}