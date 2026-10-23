# Spring Boot Basics and Interview Questions

Spring Boot is a Java framework for creating applications, including web APIs. It builds on the Spring Framework and provides conventions, dependency management, and automatic configuration so developers can focus more on application behavior.

The Smart Attendance backend uses Spring Boot for its REST API, authentication, business rules, and database access.

## 1. Spring Framework and Spring Boot

The **Spring Framework** provides core features such as dependency injection and web request handling. **Spring Boot** builds on Spring and makes applications easier to configure and run with sensible defaults and starter dependencies.

The main application class is `backend/src/main/java/com/sanchit/smart_attendance/SmartAttendanceApplication.java`. The `@SpringBootApplication` annotation is a convenient starting point that enables common Spring Boot behavior, including configuration and component discovery.

## 2. Dependency injection and Spring beans

A **dependency** is another object a class needs to do its work. **Dependency injection (DI)** means the framework provides those dependencies instead of the class constructing them directly. A Spring-managed object is often called a **bean**.

For example, a controller can receive a service, and a service can receive repositories. This reduces direct coupling and makes components easier to replace or test.

Common annotations include:

- `@RestController`: marks a class that handles web requests and returns response data.
- `@Service`: marks application logic.
- `@Repository`: marks database access components.
- `@Component`: marks a general Spring-managed component.
- `@Autowired`: asks Spring to provide a dependency. Constructor injection is generally a clear way to express required dependencies.

## 3. Application layers

A common structure separates responsibilities:

1. **Controller:** accepts an HTTP request, reads inputs, calls the service, and creates the HTTP response.
2. **Service:** applies business rules and coordinates operations.
3. **Repository:** loads and saves data.
4. **Entity / database:** represents and stores persistent records.

For example, `UserController` handles the student dashboard request, `UserService` prepares dashboard data, and a repository obtains data from the database.

This separation makes it easier to locate behavior and helps prevent a controller from becoming responsible for every detail.

## 4. REST APIs and HTTP

A **REST API** exposes resources through URLs and uses HTTP methods to read or change data. Common methods are:

- `GET`: retrieve data.
- `POST`: submit data or start an operation.
- `PUT` / `PATCH`: update data.
- `DELETE`: remove data.

An HTTP response includes a **status code**. For example, `200` generally means success, `201` means a resource was created, `400` indicates an invalid request, and `401` or `403` indicates an authorization problem.

`@GetMapping` and `@PostMapping` connect controller methods to HTTP methods and URL paths. A request body commonly contains JSON, which Spring can convert to a Java object.

## 5. DTOs and entities

A **DTO** (Data Transfer Object) describes data crossing an application boundary, such as the JSON sent to or returned from an API. An **entity** represents persistent data associated with a database table.

Separating them is useful because the public API shape may differ from the internal database structure. It also helps avoid returning fields that clients should not see.

## 6. Spring Data JPA and relational databases

**JPA** is a Java specification for mapping objects to relational database records. Spring Data JPA builds on it and can provide repository methods for common database operations. The project uses PostgreSQL as its relational database.

An **entity** maps to a table, and a **repository** provides ways to query or update it. Relationships can represent how records connect, for example a student to their attendance records.

Use transactions when multiple database changes must behave as one operation. If one part fails, a transaction can roll back the related changes so the data is not left partially updated.

## 7. Validation and error handling

Validation checks that incoming data is present and acceptable. Spring can validate request objects using annotations such as `@Valid` together with validation constraints. The server must validate input even if the user interface already checks it.

Exceptions represent errors during processing. A centralized exception handler can convert known application errors into consistent HTTP responses, instead of each controller inventing a different format.

## 8. Configuration and profiles

Configuration keeps environment-specific values—such as database URLs, ports, and service settings—outside the core business logic. A **profile** allows different configuration for environments such as local development and production.

Secrets such as signing keys and passwords should be provided through secure configuration, not committed as plain text in source control.

## 9. Spring Security and authentication

**Authentication** establishes who a user is. **Authorization** checks what that authenticated user is allowed to do. Spring Security provides a framework for protecting requests and applying those rules.

In this project, a request filter checks a backend token, identifies the account and role, and makes that identity available to protected controller methods. Controllers can then distinguish student and teacher access.

## 10. Background work

Some work, such as face-image processing, takes longer than a typical API request. Background processing lets the backend accept or queue the work and process it separately, keeping the initial request from waiting for the full computation.

Background work needs status tracking and error handling so users or other services can tell whether a job is waiting, processing, complete, or failed.

## 11. Testing and observability

Testing checks behavior at different levels. Unit tests focus on a small class or method; integration tests check collaboration with other pieces, such as the database or web layer. Logs and metrics help operators understand what an application is doing after deployment.

## Concept-based interview questions

### What does Spring Boot add on top of Spring?

It provides conventions, starter dependencies, and automatic configuration that reduce setup for common application types. Developers can still override defaults when needed.

### What is dependency injection, and why is it useful?

It means a class receives the objects it needs from a framework or caller. This reduces tight coupling and makes it easier to replace dependencies or test a class in isolation.

### Why separate controllers, services, and repositories?

Each layer has a clear responsibility: HTTP handling, business rules, and data access. This makes code easier to understand, maintain, and test.

### What is the difference between a DTO and an entity?

A DTO is shaped for data exchange with a client or another boundary. An entity represents persisted data. Keeping them separate avoids exposing database structure directly as the API contract.

### What does a database transaction guarantee?

It groups related changes so they succeed or fail together. This helps preserve consistency when an operation updates multiple records.

### Why validate requests on the backend?

Clients cannot be trusted to enforce rules. A user can send a handcrafted request, so the backend must validate data and authorization before changing or returning protected information.

### What is the difference between authentication and authorization?

Authentication determines who the user is; authorization determines which actions or data that user may access.

### When is background processing useful?

For slow or resource-intensive work that should not keep a request waiting, such as image analysis. The system then needs a way to track job status and surface failures.

### Why keep secrets out of source code?

Source code may be copied, logged, or published. Keeping secrets in secure environment configuration reduces the chance of exposing credentials and makes rotation easier.

### How would you investigate an API returning an error?

Check the request and response, status code, application logs, validation rules, authentication state, and dependencies such as the database. Reproduce the failure with a focused test or request.

## Project examples and further reading

- Application entry point: `backend/src/main/java/com/sanchit/smart_attendance/SmartAttendanceApplication.java`
- Controllers: `backend/src/main/java/com/sanchit/smart_attendance/controller/`
- Services: `backend/src/main/java/com/sanchit/smart_attendance/service/`
- Repositories: `backend/src/main/java/com/sanchit/smart_attendance/repository/`
- [Spring Boot Reference: Dependency Injection](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html)
- [Spring Boot Reference: Build Systems and Starters](https://docs.spring.io/spring-boot/reference/using/build-systems.html)

