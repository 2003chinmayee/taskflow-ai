CREATE TABLE task_attachments (
                                  id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  task_id VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  uploaded_by VARCHAR(36) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  original_file_name VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  stored_file_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  mime_type VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
                                  file_size_bytes BIGINT NOT NULL,
                                  created_at DATETIME NOT NULL,
                                  PRIMARY KEY (id),
                                  CONSTRAINT fk_task_attachments_task
                                      FOREIGN KEY (task_id) REFERENCES tasks(id)
                                          ON DELETE CASCADE,
                                  CONSTRAINT fk_task_attachments_uploader
                                      FOREIGN KEY (uploaded_by) REFERENCES users(id)
                                          ON DELETE CASCADE,
                                  CONSTRAINT uq_task_attachment_stored_name UNIQUE (stored_file_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_task_attachments_uploaded_by ON task_attachments(uploaded_by);