package com.sanchit.smart_attendance.security;

import com.sanchit.smart_attendance.entity.User;
import com.sanchit.smart_attendance.repository.UserRepository;
import com.sanchit.smart_attendance.security.enums.Role;
import com.sanchit.smart_attendance.security.principal.AdminPrincipal;
import com.sanchit.smart_attendance.security.principal.AppPrincipal;
import com.sanchit.smart_attendance.security.principal.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService,
                         UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        System.out.println("\n┌───────────────────────────────");
        System.out.println("│ JWT FILTER HIT");
        System.out.println("│ URI: " + request.getRequestURI());
        System.out.println("│ Method: " + request.getMethod());
        System.out.println("│ From: " + request.getHeader("Origin"));
        System.out.println("└───────────────────────────────");
        String token = resolveToken(request);
        if (token != null && jwtService.isTokenValid(token)) {

            Long id = jwtService.extractId(token);
            Role role = jwtService.extractRole(token);
            String email = jwtService.extractEmail(token);

            // 🔐 STUDENT-ONLY DEVICE VALIDATION
            if (role == Role.USER) {

                String tokenDeviceHash = jwtService.extractDeviceHash(token);

                User user = userRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                if (tokenDeviceHash == null ||
                        !tokenDeviceHash.equals(user.getDeviceIdHash())) {

                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Session invalid: device mismatch");
                    return;
                }
            }

            AppPrincipal principal =
                    (role == Role.ADMIN)
                            ? new AdminPrincipal(id, email)
                            : new UserPrincipal(id, email);


            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            ((UserDetails) principal).getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ") && !authHeader.endsWith("undefined")) {
            return authHeader.substring(7);
        }
        // Check Cookies FIRST
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                };
            }
        }

        return null;
    }
}
