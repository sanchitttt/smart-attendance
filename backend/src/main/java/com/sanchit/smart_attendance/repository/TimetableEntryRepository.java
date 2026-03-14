package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.TimetableEntry;
import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
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
                    WHEN CURRENT_TIME >= ts.end_time + INTERVAL '5 minutes'
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
                WHEN CURRENT_TIME >= ts.end_time + INTERVAL '5 minutes'
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
}
