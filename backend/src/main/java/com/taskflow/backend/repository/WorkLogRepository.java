package com.taskflow.backend.repository;

import com.taskflow.backend.domain.WorkLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkLogRepository extends JpaRepository<WorkLog, String> {

    Optional<WorkLog> findByUserIdAndRunningTrueAndDeletedFalse(String userId);

    Page<WorkLog> findByTaskIdAndDeletedFalseOrderByLogDateDescCreatedAtDesc(String taskId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(w.durationMinutes), 0) FROM WorkLog w " +
            "WHERE w.projectId = :projectId AND w.deleted = false")
    int sumMinutesByProjectId(@Param("projectId") String projectId);

    @Query("SELECT COALESCE(SUM(w.durationMinutes), 0) FROM WorkLog w " +
            "WHERE w.taskId = :taskId AND w.deleted = false")
    int sumMinutesByTaskId(@Param("taskId") String taskId);

    @Query("SELECT w FROM WorkLog w WHERE w.projectId = :projectId AND w.deleted = false")
    List<WorkLog> findByProjectIdAndDeletedFalse(@Param("projectId") String projectId);

    Optional<WorkLog> findByIdAndDeletedFalse(String id);

    List<WorkLog> findByTaskIdAndDeletedFalse(String taskId);
}