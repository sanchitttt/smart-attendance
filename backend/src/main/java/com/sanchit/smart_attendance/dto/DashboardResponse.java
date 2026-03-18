package com.sanchit.smart_attendance.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private int overallPercentage;
    private int totalSubjects;

    private List<SubjectAttendanceDto> subjects;

    private RecentActivityDto recentActivity;
}
