package com.sanchit.smart_attendance.dto;

public record UserLoginResponse(
        String token,
        String role
) {}
