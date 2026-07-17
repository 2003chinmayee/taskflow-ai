package com.taskflow.backend.repository;

import com.taskflow.backend.domain.Task;
import com.taskflow.backend.enums.TaskPriority;
import com.taskflow.backend.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, String> {

    @Query("SELECT t FROM Task t WHERE t.projectId = :projectId AND t.deleted = false " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId) " +
            "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findTasks(
            @Param("projectId") String projectId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("assigneeId") String assigneeId,
            @Param("search") String search,
            Pageable pageable);

    Optional<Task> findByIdAndDeletedFalse(String id);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId = :projectId AND t.deleted = false")
    int countByProjectId(@Param("projectId") String projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId = :projectId " +
            "AND t.deleted = false AND t.status = 'DONE'")
    int countCompletedByProjectId(@Param("projectId") String projectId);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t " +
            "WHERE t.projectId = :projectId AND t.status = :status AND t.deleted = false")
    int findMaxPositionByProjectIdAndStatus(
            @Param("projectId") String projectId,
            @Param("status") TaskStatus status);
    List<Task> findByProjectIdAndAssigneeIdAndDeletedFalse(String projectId, String assigneeId);

    List<Task> findByProjectIdAndDeletedFalse(String projectId);

    @Query("SELECT t FROM Task t WHERE t.assigneeId = :userId AND t.deleted = false " +
            "AND t.projectId IN :projectIds ORDER BY t.dueDate ASC")
    List<Task> findMyTasks(@Param("userId") String userId, @Param("projectIds") List<String> projectIds);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId IN :projectIds AND t.deleted = false " +
            "AND t.status <> 'DONE' AND t.dueDate < :today")
    int countOverdueTasks(@Param("projectIds") List<String> projectIds, @Param("today") java.time.LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.projectId IN :projectIds AND t.deleted = false AND t.status = :status")
    int countByProjectIdsAndStatus(@Param("projectIds") List<String> projectIds, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.projectId IN :projectIds AND t.deleted = false " +
            "AND t.status <> 'DONE' AND t.dueDate >= :today ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlines(@Param("projectIds") List<String> projectIds, @Param("today") java.time.LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assigneeId = :userId AND t.deleted = false AND t.projectId IN :projectIds")
    int countMyAssignedTasks(@Param("userId") String userId, @Param("projectIds") List<String> projectIds);

    @Query("SELECT t FROM Task t WHERE t.projectId IN :projectIds AND t.deleted = false " +
            "AND t.dueDate IS NOT NULL AND t.dueDate BETWEEN :startDate AND :endDate " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId) " +
            "AND (:includeCompleted = true OR t.status <> 'DONE') " +
            "ORDER BY t.dueDate ASC")
    List<Task> findCalendarTasks(
            @Param("projectIds") List<String> projectIds,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("assigneeId") String assigneeId,
            @Param("includeCompleted") boolean includeCompleted);

    // Global sweep for the due-soon scheduler: finds tasks across ALL
    // projects (not scoped to one user) that have an assignee, are not
    // done, and are due within the given window. Used by
    // TaskDueSoonScheduler, which runs hourly system-wide.
    @Query("SELECT t FROM Task t WHERE t.deleted = false " +
            "AND t.assigneeId IS NOT NULL " +
            "AND t.status <> 'DONE' " +
            "AND t.dueDate IS NOT NULL " +
            "AND t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findTasksDueSoonForScheduler(
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);

    // Used by DashboardService.getTodaysFocus() — tasks due exactly
    // today (not tomorrow, not already overdue), excluding DONE.
    @Query("SELECT t FROM Task t WHERE t.projectId IN :projectIds AND t.deleted = false " +
            "AND t.status <> 'DONE' AND t.dueDate = :today ORDER BY t.priority DESC")
    List<Task> findDueTodayTasks(@Param("projectIds") List<String> projectIds, @Param("today") java.time.LocalDate today);
}
