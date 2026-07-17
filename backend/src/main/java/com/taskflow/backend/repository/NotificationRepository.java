package com.taskflow.backend.repository;

import com.taskflow.backend.domain.Notification;
import com.taskflow.backend.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    long countByRecipientIdAndReadFalse(String recipientId);

    @Query("SELECT n FROM Notification n WHERE n.recipientId = :recipientId " +
            "AND (:type IS NULL OR n.type = :type) " +
            "AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> searchNotifications(
            @Param("recipientId") String recipientId,
            @Param("type") NotificationType type,
            @Param("search") String search,
            Pageable pageable);

    // Dedup check for scheduler-generated due-soon notifications: prevents
    // repeated hourly notifications for the same task within its current
    // due-date window. Enforced via query, not just application logic, so
    // a backend restart or overlapping scheduler run cannot create
    // duplicates.
    boolean existsByRecipientIdAndTaskIdAndTypeAndCreatedAtAfter(
            String recipientId, String taskId, NotificationType type, LocalDateTime after);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now " +
            "WHERE n.id = :id AND n.recipientId = :recipientId")
    int markAsRead(@Param("id") String id, @Param("recipientId") String recipientId, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now " +
            "WHERE n.recipientId = :recipientId AND n.read = false")
    int markAllAsRead(@Param("recipientId") String recipientId, @Param("now") LocalDateTime now);
}