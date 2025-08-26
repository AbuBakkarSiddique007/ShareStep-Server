# ShareStep Platform

ShareStep is a modern volunteer platform that connects people who want to help with organizations and communities in need. This repository contains both the frontend (React) client and the backend (Node.js/Express) server for the ShareStep project.

## Purpose

To make volunteering easy, accessible, and impactful by providing a platform for posting, discovering, and managing volunteer opportunities.

## Live URL

Frontend: [https://sharestep-d09c3.web.app](https://sharestep-d09c3.web.app)

Backend API: [https://share-step-server.vercel.app/](https://share-step-server.vercel.app/)

## Repository Links

- Client Repo: [https://github.com/AbuBakkarSiddique007/ShareStep-Client](https://github.com/AbuBakkarSiddique007/ShareStep-Client)
- Server Repo: [https://github.com/AbuBakkarSiddique007/ShareStep-Server](https://github.com/AbuBakkarSiddique007/ShareStep-Server)

## Project Structure

- `ShareStep-Client/` — React frontend (this folder)
- `ShareStep-Server/` — Node.js/Express backend API

## Key Features

- User authentication (email/password & Google via Firebase)
- JWT-protected API requests
- Add, update, and delete volunteer need posts
- Browse and search all volunteer opportunities
- Request to volunteer and manage your requests
- Responsive, mobile-friendly UI with dark mode
- Toast notifications and beautiful alerts
- Swiper-based hero slider
- Category and deadline filtering
- Secure, role-based access to protected routes

## Main npm Packages Used (Client)

- **react** & **react-dom**: Core UI library
- **react-router-dom**: Routing
- **firebase**: Authentication
- **axios**: HTTP requests
- **react-hot-toast**: Toast notifications
- **sweetalert2**: Alert modals
- **swiper**: Hero/slider component
- **tailwindcss** & **daisyui**: Styling and UI components
- **lucide-react** & **react-icons**: Icons
- **react-helmet-async**: Dynamic document titles
- **react-datepicker**: Date picking for deadlines

## Main npm Packages Used (Server)

- **express**: Web framework
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **jsonwebtoken**: JWT authentication
- **cookie-parser**: Cookie handling
- **mongodb**: Database

## Getting Started

1. Clone the repo and run `npm install` in both `ShareStep-Client` and `ShareStep-Server`.
2. Set up your `.env` files with the required API, database, and Firebase config.
3. Run `npm run dev` in each folder to start the development servers.

