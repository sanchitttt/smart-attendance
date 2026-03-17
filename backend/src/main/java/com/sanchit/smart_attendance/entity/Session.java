package com.sanchit.smart_attendance.entity;

import com.sanchit.smart_attendance.enums.SessionStatus;
import lombok.*;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "sessions",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"session_date", "timetable_entry_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)   // 🔥 THIS IS THE FIX
    @Column(name = "status", nullable = false)
    private SessionStatus status = SessionStatus.CREATED;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "qr_window_seconds")
    private Integer qrWindowSeconds = 4;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_entry_id", nullable = false)
    private TimetableEntry timetableEntry;

}
