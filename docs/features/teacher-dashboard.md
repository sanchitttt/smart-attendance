# Teacher Dashboard

This guide explains the **My Classes** dashboard in plain language. It is intended for someone new to the project.

## What the dashboard is for

The dashboard is the teacher's starting page. It combines the teacher's classes with a quick attendance overview. From here, a teacher can open a class, start an attendance session, review disputes, or view students whose attendance is at risk.

## What appears on the page

- A welcome message and today's date.
- A summary of classes conducted, average attendance, and students at attendance risk.
- A course selector that filters the summary to one course or all courses.
- A line chart showing student attendance counts over class dates for each course.
- Class cards with subject, program, semester, time, batch, and class status.
- Links to dispute review and the at-risk student list.
- A **Take Attendance** button on class cards that can start a session.

The chart's vertical values are student attendance counts for a class date. It is not a percentage chart.

## How the data gets to the dashboard

The page in `frontend-web/app/(teacher)/classes/page.tsx` requests two sets of information from the backend:

1. `GET /api/v1/timetable/class/all` returns class cards for the teacher.
2. `GET /api/v1/timetable/summary` returns attendance totals, averages, at-risk counts, and trend data grouped by course.

The URLs are named in `frontend-web/app/config/api.routes.ts`. The backend routes are in `backend/src/main/java/com/sanchit/smart_attendance/controller/TimetableController.java`; `backend/src/main/java/com/sanchit/smart_attendance/service/TimetableService.java` fetches and shapes the data. The page passes the results into `frontend-web/app/components/ClassesUI.tsx`, which displays the summary, chart, and cards.

The dashboard asks for fresh data each time the page loads. If the backend says the teacher's session is unauthorized or expired, the page sends the teacher to sign in again.

## When a teacher selects “Take Attendance”

The button sends a request to create a session for the selected class. If the backend returns a session ID, the browser opens that class's attendance page. The attendance page contains the tools to generate a QR code and view students checking in. While the request is running, the button shows a loading state to discourage repeated clicks.

## Key terms

- **Backend:** The server that stores and processes attendance and class information.
- **API endpoint:** A URL the app calls to ask the backend for data or request an action.
- **Props:** Values one React component passes to another. Here, the page passes class and summary data to `ClassesUI`.
- **Server component:** A Next.js page that can fetch data before returning the page. `ClassesPage` is an async server component.
- **Client component:** A component that runs in the browser and can respond to clicks and selections. `ClassesUI` is marked with `'use client'` because its controls are interactive.
- **`useState`:** A React Hook that remembers a value while a component is open. `ClassesUI` uses it to remember the selected course and whether a session is being created. Updating state redraws the component with the new value.
- **`useMemo`:** A React Hook that can reuse a calculated value until its inputs change. The dashboard uses it to parse summary data and prepare chart data; it does not make a network request.
- **`.map(...)`:** JavaScript array operation used to create a display item for each class or course.
- **401/403 response:** HTTP statuses that mean the request is not authorized. The dashboard redirects to login when these indicate an expired or invalid teacher session.

## A simple way to explain it in an interview

> “The teacher dashboard brings together the teacher’s classes and attendance summary. It shows class details, average attendance, students at risk, and attendance trends by course. The teacher can filter the summary, open supporting views, or start an attendance session from a class.”

## Concept-based interview questions

### Why show an attendance dashboard instead of only a list of classes?

It gives the teacher a quick overview of attendance patterns and helps them decide where to look next, while the class list still provides access to individual sessions.

### How would you calculate an overall attendance percentage?

Divide the number of class attendances recorded as present by the total number of classes, then multiply by 100. Be clear about whether the displayed average is a simple average across courses or a weighted average across all class records; those can differ.

### What is the purpose of filtering the summary by course?

It lets a teacher focus on one subject's metrics without losing the all-course overview. The selected course should affect the relevant summary and chart consistently.

### Why might a dashboard need to refresh its data?

Attendance changes as classes happen and records are processed. Refreshing helps the teacher see the latest information instead of a stale snapshot.

### What should the dashboard do if the data request fails?

It should communicate the problem clearly, avoid presenting missing data as real zeroes, and offer a reasonable recovery path such as retrying or signing in again if the session expired.

### Why create an attendance session before showing a QR code?

The session gives each class meeting a distinct record. Attendance scans can then be associated with the correct class and meeting.

### What makes a dashboard chart useful?

It should answer a specific question, label its axes and units clearly, and make comparisons easy. Here, the trend chart compares attendance counts across class dates and courses.

