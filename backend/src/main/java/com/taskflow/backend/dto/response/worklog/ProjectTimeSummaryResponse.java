package com.taskflow.backend.dto.response.worklog;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectTimeSummaryResponse {
    private int totalMinutes;
    private String totalFormatted;
    private List<UserTimeEntry> byUser;
    private List<TaskTimeEntry> byTask;

    @Data
    @Builder
    public static class UserTimeEntry {
        private String userId;
        private String userName;
        private int totalMinutes;
        private String formatted;
    }

    @Data
    @Builder
    public static class TaskTimeEntry {
        private String taskId;
        private String taskTitle;
        private int totalMinutes;
        private String formatted;
    }
}