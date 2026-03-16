package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    @Query("""
            SELECT a
            FROM AttendanceRecord a
            JOIN FETCH a.user u
            WHERE a.session.sessionId = :sessionId
            ORDER BY a.markedAt ASC
            """)
    List<AttendanceRecord> findBySessionId(Long sessionId);
}

