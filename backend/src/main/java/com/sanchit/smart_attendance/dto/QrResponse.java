package com.sanchit.smart_attendance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QrResponse {
    private Long sessionId;
    private long issuedAt;
    private long expiresAt;
    private String signature;

    public QrResponse(Long sessionId, long issuedAt, long expiresAt, String signature) {
        this.sessionId = sessionId;
        this.issuedAt = issuedAt;
        this.expiresAt = expiresAt;
        this.signature = signature;
    }
}
