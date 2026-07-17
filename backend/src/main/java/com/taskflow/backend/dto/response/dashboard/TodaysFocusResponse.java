package com.taskflow.backend.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TodaysFocusResponse {
    private List<UpcomingDeadlineResponse> dueToday;
    private List<UpcomingDeadlineResponse> inReview;
    private List<UpcomingDeadlineResponse> overdue;
}