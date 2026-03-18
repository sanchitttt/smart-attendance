package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.AdminLoginRequest;
import com.sanchit.smart_attendance.dto.AdminLoginResponse;
import com.sanchit.smart_attendance.dto.CreateAdminRequest;
import com.sanchit.smart_attendance.dto.UserLoginResponse;
import com.sanchit.smart_attendance.entity.Admin;
import com.sanchit.smart_attendance.service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@RequestBody @Valid CreateAdminRequest request) {
        Admin admin = adminService.createAdmin(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "adminId", admin.getAdminId(),
                        "email", admin.getEmail(),
                        "createdAt", admin.getCreatedAt()
                )
        );
    }

    @GetMapping("/testRoute")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("error", false, "message", "Test route working"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request,
                                   HttpServletResponse response) {
        AdminLoginResponse res = adminService.login(request);

        ResponseCookie cookie = ResponseCookie.from("access_token", res.token())
                .httpOnly(true)
                .secure(true)    // Required if SameSite is None
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .sameSite("None") // Explicitly allow cross-port/cross-site fetch
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of("error", false, "message", "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {

        ResponseCookie deleteCookie = ResponseCookie
                .from("access_token", "")
                .httpOnly(true)
                .secure(true)     // true in prod (HTTPS)
                .path("/")
                .maxAge(0)         //expires immediately
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok(
                Map.of(
                        "error", false,
                        "message", "Logged out successfully"
                )
        );
    }
}
