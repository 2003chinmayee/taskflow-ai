-- ============================================================
-- V4: Organization Invitations
-- Pending invitations sent to email addresses
-- ============================================================

CREATE TABLE IF NOT EXISTS org_invitations (
                                               id                  CHAR(36)        NOT NULL,
    org_id              CHAR(36)        NOT NULL,
    inviter_user_id     CHAR(36)        NOT NULL,
    invitee_email       VARCHAR(254)    NOT NULL,
    role                ENUM('PROJECT_MANAGER','MEMBER','GUEST')
    NOT NULL DEFAULT 'MEMBER',
    token_hash          VARCHAR(64)     NOT NULL,
    personal_message    VARCHAR(200)    NULL,
    status              ENUM('PENDING','ACCEPTED','DECLINED','REVOKED','EXPIRED')
    NOT NULL DEFAULT 'PENDING',
    expires_at          DATETIME        NOT NULL,
    accepted_at         DATETIME        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_org_invitations PRIMARY KEY (id),
    CONSTRAINT fk_inv_org
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_inviter
    FOREIGN KEY (inviter_user_id) REFERENCES users(id)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token lookup for invitation acceptance
CREATE INDEX idx_inv_token ON org_invitations (token_hash, status);

-- Check for duplicate pending invitations
CREATE INDEX idx_inv_org_email ON org_invitations (org_id, invitee_email, status);

-- Cleanup expired invitations
CREATE INDEX idx_inv_expiry ON org_invitations (expires_at, status);