CREATE TABLE work_logs (
                           id VARCHAR(36) NOT NULL PRIMARY KEY,
                           task_id VARCHAR(36) NOT NULL,
                           project_id VARCHAR(36) NOT NULL,
                           user_id VARCHAR(36) NOT NULL,
                           description VARCHAR(500),
                           started_at DATETIME(6),
                           stopped_at DATETIME(6),
                           duration_minutes INT NOT NULL DEFAULT 0,
                           log_date DATE NOT NULL,
                           is_running BIT NOT NULL DEFAULT 0,
                           is_deleted BIT NOT NULL DEFAULT 0,
                           created_at DATETIME(6) NOT NULL,
                           updated_at DATETIME(6) NOT NULL,

                           CONSTRAINT fk_worklog_task FOREIGN KEY (task_id) REFERENCES tasks(id),
                           CONSTRAINT fk_worklog_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_worklog_task_id ON work_logs(task_id);
CREATE INDEX idx_worklog_project_id ON work_logs(project_id);
CREATE INDEX idx_worklog_user_id ON work_logs(user_id);
CREATE INDEX idx_worklog_is_running ON work_logs(is_running);
CREATE INDEX idx_worklog_log_date ON work_logs(log_date);