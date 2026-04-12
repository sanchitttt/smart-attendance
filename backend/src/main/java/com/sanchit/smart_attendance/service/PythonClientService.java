package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.PythonClientApiResponse;
import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Map;


@Service
public class PythonClientService {

    private static final Logger log = LoggerFactory.getLogger(WorkerService.class);
    private final UserService userService;

    public PythonClientService(UserService userService) {
        this.userService = userService;
    }



    private final RestTemplate restTemplate = new RestTemplate();

    public PythonClientApiResponse verifyFace(FaceRecognitionQueue job) {
        try{
            String url = "http://localhost:8089/verify-face";

            String referencePath = userService.getReferencePath(job.getUserId());

//            System.out.println("Calling verifyFace for " + job.getImagePath());
            Map<String, Object> body = Map.of(
                    "reference_image_path", referencePath, // 🔥 add this
                    "captured_image_base64", convertToBase64(job.getImagePath())
            );
            String base64 = body.get("captured_image_base64").toString();

//            log.info("📤 Sending request → jobId={}, referencePath={}",
//                    job.getQueueId(), referencePath);

//            log.info("📦 Base64 size={}, preview={}...",
//                    base64.length(),
//                    base64.substring(50, Math.min(250, base64.length())));


            String rawResponse = restTemplate.postForObject(url, body, String.class);

//            log.debug("📥 RAW Python response for jobId={}: {}",
//                    job.getQueueId(), rawResponse);

            return restTemplate.postForObject(url, body, PythonClientApiResponse.class);
        }
        catch(Exception e){
            System.out.println("Error occured in calling python service! " + e.getMessage());
            return null;
        }
    }

    private String convertToBase64(String path) {
        try {
            byte[] bytes = Files.readAllBytes(Paths.get(path));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Image conversion failed");
        }
    }
}