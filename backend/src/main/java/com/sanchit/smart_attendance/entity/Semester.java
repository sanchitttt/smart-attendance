package com.sanchit.smart_attendance.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import javax.script.ScriptEngineFactory;

@Entity
@Table(
        name = "semesters",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"batch_id", "semester_number"})
        }
)
@Getter
@Setter
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "semester_id")
    private Long semesterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "semester_number", nullable = false)
    private Integer semesterNumber;

    // getters & setters
}
