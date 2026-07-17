package com.taskflow.backend.controller;

import com.taskflow.backend.domain.User;
import com.taskflow.backend.dto.response.ApiResponse;
import com.taskflow.backend.dto.response.notification.NotificationResponse;
import com.taskflow.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.taskflow.backend.enums.NotificationType;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private String uid(UserDetails u) { return ((User) u).getId(); }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved",
                notificationService.list(uid(userDetails), page, size)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> search(
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved",
                notificationService.search(uid(userDetails), type, search, page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = notificationService.unreadCount(uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAsRead(id, uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(uid(userDetails));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
