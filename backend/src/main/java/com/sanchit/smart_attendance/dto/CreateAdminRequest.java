package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.*;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAdminRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    @Pattern(regexp = "\\d{4}")
    private String pin;

    // Getters and setters or Lombok @Getter @Setter
}
