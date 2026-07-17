package com.taskflow.backend.enums;

public enum ProjectVisibility {
    PUBLIC,   // All org members can see
    PRIVATE,  // Only project members can see
    SECRET    // Only admins and invited members
}