package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("""
                SELECT u FROM User u
                JOIN FETCH u.batch b
                JOIN FETCH b.program
                WHERE u.email = :email
            """)
    Optional<User> findByEmail(String email);

    @Query(nativeQuery = true, value = """
            WITH subject_stats AS (
                SELECT
                    te.subject_name,
                    COUNT(DISTINCT s.session_id) AS total_classes,
                    COUNT(DISTINCT ar.session_id) AS attended,
                    ROUND(
                        COUNT(DISTINCT ar.session_id)::decimal 
                        / NULLIF(COUNT(DISTINCT s.session_id), 0) * 100, 
                        0
                    ) AS percentage,
                    MAX(ar.marked_at) AS last_marked
                FROM calendar c
                JOIN timetable_entries te 
                    ON te.day_of_week::text = TO_CHAR(c.calendar_date, 'DY')
                JOIN sessions s 
                    ON s.timetable_entry_id = te.timetable_entry_id 
                   AND s.session_date = c.calendar_date
                LEFT JOIN attendance_records ar 
                    ON ar.session_id = s.session_id 
                   AND ar.user_id = :studentId
                WHERE c.day_type = 'CLASS'
                  AND c.calendar_date <= CURRENT_DATE
                GROUP BY te.subject_name
            ),
            overall_stats AS (
                SELECT 
                    ROUND(
                        COUNT(DISTINCT CASE WHEN ar.session_id IS NOT NULL THEN s.session_id END)::decimal 
                        / NULLIF(COUNT(DISTINCT s.session_id), 0) * 100, 
                        0
                    ) AS overall_percentage
                FROM calendar c
                JOIN timetable_entries te ON te.day_of_week::text = TO_CHAR(c.calendar_date, 'DY')
                JOIN sessions s ON s.timetable_entry_id = te.timetable_entry_id 
                               AND s.session_date = c.calendar_date
                LEFT JOIN attendance_records ar ON ar.session_id = s.session_id 
                                               AND ar.user_id = :studentId
                WHERE c.day_type = 'CLASS'
                  AND c.calendar_date <= CURRENT_DATE
            )
            SELECT 
                os.overall_percentage,
                ss.subject_name,
                ss.total_classes,
                ss.attended,
                ss.percentage,
                CASE 
                    WHEN ss.percentage >= 90 THEN 'excellent'
                    WHEN ss.percentage >= 80 THEN 'good'
                    WHEN ss.percentage >= 75 THEN 'average'
                    ELSE 'risk'
                END AS status,
                COALESCE(TO_CHAR(ss.last_marked, 'DD Mon'), '—') AS last_marked
            FROM overall_stats os
            CROSS JOIN subject_stats ss
            ORDER BY ss.percentage DESC
            """)
    List<Object[]> getStudentDashboardRaw(@Param("studentId") Long studentId);

}
