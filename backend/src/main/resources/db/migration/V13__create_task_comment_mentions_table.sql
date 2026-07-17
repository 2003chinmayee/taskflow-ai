CREATE TABLE task_comment_mentions (
                                       id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                       comment_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                       user_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                       created_at DATETIME NOT NULL,
                                       PRIMARY KEY (id),
                                       CONSTRAINT fk_comment_mentions_comment
                                           FOREIGN KEY (comment_id) REFERENCES task_comments(id)
                                               ON DELETE CASCADE,
                                       CONSTRAINT fk_comment_mentions_user
                                           FOREIGN KEY (user_id) REFERENCES users(id)
                                               ON DELETE CASCADE,
                                       CONSTRAINT uq_comment_mention UNIQUE (comment_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_comment_mentions_comment_id ON task_comment_mentions(comment_id);