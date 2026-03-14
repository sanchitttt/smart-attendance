package com.sanchit.smart_attendance.entity;

import com.sanchit.smart_attendance.enums.DayOfWeekEnum;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(
        name = "timetable_entries",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"admin_id", "day_of_week", "time_slot_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long timetableEntryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Admin admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)   // 🔥 THIS IS THE FIX
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeekEnum dayOfWeek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;
}
