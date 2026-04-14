package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.PythonClientApiResponse;
import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import com.sanchit.smart_attendance.repository.AttendanceRepository;
import com.sanchit.smart_attendance.repository.FaceRecognitionQueueRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class FaceQueueService {
    private static final Logger log = LoggerFactory.getLogger(WorkerService.class);
    public static final String PENDING_IMAGE_PATH = "PENDING_UPLOAD";

    @Autowired
    private FaceRecognitionQueueRepository repository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PythonClientService pythonService;


    public Long createJob(Long userId, Long sessionId) {

        FaceRecognitionQueue job = new FaceRecognitionQueue();
        job.setUserId(userId);
        job.setSessionId(sessionId);
        job.setImagePath(PENDING_IMAGE_PATH);
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

    @Transactional
    @Async
    public void processAsync(Long jobId) {
        processJob(jobId);
    }

    @Transactional
    public void processJob(Long jobId) {
        FaceRecognitionQueue job = repository.findById(jobId)
                .orElseThrow();

        if (job.getStatus() != FaceQueueStatus.PENDING) return;


        try {
//            log.info("🔄 Processing job: id={}, userId={}, sessionId={}",
//                    job.getQueueId(), job.getUserId(), job.getSessionId());

            job.setStatus(FaceQueueStatus.PROCESSING);
            repository.save(job);

//            System.out.println("Reached1");
//            log.debug("📤 Calling Python service for jobId={}", job.getQueueId());

            PythonClientApiResponse response = pythonService.verifyFace(job);
//            System.out.println("Reached2");

            log.info("📥 Full response: {}", response);

            log.info("📥 Python response for jobId={}: success={}, message={}",
                    job.getQueueId(), response.isSuccess(), response.getMessage());
//            System.out.println("Reached3");

            if (response.isSuccess()) {
                job.setStatus(FaceQueueStatus.SUCCESS);
//                System.out.println("Reached4");

                attendanceRepository.updateScores(
                        job.getUserId(),
                        job.getSessionId(),
                        response.getLivenessScore(),
                        response.getSimilarity(),
                        response.getVerified()
                );
                log.info("✅ Job SUCCESS: id={}, similarity={}, liveness={}"
                );

            } else {
//                System.out.println("Reached5");
                job.setStatus(FaceQueueStatus.FAILED);
                job.setFailureReason(response.getMessage());

                log.warn("❌ Job FAILED (business): id={}, reason={}",
                        job.getQueueId(), response.getMessage());
                System.out.println("Reached6");
            }

        } catch (Exception e) {
//            System.out.println("Reached7");
            job.setStatus(FaceQueueStatus.FAILED);
            job.setFailureReason(e.getMessage());

            log.error("💥 Job FAILED (exception): id={}, error={}",
                    job.getQueueId(), e.getMessage(), e);
        }

        job.setProcessedAt(LocalDateTime.now());
        repository.save(job);

    }
}
