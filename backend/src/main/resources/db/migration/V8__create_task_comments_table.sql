CREATE TABLE task_comments (
                               id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               task_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               author_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                               content TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
                               is_edited BOOLEAN NOT NULL DEFAULT FALSE,
                               is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at DATETIME NOT NULL,
                               updated_at DATETIME NOT NULL,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_task_comments_task
                                   FOREIGN KEY (task_id) REFERENCES tasks(id)
                                       ON DELETE CASCADE,
                               CONSTRAINT fk_task_comments_author
                                   FOREIGN KEY (author_id) REFERENCES users(id)
                                       ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_author_id ON task_comments(author_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at);