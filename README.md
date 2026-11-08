# Student Registration & Management Website

A beginner-friendly full-stack student management dashboard built with Node.js and Express. It allows administrators to register new students, update details, remove records, and browse the current student list with search and status filters.

## Features

- Responsive dashboard with summary cards
- Student registration form with validation
- Search and filter by name, course, and status
- Edit and delete student records
- Persistent JSON-based storage for easy learning

## Tech Stack

- Node.js
- Express.js
- HTML, CSS, and Vanilla JavaScript

## Run Locally

1. Open a terminal in the project folder.
2. Install dependencies:
   npm install
3. Start the server:
   npm start
4. Open the browser at http://localhost:3000

## Project Structure

- `server.js` — backend API and server setup
- `public/` — frontend assets
- `data/students.json` — data storage file

## API Endpoints

- `GET /api/students` — list all students
- `GET /api/students/summary` — dashboard summary
- `POST /api/students` — create a new student
- `PUT /api/students/:id` — update a student
- `DELETE /api/students/:id` — delete a student

## Notes

This project is intentionally simple so it can be used as a practical training project for learning backend APIs, front-end rendering, and CRUD operations.
