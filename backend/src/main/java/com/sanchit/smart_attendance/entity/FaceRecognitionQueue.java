package com.sanchit.smart_attendance.entity;

import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "face_recognition_queue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceRecognitionQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "queue_id")
    private Long queueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private FaceQueueStatus status = FaceQueueStatus.PENDING;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;


}
