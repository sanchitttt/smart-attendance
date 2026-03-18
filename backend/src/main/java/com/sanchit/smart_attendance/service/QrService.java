package com.sanchit.smart_attendance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sanchit.smart_attendance.dto.QrResponse;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class QrService {

    @Value("${qr.secret}")
    private String secretKey;

    private static final int QR_WINDOW_SECONDS = 4;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SessionRepository sessionRepository;
    private final HmacService hmacService;

    @Autowired
    EnvironmentService environmentService;

    public QrService(SessionRepository sessionRepository, HmacService hmacService) {
        this.sessionRepository = sessionRepository;
        this.hmacService = hmacService;
    }

    public QrResponse generateQrContent(Long sessionId, Long adminId) throws Exception {

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BadRequestException("Session not found"));

        // Check if not active
        if (session.getStatus() != SessionStatus.ACTIVE) {
            session.setStatus(SessionStatus.ACTIVE);
            sessionRepository.save(session); // persist the change
        }

        // Ownership check
        if (environmentService.isProduction() && !session.getTimetableEntry()
                .getAdmin()
                .getAdminId()
                .equals(adminId)) {
            throw new BadRequestException("Unauthorized");
        }


        long issuedAt = System.currentTimeMillis();
        long expiresAt = issuedAt + (session.getQrWindowSeconds() * 1000L);

        String data = sessionId + "|" + issuedAt + "|" + expiresAt;

        String signature = hmacService.sign(data);

        return new QrResponse(
                sessionId,
                issuedAt,
                expiresAt,
                signature
        );
    }
}
