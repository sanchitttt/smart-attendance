package com.sanchit.smart_attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequest {
    private String userId;
    private String sessionId;
    private String imagePath;

    // getters & setters
}
