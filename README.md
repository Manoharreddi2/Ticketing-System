# Ticketing System

A full-stack IT Support ticketing system I built to manage support requests. This handles role-based auth, ticket lifecycles, comments, and file attachments. 

I went with a decoupled architecture to keep things clean—Spring Boot handles the heavy lifting and security, while Next.js handles the front-end rendering and state.

## Tech Stack

* **Backend:** Java, Spring Boot 3, Spring Security (Stateless JWT auth), Spring Data JPA
* **Database:** PostgreSQL
* **Frontend:** Next.js 15 (App Router), React, TypeScript
* **Styling:** Custom vanilla CSS (went for a modern glassmorphism look)

## Core Features

* **Role-Based Access Control:** Distinct actions/views for Admin, Support Agent, and Standard User.
* **Ticket Pipelines:** Users can raise tickets with subjects, priorities, and descriptions. Status gets tracked from Open -> In Progress -> Resolved -> Closed.
* **Comment Threads:** Agents and Users can message each other directly within a ticket thread.
* **File Attachments:** Support for uploading/downloading local files and images directly to tickets.
* **Admin Dashboard:** Real-time stats on agent workloads, ticket priorities, and an interface to manage user accounts manually.

## How to run this locally

### Prerequisites
* Java 21+
* Node.js 18+
* PostgreSQL running locally (port 5432)

### 1. Database
Make sure you have a Postgres DB running named `ticketing_db`. 
The Spring Boot app connects via the default `application.yml` using username `postgres` and password `1234`. Update that file if your local postgres credentials are different.

### 2. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```
*Note: The backend has a `DataSeeder` that will automatically insert test users, fake tickets, and demo comments into the database the very first time it boots up.*

### 3. Start the Frontend

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```


### Demo Logins
Since the database auto-seeds, you can jump right in with these test accounts:
- **Admin**: `admin@ticketing.com` / `admin123`
- **Agent**: `agent@ticketing.com` / `agent123`
- **User**: `user@ticketing.com` / `user123`

## License
MIT
