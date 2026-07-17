package com.taskflow.backend.enums;

// This enum defines all possible roles a user can have in an organization
// These match exactly what we specified in PRD Chapter 7
public enum OrgRole {
    ORG_ADMIN,        // Full organization control
    PROJECT_MANAGER,  // Can create and manage projects
    MEMBER,           // Core contributor
    GUEST             // Read-only + comments only
}