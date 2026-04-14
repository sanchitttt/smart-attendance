package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.dto.SubjectHistoryDto;
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

    @Modifying
    @Query(value = """
    UPDATE attendance_records
    SET liveness_score = :livenessScore,
        face_score = :faceScore,
        face_scan_successful = :verified
    WHERE user_id = :userId
      AND session_id = :sessionId
""", nativeQuery = true)
    void updateScores(
            @Param("userId") Long userId,
            @Param("sessionId") Long sessionId,
            @Param("livenessScore") Double livenessScore,
            @Param("faceScore") Double faceScore,
            @Param("verified") Boolean verified
    );

    @Query("""
            SELECT a
            FROM AttendanceRecord a
            JOIN FETCH a.user u
            WHERE a.session.sessionId = :sessionId
            ORDER BY a.markedAt ASC
            """)
    List<AttendanceRecord> findBySessionId(Long sessionId);

    @Query(nativeQuery = true, value = """
            SELECT 
                ar.attendance_id AS attendanceId,
                c.calendar_date AS date,
                CASE
                    WHEN ar.attendance_id IS NOT NULL\s
                         AND ar.face_scan_successful = FALSE AND (frq.status = 'PENDING' OR frq.status = 'PROCESSING') THEN 'Processing'
                         
                    WHEN ar.attendance_id IS NOT NULL\s
                         AND ar.face_scan_successful = FALSE THEN 'Failed'
    
                    WHEN ar.attendance_id IS NOT NULL\s
                         AND ar.face_scan_successful = TRUE THEN 'Present'
                         
                    WHEN ar.attendance_id IS NOT NULL\s
                         AND au.status = 'REJECTED' THEN 'Rejected'
    
                    ELSE 'Absent'
                END AS status,
                te.subject_name AS subjectName,
                ar.face_scan_successful as faceScanSuccess,
                au.status as attendanceDisputeStatus
            FROM calendar c
            INNER JOIN timetable_entries te 
                ON te.day_of_week::text = TO_CHAR(c.calendar_date, 'DY')
                AND c.day_type = 'CLASS'
                AND c.calendar_date <= CURRENT_DATE
                AND te.subject_name = :subjectName
            INNER JOIN sessions s 
                ON s.timetable_entry_id = te.timetable_entry_id 
               AND s.session_date = c.calendar_date
            LEFT JOIN attendance_records ar 
                ON ar.session_id = s.session_id 
               AND ar.user_id = :studentId
            LEFT OUTER JOIN attendance_disputes au
                ON au.attendance_id = ar.attendance_id
            LEFT OUTER JOIN face_recognition_queue frq ON frq.session_id = s.session_id AND frq.user_id = :studentId
            ORDER BY c.calendar_date DESC
            """)
    List<SubjectHistoryDto> getSubjectHistoryByName(
            @Param("subjectName") String subjectName,
            @Param("studentId") Long studentId
    );
}

