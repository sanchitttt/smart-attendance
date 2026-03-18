package com.sanchit.smart_attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAttendanceDto {

    private String subjectId;
    private String subjectName;
    private String subjectCode;
    private int attended;
    private int total;
    private int totalClasses;
    private int percentage;
    private String status;           // excellent, good, average, risk
    private String lastMarked;
}
