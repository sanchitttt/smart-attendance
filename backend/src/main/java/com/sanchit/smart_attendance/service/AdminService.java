package com.sanchit.smart_attendance.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.sanchit.smart_attendance.dto.AdminLoginRequest;
import com.sanchit.smart_attendance.dto.CreateAdminRequest;
import com.sanchit.smart_attendance.dto.UserLoginResponse;
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

    public UserLoginResponse login(AdminLoginRequest request) {

        FirebaseToken decodedToken;

        try {
            decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
        } catch (FirebaseAuthException e) {
            throw new BadRequestException("Invalid Firebase token");
        }

        String email = decodedToken.getEmail();
        String name = decodedToken.getName();
        String profilePicture = decodedToken.getPicture();

        if (email == null || !email.endsWith("@nitkkr.ac.in")) {
            throw new BadRequestException("Unauthorized email domain");
        }

        String localPart = email.split("@")[0];

        //  Reject if numeric (student roll number)
//        if (localPart.matches("\\d+")) { // todo: uncomment in production
//            throw new BadRequestException("This login route is for admins only");
//        }

        Admin admin = adminRepository.findByEmail(email).orElseGet(() -> {

            Admin newAdmin = new Admin();
            newAdmin.setName(decodedToken.getName());
            newAdmin.setEmail(email);
            newAdmin.setPasswordHash("");
            newAdmin.setProfilePictureUrl(profilePicture);
            newAdmin.setPinHash("");
            newAdmin.setFailedPinAttempts(0);
            newAdmin.setIsLocked(false);

            return adminRepository.save(newAdmin);
        });

        if (admin.getIsLocked()) {
            throw new BadRequestException("Admin account locked");
        }

        if (profilePicture != null && !profilePicture.equals(admin.getProfilePictureUrl())) {
            admin.setProfilePictureUrl(profilePicture);
        }

        // store firebase token
        admin.setIdToken(request.getIdToken());

        adminRepository.save(admin);

        // generate your backend JWT
        String token = jwtService.generateToken(
                admin.getAdminId(),
                Role.ADMIN,
                admin.getEmail(),
                null // admins don't have device binding
        );

        return new UserLoginResponse(token, "ADMIN");
    }
}