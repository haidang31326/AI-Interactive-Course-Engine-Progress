package com.ai.courseengine.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "highlights")
public class Highlight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long courseId;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String color; // e.g., "yellow", "green", "pink"
    
    @Column(columnDefinition = "TEXT")
    private String note;
}
