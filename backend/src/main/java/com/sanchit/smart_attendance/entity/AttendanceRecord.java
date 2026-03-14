package com.sanchit.smart_attendance.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uniq_session_user",
                        columnNames = {"session_id", "user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Long attendanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "marked_at", nullable = false)
    private LocalDateTime markedAt = LocalDateTime.now();

    @Column(name = "method", length = 30)
    private String method = "QR_FACE";

    @Column(name = "face_score", precision = 4, scale = 3)
    private BigDecimal faceScore;

    @Column(name = "location_verified")
    private Boolean locationVerified;
}

