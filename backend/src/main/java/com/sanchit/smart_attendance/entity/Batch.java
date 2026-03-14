package com.sanchit.smart_attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "batches")
@Getter
@Setter
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(name = "start_year", nullable = false)
    private String startYear;

    @Column(name = "end_year", nullable = false)
    private String endYear;

    // getters & setters
}
