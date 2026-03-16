package com.sanchit.smart_attendance.dto;

public record TeacherClassResponse(
        Long timetableId,
        String subjectName,
        String programName,
        Integer semester,
        String adminName,
        String startTime,
        String endTime,
        Integer startYear,
        Integer endYear,
        String sessionStatus
) {}