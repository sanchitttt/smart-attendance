package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.*;
import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.security.principal.UserPrincipal;
import com.sanchit.smart_attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
            @RequestParam Long sessionId,
            @RequestParam("selfieImage") MultipartFile selfieImage
    ) {
        return ResponseEntity.ok(
                attendanceService.processFaceVerification(user.getId(), sessionId , selfieImage)
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

    @PostMapping("/disputes")
    public ResponseEntity<?> createDispute(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestBody CreateDisputeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "error", false,
                        "data", attendanceService.createDispute(user.getId(), request)
                )
        );
    }

    @GetMapping("/disputes/timetable/{timetableEntryId}")
    public ResponseEntity<?> getDisputesForTimetable(
            @AuthenticationPrincipal AdminPrincipal admin,
            @PathVariable Long timetableEntryId
    ) {
        return ResponseEntity.ok(
                Map.of(
                        "error", false,
                        "data", attendanceService.getDisputesForTimetable(admin.getId(), timetableEntryId)
                )
        );
    }

    @GetMapping("/disputes/all")
    public ResponseEntity<?> getDisputesForAdmin(
            @AuthenticationPrincipal AdminPrincipal admin
    ) {
        return ResponseEntity.ok(
                Map.of(
                        "error", false,
                        "data", attendanceService.getDisputesForAdmin(admin.getId())
                )
        );
    }

    @PostMapping("/disputes/{disputeId}/review")
    public ResponseEntity<?> reviewDispute(
            @AuthenticationPrincipal AdminPrincipal admin,
            @PathVariable Long disputeId,
            @RequestBody ReviewDisputeRequest request
    ) {
        return ResponseEntity.ok(
                Map.of(
                        "error", false,
                        "data", attendanceService.reviewDispute(admin.getId(), disputeId, request)
                )
        );
    }

    @GetMapping("/disputes/{disputeId}/image")
    public ResponseEntity<byte[]> getDisputeImage(
            @AuthenticationPrincipal AdminPrincipal admin,
            @PathVariable Long disputeId,
            @RequestParam(defaultValue = "submitted") String type
    ) {
        AttendanceService.DisputeImagePayload payload =
                attendanceService.getDisputeImage(admin.getId(), disputeId, type);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(payload.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + payload.fileName() + "\"")
                .body(payload.bytes());
    }
}