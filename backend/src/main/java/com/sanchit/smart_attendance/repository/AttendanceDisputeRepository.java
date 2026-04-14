package com.sanchit.smart_attendance.repository;

import com.sanchit.smart_attendance.entity.AttendanceDispute;
import com.sanchit.smart_attendance.repository.projection.AttendanceDisputeRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttendanceDisputeRepository extends JpaRepository<AttendanceDispute, Long> {

    Optional<AttendanceDispute> findByAttendanceRecord_AttendanceId(Long attendanceId);

    @Query(value = """
            SELECT
                d.dispute_id AS disputeId,
                d.attendance_id AS attendanceId,
                te.timetable_entry_id AS timetableEntryId,
                u.name AS studentName,
                u.roll_no AS rollNo,
                te.subject_name AS subjectName,
                d.status AS status,
                d.reason AS reason,
                d.teacher_comment AS teacherComment,
                d.created_at AS createdAt,
                d.reviewed_at AS reviewedAt,
                d.submitted_image_path AS submittedImagePath,
                d.master_image_path as masterImagePath
            FROM attendance_disputes d
            INNER JOIN attendance_records ar
                ON ar.attendance_id = d.attendance_id
            INNER JOIN users u
                ON u.user_id = ar.user_id
            INNER JOIN sessions s
                ON s.session_id = ar.session_id
            INNER JOIN timetable_entries te
                ON te.timetable_entry_id = s.timetable_entry_id
            WHERE te.admin_id = :adminId
            ORDER BY d.created_at DESC
            """, nativeQuery = true)
    List<AttendanceDisputeRow> findAllForAdmin(@Param("adminId") Long adminId);

    @Query(value = """
            SELECT
                d.dispute_id AS disputeId,
                d.attendance_id AS attendanceId,
                te.timetable_entry_id AS timetableEntryId,
                u.name AS studentName,
                u.roll_no AS rollNo,
                te.subject_name AS subjectName,
                d.status AS status,
                d.reason AS reason,
                d.teacher_comment AS teacherComment,
                d.created_at AS createdAt,
                d.reviewed_at AS reviewedAt
            FROM attendance_disputes d
            INNER JOIN attendance_records ar
                ON ar.attendance_id = d.attendance_id
            INNER JOIN users u
                ON u.user_id = ar.user_id
            INNER JOIN sessions s
                ON s.session_id = ar.session_id
            INNER JOIN timetable_entries te
                ON te.timetable_entry_id = s.timetable_entry_id
            WHERE te.admin_id = :adminId
              AND te.timetable_entry_id = :timetableEntryId
            ORDER BY d.created_at DESC
            """, nativeQuery = true)
    List<AttendanceDisputeRow> findAllForAdminAndTimetable(
            @Param("adminId") Long adminId,
            @Param("timetableEntryId") Long timetableEntryId
    );

    Optional<AttendanceDispute> findByDisputeIdAndAttendanceRecord_Session_TimetableEntry_Admin_AdminId(
            Long disputeId,
            Long adminId
    );
}
