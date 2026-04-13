package com.sanchit.smart_attendance.repository.projection;

import java.time.LocalDate;

public interface TimetableSummaryRow {
    String getCourse();

    LocalDate getDate();

    Integer getCount();

    Integer getTotalClasses();

    Double getAverageAttendance();

    Integer getAtRiskStudents();
}
