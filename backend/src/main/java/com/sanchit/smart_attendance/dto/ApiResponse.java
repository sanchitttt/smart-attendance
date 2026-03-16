package com.sanchit.smart_attendance.dto;

public record ApiResponse<T>(
        boolean error,
        T data
) {}