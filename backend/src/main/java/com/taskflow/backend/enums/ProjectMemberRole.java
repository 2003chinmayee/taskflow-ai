package com.taskflow.backend.enums;

public enum ProjectMemberRole {
    OWNER,      // Created the project, full control
    MANAGER,    // Can edit project settings, add members
    MEMBER,     // Can create/edit tasks
    VIEWER      // Read-only access
}