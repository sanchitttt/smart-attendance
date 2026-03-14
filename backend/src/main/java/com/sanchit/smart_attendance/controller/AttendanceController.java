package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.AttendanceScanRequest;
import com.sanchit.smart_attendance.security.principal.UserPrincipal;
import com.sanchit.smart_attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/scan")
    public ResponseEntity<?> scan(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody @Valid AttendanceScanRequest request
    ) {
        return ResponseEntity.ok(
                attendanceService.processScan(user.getId(), request)
        );
    }
}
