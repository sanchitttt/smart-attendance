package com.sanchit.smart_attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {

    private String subjectName;
    private String time;
    private String status;   // Present, Absent, Late
}