package com.sanchit.smart_attendance.service;

import com.sanchit.smart_attendance.dto.TeacherClassTileDTO;
import com.sanchit.smart_attendance.entity.Session;
import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import com.sanchit.smart_attendance.enums.SessionStatus;
import com.sanchit.smart_attendance.exception.BadRequestException;
import com.sanchit.smart_attendance.exception.NotFoundException;
import com.sanchit.smart_attendance.repository.*;
import com.sanchit.smart_attendance.repository.projection.TeacherClassTile;
import com.sanchit.smart_attendance.repository.projection.TimetableSummaryRow;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final SessionRepository sessionRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final AdminRepository adminRepository;
    private final SemesterRepository semesterRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    @Autowired
    EnvironmentService environmentService;

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

    @Value("${app.dev.admin-id:0}")
    private Long devAdminId;

    public Map<String, Object> getMyClasses(Long adminId) {
        LocalDate today =
                environmentService.isDevelopment()
                ? LocalDate.of(2026, 4, 9):
                LocalDate.now();

        String day = today.getDayOfWeek().name().substring(0, 3);

        List<TeacherClassTile> rows =
                timetableEntryRepository
                        .findTeacherClassesForDay(environmentService.isDevelopment() ? devAdminId : adminId, day);

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

            // New check: created 5 minutes ago
            if (session.getCreatedAt() != null) {

                long minutesSinceCreation =
                        Duration.between(session.getCreatedAt(), LocalDateTime.now())
                                .toMinutes();

                if (minutesSinceCreation >= 5) {
                    session.setStatus(SessionStatus.CLOSED);
                }
            }

            cls.setSessionStatus(session.getStatus().name());
        }

        return cls;
    }

    public Map<String, Object> getTimetableSummary(Long adminId) {
        Long effectiveAdminId = environmentService.isDevelopment() ? devAdminId : adminId;
        List<TimetableSummaryRow> rows = timetableEntryRepository.findTimetableSummaryByAdminId(effectiveAdminId);

        if (rows.isEmpty()) {
            return Map.of(
                    "totalClassesConducted", 0,
                    "averageAttendance", 0,
                    "atRiskStudents", 0,
                    "courseSummaries", List.of()
            );
        }

        Map<String, CourseAggregate> courseMap = new HashMap<>();
        for (TimetableSummaryRow row : rows) {
            if (row.getCourse() == null) continue;

            CourseAggregate aggregate = courseMap.computeIfAbsent(
                    row.getCourse(),
                    key -> new CourseAggregate()
            );

            aggregate.totalClasses = row.getTotalClasses() == null ? 0 : row.getTotalClasses();
            aggregate.averageAttendance = row.getAverageAttendance() == null ? 0.0 : row.getAverageAttendance();
            aggregate.atRiskStudents = row.getAtRiskStudents() == null ? 0 : row.getAtRiskStudents();

            if (row.getDate() != null) {
                Map<String, Object> trendPoint = new HashMap<>();
                trendPoint.put("date", row.getDate().toString());
                trendPoint.put("count", row.getCount() == null ? 0 : row.getCount());
                aggregate.trend.add(trendPoint);
            }
        }

        List<Map<String, Object>> courseSummaries = courseMap.entrySet().stream().map(entry -> {
            CourseAggregate aggregate = entry.getValue();
            Map<String, Object> item = new HashMap<>();
            item.put("course", entry.getKey());
            item.put("totalClasses", aggregate.totalClasses);
            item.put("averageAttendance", aggregate.averageAttendance);
            item.put("atRiskStudents", aggregate.atRiskStudents);
            item.put("trend", aggregate.trend);
            return item;
        }).toList();

        int totalClassesConducted = courseMap.values().stream()
                .map(aggregate -> aggregate.totalClasses)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        double averageAttendance = courseMap.values().stream()
                .map(aggregate -> aggregate.averageAttendance)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);

        int atRiskStudents = courseMap.values().stream()
                .map(aggregate -> aggregate.atRiskStudents)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        return Map.of(
                "totalClassesConducted", totalClassesConducted,
                "averageAttendance", Math.round(averageAttendance * 100.0) / 100.0,
                "atRiskStudents", atRiskStudents,
                "courseSummaries", courseSummaries
        );
    }

    private static class CourseAggregate {
        Integer totalClasses = 0;
        Double averageAttendance = 0.0;
        Integer atRiskStudents = 0;
        List<Map<String, Object>> trend = new ArrayList<>();
    }
}