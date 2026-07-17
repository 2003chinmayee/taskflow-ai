-- ============================================================
-- V2: Organizations table
-- The top-level tenant container for all TaskFlow AI data
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
                                             id              CHAR(36)        NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    description     VARCHAR(500)    NULL,
    logo_url        VARCHAR(500)    NULL,
    slug            VARCHAR(100)    NULL,
    plan            ENUM('FREE','PRO','BUSINESS','ENTERPRISE')
    NOT NULL DEFAULT 'FREE',
    created_by      CHAR(36)        NOT NULL,
    is_deleted      TINYINT(1)      NOT NULL DEFAULT 0,
    deleted_at      DATETIME        NULL,
    deleted_by      CHAR(36)        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_organizations PRIMARY KEY (id),
    CONSTRAINT fk_org_created_by
    FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_org_deleted_by
    FOREIGN KEY (deleted_by) REFERENCES users(id)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for fast lookup by creator
CREATE INDEX idx_org_creator ON organizations (created_by, is_deleted);

-- Index for slug lookup (URL-friendly org name)
CREATE UNIQUE INDEX idx_org_slug ON organizations (slug);