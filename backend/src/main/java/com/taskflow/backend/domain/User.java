package com.taskflow.backend.domain;

// ─── What are these imports? ─────────────────────────────────────
// jakarta.persistence.*  → These are JPA annotations that tell
//                          Hibernate how to map this class to MySQL
// lombok.*               → Generates getters, setters, constructors
//                          automatically so we don't write boilerplate
// org.springframework.security.core.* → Makes our User work with
//                          Spring Security's authentication system

import com.taskflow.backend.enums.OrgRole;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

// ─── @Entity ──────────────────────────────────────────────────────
// Tells JPA/Hibernate: "This Java class represents a database table"
// Without this, Hibernate ignores this class completely

// ─── @Table(name = "users") ───────────────────────────────────────
// Specifies the exact MySQL table name this entity maps to
// Without this, Hibernate would look for a table named "user" (singular)

// ─── @Getter, @Setter ─────────────────────────────────────────────
// Lombok annotations: automatically generates getUser(), setUser() etc.
// Without Lombok, you'd write hundreds of lines of repetitive code

// ─── @Builder ─────────────────────────────────────────────────────
// Enables the Builder pattern: User.builder().email("x").name("y").build()
// Much cleaner than new User("x", "y", "z", ...)

// ─── @NoArgsConstructor, @AllArgsConstructor ──────────────────────
// Generates constructors automatically
// JPA requires a no-argument constructor to exist

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    // ─── implements UserDetails ────────────────────────────────────
    // UserDetails is a Spring Security interface
    // By implementing it, Spring Security can use our User class
    // directly for authentication — no adapter needed

    // ─── @Id ──────────────────────────────────────────────────────
    // Marks this field as the PRIMARY KEY of the table

    // ─── @Column(name = "id") ─────────────────────────────────────
    // Maps this Java field to the "id" column in MySQL

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    // ─── @Column(unique = true) ───────────────────────────────────
    // Tells Hibernate this column has a UNIQUE constraint
    // Prevents two users from registering with the same email

    @Column(name = "email", unique = true, nullable = false, length = 254)
    private String email;

    // We store the BCrypt HASH of the password, never the plain text
    // BCrypt output is always 60 characters, we store up to 255 to be safe
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "bio", length = 300)
    private String bio;

    // ─── @Enumerated(EnumType.STRING) ─────────────────────────────
    // Tells JPA to store the enum as a String in MySQL ("DARK" or "LIGHT")
    // vs EnumType.ORDINAL which stores 0 or 1 (dangerous if enum order changes)

    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false)
    @Builder.Default
    private Theme theme = Theme.DARK;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "onboarding_step", nullable = false)
    @Builder.Default
    private int onboardingStep = 0;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ─── @Column(updatable = false) ───────────────────────────────
    // This timestamp is set once when the record is created
    // updatable = false means JPA will never update this column

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "reset_token", length = 255)
    private String resetToken;

    @Column(name = "reset_token_expires_at")
    private LocalDateTime resetTokenExpiresAt;

    // ─── Theme enum ───────────────────────────────────────────────
    // Inner enum for the user's preferred theme
    public enum Theme {
        DARK, LIGHT
    }

    // ─── PrePersist / PreUpdate ───────────────────────────────────
    // @PrePersist: runs BEFORE the entity is first saved to database
    // @PreUpdate:  runs BEFORE the entity is updated in database
    // This ensures timestamps are always set correctly

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── UserDetails interface methods ────────────────────────────
    // Spring Security requires these methods to understand the user's
    // permissions and account status

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Returns what roles/permissions this user has
        // SimpleGrantedAuthority wraps a role string like "ROLE_MEMBER"
        return List.of(new SimpleGrantedAuthority("ROLE_MEMBER"));
    }

    @Override
    public String getPassword() {
        // Spring Security needs this to verify passwords
        // We return our hashed password stored in passwordHash field
        return passwordHash;
    }

    @Override
    public String getUsername() {
        // Spring Security uses email as the "username" in TaskFlow AI
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // We don't expire accounts
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isDeleted; // Deleted accounts are "locked"
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // We don't expire credentials
    }

    @Override
    public boolean isEnabled() {
        return !isDeleted; // Deleted accounts are disabled
    }
}