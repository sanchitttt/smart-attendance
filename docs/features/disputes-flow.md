# Attendance Disputes Flow

This guide explains how a student can ask for a failed face-scan attendance record to be reviewed and how a teacher handles that request.

## What a dispute is

A dispute is a review request. If the face-verification process marks an attendance record as failed, the student can ask a teacher to review it. The teacher sees the student's submitted selfie alongside the student's reference image, then approves or denies the request.

## The flow at a glance

1. A student opens a subject's attendance history in the mobile app.
2. The student selects the failed attendance record and submits a dispute request.
3. The backend checks that the record belongs to that student, that it failed face verification, and that a dispute has not already been submitted for it.
4. The request is saved with a **PENDING** status.
5. A teacher opens the Disputes page, finds the request, and compares the two images.
6. The teacher approves or denies the request.
7. The request is saved as **APPROVED** or **REJECTED**. If approved, the attendance record is updated as face-verification successful.

## Student side

The subject history modal is `mobile/components/home/SubjectHistoryModel.tsx`. It requests a student's attendance history from `GET /api/v1/attendance/subject-history`. For a dispute, it sends `POST /api/v1/attendance/disputes` with the attendance record ID and a reason. The student is identified using the backend token in the request's `Authorization` header.

The API routes are listed in `mobile/constants/api-config.ts`. The endpoint is handled by `AttendanceController` and the rules are implemented in `AttendanceService`, both in `backend/src/main/java/com/sanchit/smart_attendance`.

## Teacher side

The teacher's dispute inbox is `frontend-web/app/(teacher)/disputes/page.tsx`. It loads requests from `GET /api/v1/attendance/disputes/all` and offers status filters and a name search. `frontend-web/app/components/attendance/DisputeRequestsPanel.tsx` displays the student and subject details plus the submitted selfie and reference image. Pending requests include Approve and Deny actions from `frontend-web/app/components/attendance/DisputeReviewActions.tsx`.

The review action sends the teacher's decision to `POST /api/v1/attendance/disputes/{disputeId}/review`. The backend checks that the dispute belongs to a class managed by that teacher. On approval, it changes the attendance record's face-verification result to successful; on denial, the record is not changed to successful. The dispute status and review time are saved either way.

## What the backend checks

`AttendanceService.createDispute` enforces the main rules:

- The request must include an attendance record ID.
- The record must belong to the student who is making the request.
- The face scan must not already be successful.
- A selfie for the failed verification must exist so the teacher has evidence to review.
- The same attendance record cannot have a second dispute.

During review, the backend accepts only an **APPROVE** or **DENY** decision and verifies that the teacher is responsible for the associated class. The decision is stored using dispute statuses `PENDING`, `APPROVED`, and `REJECTED`.

## Key terms

- **Dispute:** A request to have a record or decision reviewed.
- **Attendance record:** The stored result for one student's attendance in one class session.
- **Face verification:** The step that checks whether a submitted selfie matches the student's enrolled reference data.
- **Reference (master) image:** The stored face image used as the comparison reference.
- **Pending:** The request has been submitted and is waiting for a teacher.
- **Approve / deny:** The teacher's decision. In the saved status, denial is represented as `REJECTED`.
- **Validation:** Checks that input is complete and the action is allowed. The backend validates ownership and failed status so a student cannot dispute another student's attendance or a successful face scan.
- **HTTP POST:** A request method used to submit or change information on the server. The student uses it to create a dispute; the teacher uses it to submit a decision.
- **`useState`:** A React Hook for remembering a value while a component is open. The review buttons use it to remember whether a decision is being submitted and temporarily disable the buttons.
- **`try` / `catch` / `finally`:** JavaScript structure for handling work that may fail. `catch` handles errors; `finally` runs at the end to reset loading state.

## A simple way to explain it in an interview

> “The dispute flow gives students a way to request a review when face verification fails. The backend checks that the failed record belongs to that student and prevents duplicate requests. A teacher compares the submitted selfie with the reference image, then approves or denies the request. Approval updates the attendance record.”

## Concept-based interview questions

### Why have a dispute process in an attendance system?

Automated checks can make mistakes. A review process gives a student a way to raise a concern and a teacher a way to resolve it with context and evidence.

### Why should the backend verify who owns an attendance record?

The client can be modified or send arbitrary IDs. The backend must enforce that a student can request a review only for their own record.

### Why prevent duplicate disputes for the same record?

It avoids multiple competing review requests for one event and keeps the teacher's queue clear. A single request can move through pending and reviewed states.

### Why show both the submitted selfie and reference image?

The teacher needs context for the face-verification result. Seeing both images supports a more informed review than seeing only a status label.

### What is the difference between a dispute's status and an attendance result?

The dispute status tracks the review process—pending, approved, or rejected. The attendance result tracks whether the student is counted as present. They are related, but they describe different things.

### What should happen when a teacher approves a dispute?

The system should record who reviewed it and when, update the dispute's status, and apply the chosen attendance correction consistently so later summaries reflect the decision.

### How can a dispute workflow be made fair and auditable?

Keep the original record and review history, show the reviewer relevant evidence, record the decision and time, and limit access to the students and teachers involved.

### How should errors be handled when a dispute is submitted or reviewed?

Tell the user whether the request succeeded, prevent accidental duplicate submissions while it is processing, and preserve the existing record if the server cannot complete the operation.

