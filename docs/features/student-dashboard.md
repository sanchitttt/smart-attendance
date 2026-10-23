# Student Dashboard

This guide explains the student app's attendance dashboard in plain language. It is intended for someone new to the project.

## What the dashboard is for

The student dashboard helps a student understand their attendance at a glance. It summarizes attendance across subjects and provides a way to inspect the history for an individual subject.

## What appears on the screen

- The student's name, program, and roll number.
- An overall attendance percentage.
- A chart comparing attendance percentages by subject.
- A **Mark Attendance Now** button that opens the QR scanning flow.
- A card for each subject showing attended classes, total classes, percentage, status, and the most recent attendance date.
- A subject history modal when a subject card is selected.
- A pull-to-refresh gesture to request updated dashboard data.

## How the data gets to the dashboard

The screen is `mobile/app/home.tsx`. When it opens, `fetchDashboard` reads the student's backend token using `getToken()` from `mobile/utils/secureStore.ts`, then calls the dashboard endpoint defined as `API_CONFIG.DASHBOARD` in `mobile/constants/api-config.ts` (`GET /api/v1/users/dashboard`).

On the backend, `backend/src/main/java/com/sanchit/smart_attendance/controller/UserController.java` handles this endpoint and calls `UserService.getDashboard` in `backend/src/main/java/com/sanchit/smart_attendance/service/UserService.java`. The service returns subject attendance values such as attended classes, total classes, percentage, status, and last marked date.

The mobile screen stores the returned subject list in React state. It calculates the overall percentage by adding attended classes across subjects and dividing by the total classes across subjects. This is a weighted overall rate: a subject with more classes contributes more records to the total.

If a request fails in development mode, the screen currently uses sample dashboard data so the UI can still be viewed. In non-development mode, it displays an error message.

## What happens when a student opens a subject

Selecting a subject card opens `mobile/components/home/SubjectHistoryModel.tsx` (the filename says `Model`, although the component is a modal). The modal requests that subject's records from `GET /api/v1/attendance/subject-history`, then shows dates and statuses. The student can filter the history by status. The history also displays dispute status where one exists.

## Key terms

- **Dashboard:** A screen that summarizes important information and links to detailed views.
- **API endpoint:** A URL the app calls to retrieve data from the backend.
- **Backend token:** The credential the app includes with a request so the backend knows which signed-in student is asking.
- **State:** A value a React component remembers while it is open. Updating it refreshes the displayed UI.
- **`useState`:** A React Hook for creating state. For example, `useState<SubjectAttendance[]>([])` makes a state value for the subject list, initially an empty array. Its paired setter updates the list after data arrives.
- **`useEffect`:** A React Hook for running code after a component appears or when chosen values change. The dashboard uses it to load data when it first opens; the subject-history modal uses it to load records when opened for a subject.
- **`useCallback`:** A React Hook that keeps a function reference stable between renders when its dependencies do not change. The dashboard uses it for the refresh action.
- **`fetch`:** A browser or app API for making an HTTP request to a server.
- **`async` / `await`:** JavaScript syntax for waiting for a request or another time-consuming operation to finish.
- **Percentage:** A rate out of 100. If a student attended 18 of 24 classes, the rate is 18 ÷ 24 × 100 = 75%.
- **Weighted overall rate:** The overall percentage computed from total attended classes divided by total classes across subjects. This avoids treating a subject with 2 classes as equal in weight to one with 20 classes.
- **Pull to refresh:** A mobile gesture that asks the screen to fetch its data again.
- **Fallback sample data:** Example values shown in development when the real dashboard request fails. They are for development and should not be mistaken for a student's real attendance.

## A simple way to explain it in an interview

> “The student dashboard fetches attendance by subject and summarizes it with an overall percentage, subject cards, and a chart. Students can refresh the data, start a QR attendance scan, or open a subject to see the individual attendance dates and statuses.”

## Concept-based interview questions

### How should an overall attendance percentage be calculated?

Add all attended classes and divide by all classes, then multiply by 100. This is usually more representative than averaging each subject's percentage equally when subjects have different numbers of classes.

### Why show both a chart and subject cards?

The chart helps compare subjects quickly, while the cards provide exact details such as class counts, status, and last marked date.

### Why might the dashboard show a loading state?

The app needs time to retrieve data from the backend. A loading state tells the student the request is in progress instead of making the screen look empty or broken.

### What should happen if the dashboard request fails?

The app should show a clear error and a way to retry. Development-only sample data can help build the UI, but it should be clearly treated as sample data rather than actual attendance.

### Why allow students to open subject history?

The summary makes it easy to see the current picture; the history helps explain how that percentage came about by showing individual dates and statuses.

### How can a chart avoid confusing users?

Use a clear title, meaningful labels, and consistent scales. The user should know which subject each value represents and that percentages range from 0 to 100.

### What is the difference between authentication and authorization?

Authentication checks who the person is. Authorization checks what that person is allowed to access. The dashboard request needs both a valid signed-in session and permission to view the requesting student's own data.

