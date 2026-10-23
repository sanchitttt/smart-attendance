# React Basics and Interview Questions

React is a JavaScript library for building user interfaces. It helps developers split a screen into reusable pieces and update those pieces when data changes. Smart Attendance uses React in both its web app and mobile app.

## 1. Components

A **component** is a reusable part of the interface. It is usually a JavaScript or TypeScript function that returns JSX.

```tsx
function Welcome() {
  return <h1>Welcome to Smart Attendance</h1>;
}
```

Components can be composed: a page can contain a header, summary card, chart, and list, each built as a separate component. This makes code easier to reuse and maintain.

In this project, examples include `OverallAttendanceCard` in `mobile/components/home/OverallAttendanceCard.tsx` and `SubjectAttendanceCard` in `mobile/components/home/SubjectAttendanceCard.tsx`.

## 2. JSX

**JSX** is syntax that lets you describe UI in a form resembling HTML inside JavaScript or TypeScript. It is transformed into code React can use. Use `{}` to insert a JavaScript expression:

```tsx
<Text>Hello, {studentName}</Text>
```

JSX resembles HTML, but it is not exactly HTML. For example, React Native uses components like `<View>` and `<Text>` instead of web elements like `<div>` and `<p>`.

## 3. Props

**Props** are inputs passed from a parent component to a child component. They let the parent configure a reusable child.

```tsx
function AttendanceCard({ percentage }: { percentage: number }) {
  return <Text>{percentage}% attendance</Text>;
}

<AttendanceCard percentage={82} />
```

Props should be treated as read-only by the child. If a value needs to change in response to interaction, the component that owns the value should keep it in state and pass the current value or a callback down as props.

## 4. State and `useState`

**State** is information a component remembers between renders, such as text entered into a form, the selected subject, or whether a request is loading.

```tsx
const [count, setCount] = useState(0);
```

`useState` returns the current value (`count`) and a setter (`setCount`). Calling the setter asks React to render again with the updated value. Do not change objects or arrays in state directly; create a new object or array and set that instead.

Example in Smart Attendance: `mobile/app/home.tsx` keeps dashboard subjects and loading state with `useState`.

## 5. Rendering, events, and conditional UI

React **renders** a component to figure out what the UI should look like for its current props and state. When state or props change, React renders again and updates the necessary parts of the screen.

An **event handler** is a function that runs in response to an event such as a click or text change:

```tsx
<button onClick={() => setCount(count + 1)}>Add one</button>
```

**Conditional rendering** means showing different UI depending on a condition:

```tsx
{loading ? <Text>Loading...</Text> : <Dashboard />}
```

Loading, empty, success, and error states are useful because a network request does not always succeed immediately or return data.

## 6. Rendering lists and keys

Use JavaScript's `.map()` to turn an array into UI elements. Give each element a stable `key` so React can tell which item changed when the list updates.

```tsx
subjects.map((subject) => (
  <SubjectCard key={subject.subjectId} subject={subject} />
))
```

A stable database ID is usually better than an array index, because list items can be added, removed, or reordered.

## 7. Hooks

**Hooks** are React functions such as `useState` and `useEffect` that let function components use React capabilities. Hook names begin with `use`.

Important rules:

- Call Hooks at the top level of a component or another Hook.
- Do not call Hooks inside loops, conditions, or nested functions.
- Keep the dependency list of an effect or memo accurate.

### `useEffect`

`useEffect` synchronizes a component with something outside the render calculation, for example a network request, timer, or event subscription. It accepts an effect function and a dependency list. If the effect creates a subscription or timer, return a cleanup function to stop it when it is no longer needed.

```tsx
useEffect(() => {
  const unsubscribe = listenForUpdates(handleUpdate);
  return () => unsubscribe();
}, []);
```

An empty dependency array means the effect is set up for that mounted component and cleaned up when it is removed. Effects should not be used for every calculation; values that can be calculated during rendering often do not need an effect.

### Other common Hooks

- **`useMemo`** can cache the result of a calculation between renders until its dependencies change. It is a performance tool, not a way to make a calculation correct.
- **`useCallback`** can keep a function reference stable until its dependencies change. It is useful when a stable reference matters, not something every function needs.
- **`useContext`** reads shared values from a context provider, such as a theme, without passing them through every layer as props.
- **Custom Hook** is a reusable function that combines Hooks and starts with `use`, for example a Hook that loads the current user.

## 8. Forms and controlled inputs

A **controlled input** gets its displayed value from React state. An event handler updates that state when the user types. This makes it easier to validate input and control submission.

```tsx
const [email, setEmail] = useState("");
<input value={email} onChange={(event) => setEmail(event.target.value)} />
```

## 9. Sharing state between components

If two child components need the same value, move that value to their nearest shared parent and pass it down as props. This is called **lifting state up**. If many distant components need the same information, Context can avoid passing props through every intermediate component. Context is useful for broadly shared values, but it should not automatically replace local state or clear data ownership.

## 10. TypeScript with React

TypeScript types can describe props and state, helping editors and developers catch mismatches while writing code. A TypeScript type does not validate data received from an API at runtime; the application still needs to handle missing or unexpected data.

## Concept-based interview questions

### What problem does React solve?

It provides a way to build interfaces from reusable components and keep the displayed UI in sync with changing data.

### What is the difference between props and state?

Props are supplied by a parent; state is managed by a component and can change during interaction. Both affect what the component renders.

### Why does changing state cause a render?

The UI depends on the state. When it changes, React needs to calculate the output for the new value and update the displayed interface.

### Why should state arrays and objects be updated immutably?

Creating a new array or object makes the change explicit and helps React detect that the value changed. It also avoids unexpected effects from mutating shared data.

### What does `useEffect` do, and when should cleanup be used?

It synchronizes with an external system after rendering. Cleanup is needed for things such as subscriptions, timers, or listeners so they do not keep running after they are no longer needed.

### Why are keys needed when rendering a list?

Keys help React track which item is which across updates, so it can update the correct elements and preserve their state appropriately.

### When would you use Context instead of passing props?

When a value is needed by many components far apart in the tree, such as a theme or signed-in user. For data used by only a small part of the UI, props or local state are often simpler.

### How do you handle data that is loading or has failed?

Represent the request state clearly, such as loading, success, empty, or error. Show appropriate feedback and provide a retry path when it makes sense.

### Why should `useMemo` not be added everywhere?

It adds complexity and has its own cost. It is most useful when a calculation is expensive or a stable reference avoids meaningful extra work.

## Project examples and further reading

- Student dashboard: `mobile/app/home.tsx`
- Dashboard cards: `mobile/components/home/OverallAttendanceCard.tsx` and `mobile/components/home/SubjectAttendanceCard.tsx`
- Teacher dashboard client component: `frontend-web/app/components/ClassesUI.tsx`
- [React Learn](https://react.dev/learn)
- [React Hooks reference](https://react.dev/reference/react/hooks)

