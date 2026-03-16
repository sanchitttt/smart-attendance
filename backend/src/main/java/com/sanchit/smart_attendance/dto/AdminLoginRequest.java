package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
public class AdminLoginRequest {
    @NotBlank
    private String idToken;
}
