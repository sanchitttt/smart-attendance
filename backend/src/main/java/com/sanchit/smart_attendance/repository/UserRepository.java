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
           
                                    WITH total_classes AS (
                                        SELECT te.subject_name, COUNT(*) AS total_classes
                                        FROM (
                                            SELECT MAX(session_id) AS last_session_id, s.session_date
                                            FROM sessions s
                                            GROUP BY s.session_date, s.timetable_entry_id
                                        ) a
                                        INNER JOIN sessions s\s
                                            ON s.session_id = a.last_session_id\s
                                            AND s.session_date <= CURRENT_DATE
                                        INNER JOIN timetable_entries te\s
                                            ON te.timetable_entry_id = s.timetable_entry_id
                                        GROUP BY te.subject_name
                                    ),
                                    attended_classes AS (
                                        SELECT\s
                                            te.subject_name,\s
                                            COUNT(*) AS classes_attended,
                                            MAX(s.started_at) AS last_marked   -- ✅ correct way
                                        FROM (
                                            SELECT MAX(s.session_id) AS last_session_id
                                            FROM attendance_records ar
                                            INNER JOIN sessions s\s
                                                ON s.session_id = ar.session_id\s
                                                AND ar.user_id= :studentId
                                            GROUP BY s.timetable_entry_id, s.session_date
                                        ) a
                                        INNER JOIN sessions s\s
                                            ON s.session_id = a.last_session_id
                                        INNER JOIN timetable_entries te\s
                                            ON te.timetable_entry_id = s.timetable_entry_id
                                        GROUP BY te.subject_name
                                    ),
                                    result AS (
                                        SELECT\s
                                            a.subject_name,
                                            a.total_classes AS total,
                                            COALESCE(b.classes_attended, 0) AS attended,
                                            ROUND(
                                                COALESCE(b.classes_attended, 0) * 100.0\s
                                                / NULLIF(a.total_classes, 0)
                                            ) AS percentage,
                                            CASE\s
                                                WHEN ROUND(
                                                    COALESCE(b.classes_attended, 0) * 100.0\s
                                                    / NULLIF(a.total_classes, 0)
                                                ) >= 90 THEN 'excellent'
                                                WHEN ROUND(
                                                    COALESCE(b.classes_attended, 0) * 100.0\s
                                                    / NULLIF(a.total_classes, 0)
                                                ) >= 80 THEN 'good'
                                                WHEN ROUND(
                                                    COALESCE(b.classes_attended, 0) * 100.0\s
                                                    / NULLIF(a.total_classes, 0)
                                                ) >= 75 THEN 'average'
                                                ELSE 'risk'
                                            END AS status,
                                            COALESCE(TO_CHAR(b.last_marked, 'DD Mon'), '—') AS last_marked
                                        FROM total_classes a\s
                                        LEFT JOIN attended_classes b\s
                                            ON b.subject_name = a.subject_name\s
                                    )
                                    SELECT * FROM result;
            """)
    List<Object[]> getStudentDashboardRaw(@Param("studentId") Long studentId);

}
