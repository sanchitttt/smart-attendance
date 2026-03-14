package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminLoginRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password; // OR pin
}
