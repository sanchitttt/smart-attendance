package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.CreateUserRequest;
import com.sanchit.smart_attendance.dto.DashboardResponse;
import com.sanchit.smart_attendance.dto.UserLoginRequest;
import com.sanchit.smart_attendance.dto.UserLoginResponse;
import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.security.principal.UserPrincipal;
import com.sanchit.smart_attendance.service.EnvironmentService;
import com.sanchit.smart_attendance.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EnvironmentService environmentService;

    @Value("${app.dev.admin-id:0}")
    private Long devAdminId;

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(
            @RequestBody @Valid UserLoginRequest request
    ) {
        return ResponseEntity.ok(
                userService.login(request)
        );
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getStudentDashboard(@AuthenticationPrincipal UserPrincipal user) {
        DashboardResponse dashboard = userService.getDashboard(user.getId());
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/student/{rollNo}")
    public ResponseEntity<?> getTeacherStudentProfile(
            @AuthenticationPrincipal AdminPrincipal admin,
            @PathVariable String rollNo
    ) {
        return ResponseEntity.ok(userService.getTeacherStudentProfile(admin.getId(), rollNo));
    }

    @GetMapping("/student/{rollNo}/master-image")
    public ResponseEntity<byte[]> getTeacherStudentMasterImage(
            @AuthenticationPrincipal AdminPrincipal admin,
            @PathVariable String rollNo
    ) {
        UserService.AttendanceImagePayload payload = userService.getTeacherStudentMasterImage((environmentService.isDevelopment() ? devAdminId : admin.getAdminId()), rollNo);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(payload.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + payload.fileName() + "\"")
                .body(payload.bytes());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(
            @RequestBody @Valid CreateUserRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }
}
