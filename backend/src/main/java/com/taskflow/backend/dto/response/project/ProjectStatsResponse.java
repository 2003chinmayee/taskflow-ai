package com.taskflow.backend.dto.response.project;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ProjectStatsResponse {
    private int totalProjects;
    private int activeProjects;
    private int completedProjects;
    private int onHoldProjects;
    private int archivedProjects;
    private int favoriteProjects;
    private int totalMembers;
    private double averageCompletion;
}