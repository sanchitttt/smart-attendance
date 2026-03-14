package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

    @Modifying
    @Query(value = """
        INSERT INTO attendance_records
        (session_id, user_id, location_verified)
        VALUES (:sessionId, :userId, TRUE)
        ON CONFLICT (session_id, user_id) DO NOTHING
    """, nativeQuery = true)
    void markPresent(
            @Param("sessionId") Long sessionId,
            @Param("userId") Long userId,
            @Param("lat") Double lat,
            @Param("lng") Double lng
    );
}

