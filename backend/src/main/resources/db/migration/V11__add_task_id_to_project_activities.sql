ALTER TABLE project_activities
    ADD COLUMN task_id CHAR(36) NULL AFTER project_id;

ALTER TABLE project_activities
    ADD CONSTRAINT fk_project_activities_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
            ON DELETE CASCADE;

CREATE INDEX idx_project_activities_task_id ON project_activities(task_id);