package com.ai.courseengine.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String firebaseUid;

    @Column
    private String email;

    @Column
    private String username;

    @Column(columnDefinition = "TEXT")
    private String pinnedNotes;
}
