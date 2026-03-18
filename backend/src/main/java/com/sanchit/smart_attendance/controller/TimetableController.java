package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.service.EnvironmentService;
import com.sanchit.smart_attendance.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/timetable/class")
@RequiredArgsConstructor
public class TimetableController {
    private final TimetableService timetableService;

    @Autowired
    EnvironmentService environmentService;

    @GetMapping("/all")
    public ResponseEntity<?> getMyClasses(
            @AuthenticationPrincipal AdminPrincipal admin
    ) {
        return ResponseEntity.ok(
                Map.of(
                        "error", "false",
                        "data", timetableService.getMyClasses(admin.getId())
                )
        );
    }

    ;

    @Value("${app.dev.admin-id:0}")
    private Long devAdminId;
    @GetMapping("/{timetableEntryID}/{sessionId}")
    public ResponseEntity<?> getClassById(
            @PathVariable Long timetableEntryID,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal AdminPrincipal admin
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "error", "false",
                        "data", timetableService.getClassById(timetableEntryID, environmentService.isProduction() ? admin.getAdminId() : devAdminId, sessionId) // todo: change later
                )
        );
    }
}
