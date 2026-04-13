package com.sanchit.smart_attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectHistoryDto {

    private LocalDate date;
    private String status;        // "Present" or "Absent"
    private String subjectName;
    private Boolean faceScanSuccess;
}