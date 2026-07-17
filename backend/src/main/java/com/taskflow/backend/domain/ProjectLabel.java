package com.taskflow.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_labels")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProjectLabel {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 7)
    @Builder.Default
    private String color = "#6366f1";
}