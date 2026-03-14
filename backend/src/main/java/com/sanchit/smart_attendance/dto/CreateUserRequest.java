package com.sanchit.smart_attendance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
        @NotBlank String name,
        @Email String email,
        @NotNull Long batchId,
        @NotBlank String password
) {}
