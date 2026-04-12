package com.sanchit.smart_attendance.repository;


import com.sanchit.smart_attendance.entity.FaceRecognitionQueue;
import com.sanchit.smart_attendance.enums.FaceQueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceRecognitionQueueRepository
        extends JpaRepository<FaceRecognitionQueue, Long> {

    List<FaceRecognitionQueue>
    findTop10ByStatusOrderByCreatedAtAsc(FaceQueueStatus status);


    @Query(value = """
        SELECT * FROM face_recognition_queue
        WHERE status = 'PENDING'
        ORDER BY created_at
        LIMIT :limit
        FOR UPDATE SKIP LOCKED
    """, nativeQuery = true)
    List<FaceRecognitionQueue> fetchPendingJobs(@Param("limit") int limit);

    @Modifying
    @Query(value = """
        UPDATE face_recognition_queue
        SET status = 'PENDING'
        WHERE status = 'PROCESSING'
        AND created_at < NOW() - INTERVAL 2 MINUTE
    """, nativeQuery = true)
    void resetStuckJobs();
}
