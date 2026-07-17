package com.taskflow.backend.enums;

public enum ProjectStatus {
    PLANNING,      // Project created but not started
    ACTIVE,        // Currently in progress
    ON_HOLD,       // Temporarily paused
    COMPLETED,     // All work done
    CANCELLED,     // Abandoned
    ARCHIVED       // Soft-archived, read-only
}