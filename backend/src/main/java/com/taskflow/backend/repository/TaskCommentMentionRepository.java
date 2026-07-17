package com.taskflow.backend.repository;

import com.taskflow.backend.domain.TaskCommentMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskCommentMentionRepository extends JpaRepository<TaskCommentMention, String> {

    List<TaskCommentMention> findByCommentId(String commentId);

    @Modifying
    @Query("DELETE FROM TaskCommentMention m WHERE m.commentId = :commentId")
    void deleteByCommentId(@Param("commentId") String commentId);
}