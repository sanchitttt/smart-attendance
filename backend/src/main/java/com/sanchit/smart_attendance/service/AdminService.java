package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.AdminLoginRequest;
import com.sanchit.smart_attendance.dto.CreateAdminRequest;
import com.sanchit.smart_attendance.entity.Admin;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.repository.AdminRepository;
import com.sanchit.smart_attendance.security.JwtService;
import com.sanchit.smart_attendance.security.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AdminService(AdminRepository adminRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Admin createAdmin(CreateAdminRequest request) {

        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Admin already exists with this email");
        }

        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setPinHash(passwordEncoder.encode(request.getPin()));

        return adminRepository.save(admin);
    }

    public String login(AdminLoginRequest request) {

        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (admin.getIsLocked()) {
            throw new BadRequestException("Account is locked");
        }

        boolean passwordMatches =
                passwordEncoder.matches(request.getPassword(), admin.getPasswordHash());

        if (!passwordMatches) {
            admin.setFailedPinAttempts(admin.getFailedPinAttempts() + 1);

            if (admin.getFailedPinAttempts() >= 5) {
                admin.setIsLocked(true);
            }

            adminRepository.save(admin);
            throw new BadRequestException("Invalid email or password");
        }

        // reset failed attempts on success
        admin.setFailedPinAttempts(0);
        adminRepository.save(admin);

        return jwtService.generateToken(
                admin.getAdminId(),
                Role.ADMIN,
                admin.getEmail(),
                null
        );
    }
}