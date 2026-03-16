package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.service.TimetableService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/all")
    public ResponseEntity<?> getMyClasses(
            @AuthenticationPrincipal AdminPrincipal admin
    ) {
        System.out.println(">>> HIT getMyClasses controller");

        return ResponseEntity.ok(
                Map.of(
                        "error", "false",
                        "data", timetableService.getMyClasses(admin.getId())
                )
        );
    }

    ;

    @GetMapping("/{timetableEntryID}/{sessionId}")
    public ResponseEntity<?> getClassById(
            @PathVariable Long timetableEntryID,
            @PathVariable Long sessionId,
            @AuthenticationPrincipal AdminPrincipal admin
    ) {
        System.out.println(">>> HIT getClassById controller");
        System.out.println(admin.getId());
        return ResponseEntity.ok(
                Map.of(
                        "error", "false",
                        "data", timetableService.getClassById(timetableEntryID, 4l,sessionId) // todo: change later
                )
        );
    }
}
