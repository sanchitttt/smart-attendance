package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.TeacherClassTileDTO;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.exception.NotFoundException;
import com.sanchit.smart_attendance.repository.*;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final SessionRepository sessionRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AdminRepository adminRepository;
    private final SemesterRepository semesterRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    private DayOfWeekEnum toDbDay(java.time.DayOfWeek javaDay) {
        return switch (javaDay) {
            case MONDAY -> DayOfWeekEnum.MON;
            case TUESDAY -> DayOfWeekEnum.TUE;
            case WEDNESDAY -> DayOfWeekEnum.WED;
            case THURSDAY -> DayOfWeekEnum.THU;
            case FRIDAY -> DayOfWeekEnum.FRI;
            case SATURDAY -> DayOfWeekEnum.SAT;
            default -> throw new IllegalStateException(
                    "No timetable on Sunday"
            );
        };
    }

    public Map<String, Object> getMyClasses(Long adminId) {

        // Hardcoded for testing
        LocalDate today = LocalDate.of(2026, 2, 5); // Thursday
        String day = "THU"; // or convert from LocalDate
        System.out.println("Reached jii" + Math.random());
        List<TeacherClassTile> rows =
                timetableEntryRepository
                        .findTeacherClassesForDay(4L, day); // todo: change 4 to adminID;

        List<Map<String, Object>> tiles = rows.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("timetableID", r.getTimetableID());
            m.put("teacherName", r.getAdminName());
            m.put("program", r.getProgramName());
            m.put("batch", r.getStartYear() + "-" + r.getEndYear());
            m.put("semester", r.getSemester());
            m.put("subject", r.getSubjectName());
            m.put("timeSlot",
                    r.getStartTime() + " - " + r.getEndTime());
            m.put("status", r.getStatus()); // old / current / upcoming
            return m;
        }).toList();

        return Map.of(
                "classes", tiles
        );
    }

    public TeacherClassTileDTO getClassById(
            Long timetableEntryId,
            Long adminId,
            Long sessionId
    ) {

        TeacherClassTile tile =
                timetableEntryRepository
                        .findTeacherClassByTimetableEntryId(
                                timetableEntryId,
                                adminId
                        )
                        .orElseThrow(() ->
                                new BadRequestException("Class not found"));
        TeacherClassTileDTO cls = new TeacherClassTileDTO(tile);
        if (sessionId != null) {

            Session session =
                    sessionRepository
                            .findById(sessionId)
                            .orElseThrow(() ->
                                    new NotFoundException("Session not found"));

            // Ensure session belongs to this timetable entry
            if (!session.getTimetableEntry()
                    .getTimetableEntryId()
                    .equals(timetableEntryId)) {
                throw new NotFoundException("Session not found");
            }

            if (session.getStartedAt() != null) {

                long secondsElapsed =
                        Duration.between(session.getStartedAt(), LocalDateTime.now())
                                .getSeconds();

                if (secondsElapsed > 32) {
                    session.setStatus(SessionStatus.CLOSED);
                }
            }

            cls.setSessionStatus(session.getStatus().name());
        }

        return cls;
    }
}