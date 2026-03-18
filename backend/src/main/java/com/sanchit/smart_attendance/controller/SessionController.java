package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.StartSessionRequest;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    @GetMapping("/debug/me")
    public Object me(Authentication authentication) {
        return authentication;
    }

    private final SessionService sessionService;

    @GetMapping("/all")
    public ResponseEntity<?> getMySessions(
            @AuthenticationPrincipal AdminPrincipal admin
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "error", "false",
                        "data", sessionService.getMySessions(admin.getId())
                )
        );
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSession(
            @AuthenticationPrincipal AdminPrincipal admin,
            @RequestBody StartSessionRequest request
    ) {
        Session session = sessionService.createSession(
                request.getTimetableEntryId(),
                admin.getId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "error", false,
                        "data", Map.of(
                                "sessionId", session.getSessionId(),
                                "status", session.getStatus().name()
                        )
                )
        );
    }

    @PostMapping("/{sessionId}/start")
    public ResponseEntity<?> startSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal AdminPrincipal admin
    ) {
        Session session =
                sessionService.startSession(
                        sessionId,
                        admin.getId()
                );

        return ResponseEntity.ok(
                Map.of(

                        "error", "false",
                        "data", Map.of(
                                "sessionId", session.getSessionId(),
                                "status", session.getStatus().name()
                        )
                )
        );
    }

}
