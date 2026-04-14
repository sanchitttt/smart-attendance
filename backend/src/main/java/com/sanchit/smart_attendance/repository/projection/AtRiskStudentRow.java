package com.sanchit.smart_attendance.repository.projection;

public interface AtRiskStudentRow {
    String getCourse();

    String getStudentName();

    String getRollNo();

    Integer getPresentClasses();

    Integer getTotalClasses();

    Double getAttendancePercentage();
}
