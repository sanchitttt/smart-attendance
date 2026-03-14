package com.sanchit.smart_attendance.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class HmacService {

    private static final String SECRET = "super-secret-key-change-this";

    public String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key =
                    new SecretKeySpec(SECRET.getBytes(), "HmacSHA256");
            mac.init(key);
            return Base64.getEncoder()
                    .encodeToString(mac.doFinal(data.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign QR", e);
        }
    }
}

