package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.TimetableEntry;
import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import com.sanchit.smart_attendance.repository.projection.TimetableSummaryRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableEntryRepository
        extends JpaRepository<TimetableEntry, Long> {

    Optional<TimetableEntry> findByAdmin_AdminIdAndDayOfWeekAndTimeSlot_TimeSlotId(
            Long adminId,
            DayOfWeekEnum dayOfWeek,
            Long timeSlotId
    );

    @Query(
            value = """
            SELECT
                te.timetable_entry_id AS timetableID,
                a.name AS adminName,
                ts.start_time AS startTime,
                ts.end_time AS endTime,
                b.start_year AS startYear,
                b.end_year AS endYear,
                te.subject_name AS subjectName,
                p.program_name AS programName,
                sem.semester_number AS semester,
                CASE
                    WHEN CURRENT_TIME >= ts.end_time + INTERVAL '10 minutes'
                        THEN 'old'
                    WHEN CURRENT_TIME BETWEEN ts.start_time AND ts.end_time
                        THEN 'current'
                    ELSE 'upcoming'
                END AS status
            FROM timetable_entries te
            INNER JOIN time_slots ts
                ON ts.time_slot_id = te.time_slot_id
            INNER JOIN admins a
                ON a.admin_id = te.admin_id
            INNER JOIN semesters sem
                ON sem.semester_id = te.semester_id
            INNER JOIN batches b
                ON b.batch_id = sem.batch_id
            INNER JOIN programs p
                ON p.program_id = b.program_id
            WHERE te.admin_id = :adminId
              AND te.day_of_week = CAST(:dayOfWeek AS day_of_week_enum)
            ORDER BY ts.start_time
        """,
            nativeQuery = true
    )
    List<TeacherClassTile> findTeacherClassesForDay(
            @Param("adminId") Long adminId,
            @Param("dayOfWeek") String dayOfWeek
    );

    @Query(
            value = """
        SELECT
            te.timetable_entry_id AS timetableID,
            a.name AS adminName,
            ts.start_time AS startTime,
            ts.end_time AS endTime,
            b.start_year AS startYear,
            b.end_year AS endYear,
            te.subject_name AS subjectName,
            p.program_name AS programName,
            sem.semester_number AS semester,
            CASE
                WHEN CURRENT_TIME > ts.end_time + INTERVAL '10 minutes'
                    THEN 'old'
                WHEN CURRENT_TIME BETWEEN ts.start_time AND (ts.end_time + INTERVAL '10 minutes')
                    THEN 'current'
                ELSE 'upcoming'
            END AS status
        FROM timetable_entries te
        INNER JOIN time_slots ts
            ON ts.time_slot_id = te.time_slot_id
        INNER JOIN admins a
            ON a.admin_id = te.admin_id
        INNER JOIN semesters sem
            ON sem.semester_id = te.semester_id
        INNER JOIN batches b
            ON b.batch_id = sem.batch_id
        INNER JOIN programs p
            ON p.program_id = b.program_id
        WHERE te.timetable_entry_id = :timetableEntryId
          AND te.admin_id = :adminId
        LIMIT 1
    """,
            nativeQuery = true
    )
    Optional<TeacherClassTile> findTeacherClassByTimetableEntryId(
            @Param("timetableEntryId") Long timetableEntryId,
            @Param("adminId") Long adminId
    );

    @Query(
            value = """
                WITH teacher_sessions AS (
                    SELECT
                        s.session_id,
                        s.session_date,
                        te.subject_name AS course,
                        te.semester_id
                    FROM sessions s
                    INNER JOIN timetable_entries te
                        ON te.timetable_entry_id = s.timetable_entry_id
                    WHERE te.admin_id = :adminId
                      AND s.session_date <= CURRENT_DATE
                ),
                batch_students AS (
                    SELECT
                        sem.semester_id,
                        COUNT(u.user_id) AS active_students
                    FROM semesters sem
                    LEFT JOIN users u
                        ON u.batch_id = sem.batch_id
                       AND COALESCE(u.is_active, TRUE) = TRUE
                    GROUP BY sem.semester_id
                ),
                session_attendance AS (
                    SELECT
                        ts.session_id,
                        ts.course,
                        ts.session_date,
                        COALESCE(bs.active_students, 0) AS active_students,
                        COUNT(ar.attendance_id) FILTER (
                            WHERE ar.face_scan_successful = TRUE
                        ) AS present_count
                    FROM teacher_sessions ts
                    LEFT JOIN batch_students bs
                        ON bs.semester_id = ts.semester_id
                    LEFT JOIN attendance_records ar
                        ON ar.session_id = ts.session_id
                    GROUP BY ts.session_id, ts.course, ts.session_date, bs.active_students
                ),
                course_metrics AS (
                    SELECT
                        sa.course,
                        COUNT(sa.session_id)::int AS total_classes,
                        ROUND(
                            COALESCE(
                                (SUM(sa.present_count) * 100.0) / NULLIF(SUM(sa.active_students), 0),
                                0
                            ),
                            2
                        )::double precision AS average_attendance
                    FROM session_attendance sa
                    GROUP BY sa.course
                ),
                student_course_stats AS (
                    SELECT
                        te.subject_name AS course,
                        u.user_id,
                        COUNT(s.session_id) AS total_sessions,
                        COUNT(ar.attendance_id) FILTER (
                            WHERE ar.face_scan_successful = TRUE
                        ) AS present_sessions
                    FROM sessions s
                    INNER JOIN timetable_entries te
                        ON te.timetable_entry_id = s.timetable_entry_id
                    INNER JOIN semesters sem
                        ON sem.semester_id = te.semester_id
                    INNER JOIN users u
                        ON u.batch_id = sem.batch_id
                       AND COALESCE(u.is_active, TRUE) = TRUE
                    LEFT JOIN attendance_records ar
                        ON ar.session_id = s.session_id
                       AND ar.user_id = u.user_id
                    WHERE te.admin_id = :adminId
                      AND s.session_date <= CURRENT_DATE
                    GROUP BY te.subject_name, u.user_id
                ),
                risk_by_course AS (
                    SELECT
                        scs.course,
                        COUNT(*)::int AS at_risk_students
                    FROM student_course_stats scs
                    WHERE scs.total_sessions > 0
                      AND (scs.present_sessions * 100.0 / scs.total_sessions) < 75
                    GROUP BY scs.course
                ),
                trend_by_course_date AS (
                    SELECT
                        ts.course,
                        ts.session_date AS date,
                        COUNT(ts.session_id)::int AS count
                    FROM teacher_sessions ts
                    GROUP BY ts.course, ts.session_date
                )
                SELECT
                    t.course AS course,
                    t.date AS date,
                    t.count AS count,
                    cm.total_classes AS totalClasses,
                    cm.average_attendance AS averageAttendance,
                    COALESCE(r.at_risk_students, 0) AS atRiskStudents
                FROM trend_by_course_date t
                INNER JOIN course_metrics cm
                    ON cm.course = t.course
                LEFT JOIN risk_by_course r
                    ON r.course = t.course
                ORDER BY t.date ASC, t.course ASC
            """,
            nativeQuery = true
    )
    List<TimetableSummaryRow> findTimetableSummaryByAdminId(
            @Param("adminId") Long adminId
    );
}
