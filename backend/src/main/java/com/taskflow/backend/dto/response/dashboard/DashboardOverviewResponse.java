package com.taskflow.backend.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardOverviewResponse {
    private int totalProjects;
    private int activeProjects;
    private int archivedProjects;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int overdueTasks;
    private int teamMembers;
    private int myAssignedTasks;
}