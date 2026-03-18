package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.*;
import com.sanchit.smart_attendance.security.principal.UserPrincipal;
import com.sanchit.smart_attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/scan-qr")
    public ResponseEntity<?> scan(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody @Valid AttendanceScanRequest request
    ) {
        return ResponseEntity.ok(
                attendanceService.processScan(user.getId(), request)
        );
    }

    @PostMapping("/face-scan")
    public ResponseEntity<?> faceScan(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody @Valid FaceVerificationRequest request
    ) {
        return ResponseEntity.ok(
                attendanceService.processFaceVerification(user.getId(), request)
        );
    }

    @GetMapping("/session/{sessionId}")
    public ApiResponse<?> getSessionAttendance(
            @AuthenticationPrincipal UserPrincipal user,
            @PathVariable Long sessionId
    ) {
        List<LiveStudentsResponse> students =
                attendanceService.getLiveStudents(sessionId);

        return new ApiResponse<>(false, students);
    }

    /**
     * Get full attendance history for a specific subject for the logged-in student
     */
    @GetMapping("/subject-history")
    public ApiResponse<List<SubjectHistoryDto>> getSubjectHistory(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam String subjectName) {

        System.out.println("Reached");
        List<SubjectHistoryDto> history = attendanceService.getSubjectHistory(user.getId(), subjectName);

        return new ApiResponse<>(false, history);
    }
}