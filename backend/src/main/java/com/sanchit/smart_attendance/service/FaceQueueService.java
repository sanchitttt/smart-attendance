package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.FaceVerificationRequest;
import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import com.sanchit.smart_attendance.repository.FaceRecognitionQueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class FaceQueueService {

    @Autowired
    private FaceRecognitionQueueRepository repository;

    public Long createJob(Long userId, Long sessionId, String imagePath) {

        FaceRecognitionQueue job = new FaceRecognitionQueue();
        job.setUserId(userId);
        job.setSessionId(sessionId);
        job.setImagePath(imagePath);
        job.setStatus(FaceQueueStatus.PENDING);
        job.setCreatedAt(LocalDateTime.now());

        repository.save(job);

        return job.getQueueId();
    }

    public Map<String, Object> getStatus(Long id) {
        FaceRecognitionQueue job = repository.findById(id).orElseThrow();

        return Map.of(
                "status", job.getStatus(),
                "failure_reason", job.getFailureReason()
        );
    }
}
