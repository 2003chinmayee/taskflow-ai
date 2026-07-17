CREATE TABLE notifications (
                               id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               recipient_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               actor_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NULL,
                               type VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL,
                               title VARCHAR(150) COLLATE utf8mb4_unicode_ci NOT NULL,
                               message VARCHAR(300) COLLATE utf8mb4_unicode_ci NOT NULL,
                               is_read TINYINT(1) NOT NULL DEFAULT 0,
                               project_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NULL,
                               task_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NULL,
                               organization_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NULL,
                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               read_at DATETIME NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_notifications_recipient
                                   FOREIGN KEY (recipient_id) REFERENCES users(id)
                                       ON DELETE CASCADE,
                               CONSTRAINT fk_notifications_actor
                                   FOREIGN KEY (actor_id) REFERENCES users(id)
                                       ON DELETE CASCADE,
                               CONSTRAINT fk_notifications_project
                                   FOREIGN KEY (project_id) REFERENCES projects(id)
                                       ON DELETE CASCADE,
                               CONSTRAINT fk_notifications_task
                                   FOREIGN KEY (task_id) REFERENCES tasks(id)
                                       ON DELETE CASCADE,
                               CONSTRAINT fk_notifications_organization
                                   FOREIGN KEY (organization_id) REFERENCES organizations(id)
                                       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notifications_recipient_read_created ON notifications(recipient_id, is_read, created_at);
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_id, created_at);
CREATE INDEX idx_notifications_task_id ON notifications(task_id);
CREATE INDEX idx_notifications_project_id ON notifications(project_id);