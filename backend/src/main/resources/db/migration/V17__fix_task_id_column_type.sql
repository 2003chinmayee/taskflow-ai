ALTER TABLE project_activities DROP FOREIGN KEY fk_project_activities_task;

ALTER TABLE project_activities MODIFY COLUMN task_id VARCHAR(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

ALTER TABLE project_activities
    ADD CONSTRAINT fk_project_activities_task
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;