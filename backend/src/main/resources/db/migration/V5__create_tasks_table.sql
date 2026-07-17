CREATE TABLE tasks (
                       id VARCHAR(36) NOT NULL PRIMARY KEY,
                       project_id VARCHAR(36) NOT NULL,
                       title VARCHAR(200) NOT NULL,
                       description TEXT,
                       status ENUM('TODO','IN_PROGRESS','IN_REVIEW','DONE') NOT NULL DEFAULT 'TODO',
                       priority ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
                       assignee_id VARCHAR(36),
                       created_by VARCHAR(36) NOT NULL,
                       due_date DATE,
                       position INT NOT NULL DEFAULT 0,
                       is_deleted BIT(1) NOT NULL DEFAULT 0,
                       completed_at DATETIME(6),
                       created_at DATETIME(6) NOT NULL,
                       updated_at DATETIME(6) NOT NULL,
                       CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES projects(id),
                       CONSTRAINT fk_task_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
                       CONSTRAINT fk_task_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_task_project_id ON tasks(project_id);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_task_assignee ON tasks(assignee_id);
CREATE INDEX idx_task_deleted ON tasks(is_deleted);