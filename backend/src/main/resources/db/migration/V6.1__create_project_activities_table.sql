CREATE TABLE project_activities (
                                    id VARCHAR(36) NOT NULL,
                                    project_id VARCHAR(36) NOT NULL,
                                    user_id VARCHAR(36) NOT NULL,
                                    type ENUM(
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_ARCHIVED',
        'PROJECT_RESTORED',
        'PROJECT_DELETED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'MEMBER_ROLE_CHANGED',
        'STATUS_CHANGED',
        'SETTINGS_UPDATED',
        'OWNERSHIP_TRANSFERRED',
        'PROJECT_FAVORITED',
        'PROJECT_UNFAVORITED',
        'PROJECT_DUPLICATED',
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'TASK_COMPLETED',
        'TASK_DELETED',
        'TIMER_STARTED',
        'TIMER_STOPPED',
        'WORK_LOG_CREATED',
        'WORK_LOG_UPDATED',
        'WORK_LOG_DELETED'
    ) NOT NULL,
                                    description TEXT,
                                    meta_data TEXT,
                                    created_at DATETIME(6) NOT NULL,
                                    PRIMARY KEY (id),
                                    CONSTRAINT fk_project_activities_project FOREIGN KEY (project_id) REFERENCES projects(id),
                                    CONSTRAINT fk_project_activities_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pa_project_id ON project_activities(project_id);
CREATE INDEX idx_pa_user_id ON project_activities(user_id);
CREATE INDEX idx_pa_created_at ON project_activities(created_at);