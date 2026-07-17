CREATE TABLE IF NOT EXISTS users (
    id                CHAR(36)        NOT NULL,
    email             VARCHAR(254)    NOT NULL,
    password_hash     VARCHAR(255)    NOT NULL,
    name              VARCHAR(100)    NOT NULL,
    avatar_url        VARCHAR(500)    NULL,
    job_title         VARCHAR(100)    NULL,
    bio               VARCHAR(300)    NULL,
    theme             ENUM('DARK','LIGHT') NOT NULL DEFAULT 'DARK',
    email_verified    TINYINT(1)      NOT NULL DEFAULT 0,
    email_verified_at DATETIME        NULL,
    last_seen_at      DATETIME        NULL,
    onboarding_step   TINYINT         NOT NULL DEFAULT 0,
    is_deleted        TINYINT(1)      NOT NULL DEFAULT 0,
    deleted_at        DATETIME        NULL,
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users (email, is_deleted);
CREATE INDEX idx_users_last_seen ON users (last_seen_at);
ALTER TABLE users ADD FULLTEXT INDEX ft_users_search (name, email, job_title);