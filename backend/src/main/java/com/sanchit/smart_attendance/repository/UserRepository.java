package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.repository.projection.TeacherStudentProfileRow;
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
                                            MAX(s.started_at) AS last_marked   
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
                                        inner join attendance_records ar on ar.session_id = s.session_id and ar.user_id = :studentId and ar.face_scan_successful = true                                            
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

    @Query(nativeQuery = true, value = """
            WITH teacher_courses AS (
                SELECT DISTINCT
                    te.timetable_entry_id,
                    te.subject_name
                FROM timetable_entries te
                INNER JOIN semesters sem
                    ON sem.semester_id = te.semester_id
                INNER JOIN users u
                    ON u.batch_id = sem.batch_id
                WHERE te.admin_id = :adminId
                  AND u.roll_no = :rollNo
            ),
            latest_sessions AS (
                SELECT
                    MAX(s.session_id) AS session_id,
                    s.timetable_entry_id,
                    s.session_date
                FROM sessions s
                GROUP BY s.timetable_entry_id, s.session_date
            ),
            course_sessions AS (
                SELECT
                    tc.subject_name,
                    ls.session_id
                FROM teacher_courses tc
                LEFT JOIN latest_sessions ls
                    ON ls.timetable_entry_id = tc.timetable_entry_id
                LEFT JOIN sessions s
                    ON s.session_id = ls.session_id
                WHERE s.session_date <= CURRENT_DATE
                   OR s.session_date IS NULL
            )
            SELECT
                u.name AS studentName,
                u.roll_no AS rollNo,
                p.program_name AS programName,
                b.start_year AS startYear,
                b.end_year AS endYear,
                u.face_embedding_path AS masterImagePath,
                cs.subject_name AS subjectName,
                COUNT(cs.session_id)::int AS totalClasses,
                COUNT(ar.attendance_id) FILTER (
                    WHERE ar.face_scan_successful = TRUE
                )::int AS attendedClasses,
                ROUND(
                    COALESCE(
                        COUNT(ar.attendance_id) FILTER (
                            WHERE ar.face_scan_successful = TRUE
                        ) * 100.0 / NULLIF(COUNT(cs.session_id), 0),
                        0
                    ),
                    2
                ) AS attendancePercentage
            FROM users u
            INNER JOIN batches b
                ON b.batch_id = u.batch_id
            INNER JOIN programs p
                ON p.program_id = b.program_id
            LEFT JOIN course_sessions cs
                ON 1 = 1
            LEFT JOIN attendance_records ar
                ON ar.session_id = cs.session_id
               AND ar.user_id = u.user_id
            WHERE u.roll_no = :rollNo
            GROUP BY
                u.name,
                u.roll_no,
                p.program_name,
                b.start_year,
                b.end_year,
                u.face_embedding_path,
                cs.subject_name
            ORDER BY cs.subject_name ASC NULLS LAST
            """)
    List<TeacherStudentProfileRow> findTeacherStudentProfile(
            @Param("adminId") Long adminId,
            @Param("rollNo") String rollNo
    );

    @Query(nativeQuery = true, value = """
            SELECT EXISTS (
                SELECT 1
                FROM users u
                INNER JOIN semesters sem
                    ON sem.batch_id = u.batch_id
                INNER JOIN timetable_entries te
                    ON te.semester_id = sem.semester_id
                WHERE te.admin_id = :adminId
                  AND u.roll_no = :rollNo
            )
            """)
    boolean existsTeacherStudentByRollNo(
            @Param("adminId") Long adminId,
            @Param("rollNo") String rollNo
    );

    java.util.Optional<User> findByRollNo(String rollNo);

}
