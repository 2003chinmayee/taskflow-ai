package com.taskflow.backend.repository;

import com.taskflow.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find active (non-deleted) user by email
    Optional<User> findByEmailAndIsDeletedFalse(String email);

    Optional<User> findByResetToken(String resetToken);
}