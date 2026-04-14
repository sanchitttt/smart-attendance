package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import com.sanchit.smart_attendance.repository.AttendanceRepository;
import com.sanchit.smart_attendance.repository.FaceRecognitionQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class WorkerService {

    private static final Logger log = LoggerFactory.getLogger(WorkerService.class);

    @Autowired
    private FaceRecognitionQueueRepository repository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PythonClientService pythonService;

    @Autowired
    private FaceQueueService faceQueueService;


    @Async
    public void prepareAndProcessAsync(Long jobId, byte[] selfieImageBytes, String originalFileName, String rollNumber, Long sessionId) {
        FaceRecognitionQueue job = repository.findById(jobId)
                .orElseThrow();

        try {
            String imagePath = saveSelfie(selfieImageBytes, originalFileName, rollNumber, sessionId);
            job.setImagePath(imagePath);
            repository.save(job);
        } catch (Exception e) {
            job.setStatus(FaceQueueStatus.FAILED);
            job.setFailureReason(e.getMessage());
            job.setProcessedAt(LocalDateTime.now());
            repository.save(job);
            return;
        }

        faceQueueService.processJob(jobId);
    }


    private String saveSelfie(byte[] imageBytes, String originalFileName, String rollNumber, Long sessionId) {
        try {
            String extension = ".jpg";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = rollNumber + "_" + "SID-" + sessionId + "_" + UUID.randomUUID() + extension;
            Path uploadPath = Paths.get("uploads/faces");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, imageBytes);
            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to save selfie", e);
        }
    }
}