package com.sanchit.smart_attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private Integer failedPinAttempts = 0;

    private Boolean isLocked = false;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String pinHash;

    private LocalDateTime createdAt = LocalDateTime.now();
}