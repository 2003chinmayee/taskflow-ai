package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.calendar.CalendarTaskResponse;
import com.taskflow.backend.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping("/api/v1/calendar/tasks")
    public ResponseEntity<ApiResponse<List<CalendarTaskResponse>>> getCalendarTasks(
            @RequestParam String orgId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(defaultValue = "false") boolean mineOnly,
            @RequestParam(defaultValue = "true") boolean includeCompleted,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Calendar tasks retrieved",
                calendarService.getCalendarTasks(orgId, uid(userDetails), startDate, endDate,
                        projectId, status, priority, assigneeId, mineOnly, includeCompleted)));
    }
}