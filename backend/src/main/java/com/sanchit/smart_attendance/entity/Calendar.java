package com.sanchit.smart_attendance.entity;

import com.sanchit.smart_attendance.enums.DayType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "calendar")
@Getter
@Setter
public class Calendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calendar_id")
    private Long calendarId;

    @Column(name = "calendar_date", nullable = false, unique = true)
    private LocalDate calendarDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false)
    private DayType dayType;

    private String description;

    // getters & setters
}

