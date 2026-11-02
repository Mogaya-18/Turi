# Turi Backend Server

This is the Node.js/Express backend for the Turi Health Care Management System. 
It provides the REST API endpoints required by the React frontend to function.

## Setup Instructions

1. Ensure you have Node.js installed.
2. Open a terminal inside this `server` folder.
3. Run `npm install` to install dependencies (Express, CORS, Nodemon).
4. Run `npm run dev` to start the server with hot-reloading.
5. The server will run on `http://localhost:5000`.

## Features Included (Mock Data for UI Testing)
- Endpoints for `Dashboard`, `BookAppointment`, and `Consultation` components.
- Mock JSON data matching the PostgreSQL Entity-Relationship requirements.
- Simulated `409 Conflict` error to test the "double-booking prevention" feature on slot ID `2`.
