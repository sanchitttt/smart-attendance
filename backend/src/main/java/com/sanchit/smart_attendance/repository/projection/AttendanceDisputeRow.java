package com.sanchit.smart_attendance.repository.projection;

import java.time.LocalDateTime;

public interface AttendanceDisputeRow {
    Long getDisputeId();

    Long getAttendanceId();

    Long getTimetableEntryId();

    String getStudentName();

    String getRollNo();

    String getSubjectName();

    String getStatus();

    String getReason();

    String getSubmittedImagePath();

    String getMasterImagePath();

    String getTeacherComment();

    LocalDateTime getCreatedAt();

    LocalDateTime getReviewedAt();
}
