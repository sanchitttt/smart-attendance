# Next.js Basics and Interview Questions

Next.js is a React framework for building web applications. It adds routing, server-side rendering options, data-loading patterns, and conventions for organizing a React project.

Smart Attendance uses the Next.js App Router for its teacher-facing web app.

## 1. React plus application structure

Next.js uses React components to build the interface. React describes reusable UI; Next.js adds an application structure for routes, layouts, rendering, and server behavior.

## 2. App Router and file-based routes

In the **App Router**, files and folders inside `app` define routes and shared layouts.

- `app/page.tsx` defines a page at the root route.
- `app/classes/page.tsx` defines the `/classes` route.
- `app/classes/[id]/page.tsx` defines a dynamic route where `[id]` is a variable segment.
- `layout.tsx` provides UI shared by pages within its route segment.

This project uses route groups such as `frontend-web/app/(teacher)/`. Parentheses group routes for organization without adding that group name to the URL.

## 3. Pages, layouts, and navigation

A **page** is the UI for a URL. A **layout** wraps pages and can keep shared elements such as navigation in place while moving between pages.

Use Next.js navigation components and APIs for app navigation rather than forcing a full browser reload for every internal link. The teacher dashboard uses Next.js routing to open class and dispute pages.

## 4. Server and Client Components

In the App Router, pages and layouts are Server Components by default. They can load data on the server and keep server-only values away from the browser bundle. A **Client Component** is needed when UI requires browser interaction such as React state, event handlers, effects, or browser APIs. It is marked with `'use client'` at the top of the module.

The two kinds can be composed: a server-rendered page can load information and pass it as props to a smaller interactive client component. This is how the teacher classes page passes class and summary data to `ClassesUI`.

Being a Client Component does not mean it can never be pre-rendered as HTML on the server. It means its interactive JavaScript also runs in the browser.

## 5. Data fetching and rendering choices

Next.js can load data on the server or in a Client Component, depending on the use case. Server-side loading is useful when the page should have data before it is returned or when secrets must stay on the server. Client-side loading is useful when data depends on browser interaction or needs refreshing after the page is open.

Rendering and caching behavior should be chosen deliberately. A page with public, rarely changing content may be cached or pre-rendered; user-specific or frequently changing data may need a fresh request. In this project, the teacher dashboard requests fresh timetable data rather than reusing a cached response.

## 6. Loading, errors, and missing pages

Next.js supports route-level conventions for showing loading UI, handling errors, and displaying not-found pages. These make the experience clearer while data is loading or when a route cannot be served.

An API or page can still fail, so applications should handle expected errors and communicate them clearly. Do not show a missing value as if it were a real zero or success.

## 7. Client-side interactivity and React state

Client Components can use React Hooks such as `useState` and `useEffect`. State can hold a selected filter or loading indicator; event handlers respond to clicks and changes. Keep the client portion focused so unnecessary components do not need browser JavaScript.

## 8. Route Handlers and Server Actions

Next.js **Route Handlers** let an application define HTTP endpoints using files in the App Router. **Server Actions / Server Functions** can handle server-side mutations initiated from the UI. They are tools for specific architectures; a Next.js app can also call a separate backend API, as this project does.

## 9. Authentication and cookies

Authentication in a web application involves both identifying the user and protecting server-side data. A browser cookie can be sent with requests and can be marked `HttpOnly` so page JavaScript cannot read its value directly. Cookie settings, authorization checks, and safe handling of cross-site requests still matter.

Do not expose private API keys or signing secrets in values sent to the browser. In Next.js, public environment variables are intended to be included in client-side code; private values should stay on the server.

## 10. Metadata and styling

Next.js provides conventions for page metadata such as titles and descriptions. Styling can use CSS, CSS Modules, utility classes, or other supported approaches. Smart Attendance uses Tailwind CSS and page metadata in its teacher routes.

## 11. Deployment and production

The development server is for local work. A production build and runtime may behave differently, especially around environment variables, caching, and server-only code. Validate configuration and rendering behavior in the deployment environment rather than assuming development behavior is identical.

## Concept-based interview questions

### What does Next.js provide beyond React?

It adds a routing system, server rendering options, conventions for data loading and layouts, and production application features around React.

### What is file-based routing?

The folder and file structure defines which URLs the application can serve. This makes routes visible in the project organization.

### What is the purpose of a layout?

A layout contains shared UI around pages in a route segment, such as a common header or navigation, reducing repetition and keeping the application consistent.

### When would you use a Server Component versus a Client Component?

Use a Server Component when data can be loaded on the server or when code should not be sent to the browser. Use a Client Component when interaction requires state, event handlers, effects, or browser APIs.

### What is hydration?

Hydration is the process where client-side React attaches behavior such as event handlers to HTML that was already rendered. It makes the initial server-rendered page interactive.

### What are the trade-offs of server-side rendering?

It can provide data-filled HTML sooner and keep server-only logic private, but it uses server work and requires careful handling of latency, caching, and request-specific data.

### Why is caching important in a web application?

Caching can reduce repeated work and speed up responses. But caching user-specific or frequently changing information incorrectly can show stale or private data to the wrong person.

### How should a Next.js page handle a slow data request?

Provide a loading state or stream content where appropriate, handle failures, and choose caching behavior that matches how fresh the data needs to be.

### What is the difference between a Route Handler and calling a separate backend API?

A Route Handler is an endpoint implemented within the Next.js app. A separate backend API is hosted by another service. The client can call either, depending on where business logic and data access belong.

### Why should private environment variables stay on the server?

Anything bundled into browser code can be inspected by users. Secrets must stay in server-only code and configuration.

### How do dynamic routes help?

They let one page pattern serve many related URLs by using a path segment as a parameter, such as a class ID or student identifier.

## Project examples and further reading

- Teacher classes page (server page): `frontend-web/app/(teacher)/classes/page.tsx`
- Interactive dashboard (client component): `frontend-web/app/components/ClassesUI.tsx`
- Teacher route layout: `frontend-web/app/(teacher)/classes/layout.tsx`
- [Next.js App Router: Getting Started](https://nextjs.org/docs/app/getting-started)
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js: Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)

