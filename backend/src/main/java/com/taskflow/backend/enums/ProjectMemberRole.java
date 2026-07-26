package com.taskflow.backend.enums;

public enum ProjectMemberRole {
    OWNER,            // Created the project, full control
    PROJECT_MANAGER,  // Can edit project settings, add members, manage tasks
    DEVELOPER,        // Can create/edit assigned tasks
    TESTER,           // Can update task status, comment
    VIEWER            // Read-only access
}