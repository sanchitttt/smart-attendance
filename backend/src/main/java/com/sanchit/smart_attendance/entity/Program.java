package com.sanchit.smart_attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "programs")
@Getter
@Setter
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "program_id")
    private Long programId;

    @Column(name = "program_name", nullable = false, unique = true)
    private String programName;

    // getters & setters
}

