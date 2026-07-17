-- ============================================================
-- V3: Organization Members
-- Many-to-many between users and organizations with roles
-- ============================================================

CREATE TABLE IF NOT EXISTS org_members (
                                           id              CHAR(36)        NOT NULL,
    org_id          CHAR(36)        NOT NULL,
    user_id         CHAR(36)        NOT NULL,
    role            ENUM('ORG_ADMIN','PROJECT_MANAGER','MEMBER','GUEST')
    NOT NULL DEFAULT 'MEMBER',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    joined_at       DATETIME        NULL,
    removed_at      DATETIME        NULL,
    removed_by      CHAR(36)        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_org_members PRIMARY KEY (id),
    CONSTRAINT uq_org_members UNIQUE (org_id, user_id),
    CONSTRAINT fk_om_org
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_om_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_om_removed_by
    FOREIGN KEY (removed_by) REFERENCES users(id)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Primary access pattern: "which orgs is this user in?"
CREATE INDEX idx_om_user_active ON org_members (user_id, is_active);

-- Secondary: "who are the members of this org?"
CREATE INDEX idx_om_org_role ON org_members (org_id, role, is_active);