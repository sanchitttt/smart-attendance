package com.sanchit.smart_attendance.repository.projection;

import java.time.LocalTime;

public interface TeacherClassTile {
    Integer getTimetableID();

    String getAdminName();

    String getSessionStatus();

    LocalTime getStartTime();
    LocalTime getEndTime();

    String getStartYear();
    String getEndYear();

    String getSubjectName();
    String getProgramName();

    Integer getSemester();

    void setSessionStatus(String name);

    String getStatus(); // old | current | upcoming
}
