package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.QrResponse;
import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.service.QrService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sessions")
public class QrController {

    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    @GetMapping("/{sessionId}/generate-qr")
    public ResponseEntity<QrResponse> generateQr(@PathVariable Long sessionId, @AuthenticationPrincipal AdminPrincipal admin) throws Exception {

        QrResponse qrContent = qrService.generateQrContent(sessionId, admin.getAdminId());
        return ResponseEntity.ok(
                qrContent
        );
    }
}
