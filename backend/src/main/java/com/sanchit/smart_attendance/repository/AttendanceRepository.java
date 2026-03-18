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
                c.calendar_date AS date,
                CASE 
                    WHEN ar.attendance_id IS NOT NULL THEN 'Present' 
                    ELSE 'Absent' 
                END AS status,
                te.subject_name AS subjectName
            FROM calendar c
            JOIN timetable_entries te 
                ON te.day_of_week::text = TO_CHAR(c.calendar_date, 'DY')
            JOIN sessions s 
                ON s.timetable_entry_id = te.timetable_entry_id 
               AND s.session_date = c.calendar_date
            LEFT JOIN attendance_records ar 
                ON ar.session_id = s.session_id 
               AND ar.user_id = :studentId
            WHERE te.subject_name = :subjectName
              AND c.day_type = 'CLASS'
              AND c.calendar_date <= CURRENT_DATE
            ORDER BY c.calendar_date DESC
            """)
    List<SubjectHistoryDto> getSubjectHistoryByName(
            @Param("studentId") Long studentId,
            @Param("subjectName") String subjectName);
}

