package com.sanchit.smart_attendance.repository;


import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceRecognitionQueueRepository
        extends JpaRepository<FaceRecognitionQueue, Long> {

    List<FaceRecognitionQueue>
    findTop10ByStatusOrderByCreatedAtAsc(FaceQueueStatus status);
}
