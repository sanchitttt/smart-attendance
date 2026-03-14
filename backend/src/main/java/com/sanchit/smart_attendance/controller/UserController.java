package com.sanchit.smart_attendance.controller;

import com.sanchit.smart_attendance.dto.CreateUserRequest;
import com.sanchit.smart_attendance.dto.UserLoginRequest;
import com.sanchit.smart_attendance.dto.UserLoginResponse;
import com.sanchit.smart_attendance.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(
            @RequestBody @Valid UserLoginRequest request
    ) {
        System.out.println("Reached login!!");
        return ResponseEntity.ok(
                userService.login(request)
        );
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(
            @RequestBody @Valid CreateUserRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }
}
