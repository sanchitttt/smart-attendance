package com.sanchit.smart_attendance.entity;

import com.sanchit.smart_attendance.converter.JsonMapConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // 🔒 Anti-proxy
    @Column(name = "device_id_hash")
    private String deviceIdHash;

    @Column(name = "device_bound_at", nullable = false)
    private Instant deviceBoundAt;

    // 👤 Face recognition
    @Column(name = "face_embedding_path")
    private String faceEmbeddingPath;

    @Column(nullable = false)
    private String passwordHash;

    @Column(name = "face_enrolled_at")
    private LocalDateTime faceEnrolledAt;

    @Column(name = "roll_no")
    private String rollNo;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "device_meta_data", columnDefinition = "TEXT")
    private Map<String, Object> deviceMetadata;


}
