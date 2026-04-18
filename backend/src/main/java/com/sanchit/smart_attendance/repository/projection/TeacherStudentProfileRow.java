package com.sanchit.smart_attendance.repository.projection;

public interface TeacherStudentProfileRow {
    String getStudentName();

    String getRollNo();

    String getProgramName();

    String getStartYear();

    String getEndYear();

    String getMasterImagePath();

    String getSubjectName();

    Integer getTotalClasses();

    Integer getAttendedClasses();

    Double getAttendancePercentage();
}
