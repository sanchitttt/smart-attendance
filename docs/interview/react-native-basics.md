# React Native Basics and Interview Questions

React Native is a framework for building mobile apps with React and JavaScript or TypeScript. It reuses React ideas such as components, props, state, and Hooks, while providing native mobile UI components and APIs.

Smart Attendance uses React Native with Expo for its student mobile app.

## 1. How React Native works at a basic level

You describe the screen with React components. React Native renders those components using native platform UI, rather than rendering HTML in a browser. Much of the app logic can be shared across iOS and Android, but platform-specific behavior can still require separate choices or code.

Common core components include:

- **`View`**: a container for arranging other components; similar in purpose to a web `div`.
- **`Text`**: displays text; text must be placed inside a text component.
- **`Image`**: displays an image.
- **`TextInput`**: accepts typed input.
- **`ScrollView`**: scrolls a bounded collection of content.
- **`FlatList`**: renders larger lists efficiently by creating visible rows as needed.

For example, the student home screen uses `View`, `Text`, and `ScrollView` in `mobile/app/home.tsx`.

## 2. React concepts still apply

React Native uses components, props, state, and Hooks in the same general way as React for the web. `useState` can store a selected subject or loading indicator; `useEffect` can load data when a screen appears; props pass data into reusable components.

If you understand React first, many React Native concepts will feel familiar. The main difference is the platform UI and device APIs.

## 3. Styling and layout

Styles are JavaScript objects rather than CSS files or browser stylesheets. React Native supports a subset of CSS-like properties, with some differences in naming and behavior. Layout is commonly built with **Flexbox**.

```tsx
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Text>Attendance</Text>
</View>
```

Styles may be defined inline or with `StyleSheet.create`. Dimensions often use density-independent units. Check layouts on different screen sizes rather than assuming every phone has the same dimensions.

## 4. Navigation

Mobile apps usually move between screens through a navigation library. This project uses Expo Router, which builds navigation from files inside `mobile/app`.

- `mobile/app/login.tsx` is the login screen.
- `mobile/app/home.tsx` is the student home screen.
- `mobile/app/scan.tsx` is the QR scan screen.
- `router.push(...)` opens another screen and keeps the current screen in navigation history.
- `router.replace(...)` navigates while replacing the current history entry, often useful after login or logout.

Navigation is different from simply showing and hiding a component: it changes the current screen and may affect the Back action.

## 5. Device features and permissions

Mobile apps can use device capabilities such as camera, location, haptics, and secure storage. Access may require platform configuration and user permission. The app should explain why a permission is needed and handle the case where it is denied.

The student attendance flow uses the camera to scan a QR code and location during attendance. Expo provides libraries that wrap many native device features, but a library call does not remove the need to think about permissions, unavailable hardware, and platform differences.

## 6. Network requests and request states

An app can use `fetch` to call a backend API. Because a request can take time or fail, the screen should represent its state: loading, success, empty, or error. `async` and `await` make asynchronous request code easier to read.

When a request needs authentication, the app sends a credential, such as a bearer token, in the request. Sensitive values should be stored using an appropriate secure storage mechanism rather than an ordinary UI state value.

## 7. Lists and performance

Use `ScrollView` for a bounded amount of content that can be rendered together. Use `FlatList` for larger or changing lists because it can render rows as they become visible. Supply stable keys for list items.

Avoid unnecessary work on every render, especially for long lists or expensive image processing. Measure before optimizing, and consider image size, list virtualization, and component boundaries.

## 8. Safe areas, keyboards, and app lifecycle

Mobile screens must account for device details that web pages may not have, such as status bars, notches, safe areas, keyboards, screen rotation, and app backgrounding. Test on both platform types and different device sizes when possible.

When an app goes into the background or returns to the foreground, network or authentication state may have changed. Screens should avoid assuming that a previously loaded value is always current.

## 9. What Expo adds

Expo provides development tools and packages for common native capabilities, plus commands and configuration for building and running React Native apps. Some features run in a standard development client; others require native configuration or a custom development build. Follow the setup instructions for each Expo library used by the app.

## Concept-based interview questions

### What is the difference between React Native and a mobile web page?

React Native renders native mobile UI components and can access device capabilities through native APIs. A mobile web page renders HTML and CSS inside a browser.

### What can be shared between iOS and Android, and what may differ?

Business logic and many UI components can be shared. Device APIs, permissions, gestures, system navigation, and some platform conventions may differ and need to be handled or tested separately.

### When would you choose `FlatList` over `ScrollView`?

For a large or changing list, because `FlatList` can render visible items on demand. For a small, fixed amount of content, `ScrollView` may be simpler.

### Why do mobile apps ask for permissions?

Sensitive device features such as camera and location are controlled by the operating system. The app must request access and handle approval, denial, or later revocation.

### What is Expo, and does it replace React Native?

Expo is a set of tools and libraries built around React Native. It simplifies development and gives access to device capabilities, while React Native remains the framework used to build the interface.

### How should an app handle a slow API request?

Show a loading state, keep the interface responsive, prevent accidental duplicate actions where needed, and show a useful error with a retry option when appropriate.

### Why is secure storage important on mobile?

Authentication tokens can grant access to a user's data. Secure storage uses platform security features and is more suitable for sensitive credentials than ordinary preferences or temporary UI state.

### Why test on both iOS and Android?

The same shared code can behave differently because of platform APIs, permissions, screen layouts, and native UI conventions. Testing both helps find those differences early.

### What factors can make a mobile app feel slow?

Large lists rendered all at once, expensive calculations, large images, unnecessary rerenders, and slow network requests can all affect responsiveness.

## Project examples and further reading

- App navigation: `mobile/app/_layout.tsx`
- Student dashboard: `mobile/app/home.tsx`
- QR scanning flow: `mobile/app/scan.tsx`
- Google sign-in button: `mobile/components/login/google-sign-in-btn.tsx`
- [React Native fundamentals](https://reactnative.dev/docs/intro-react)
- [React Native core components and APIs](https://reactnative.dev/docs/components-and-apis)
- [Expo documentation](https://docs.expo.dev/)

