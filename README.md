# AgileOrbit

FH Project for SoftwareEngineering - AgileOrbit is a comprehensive project management tool designed to help development teams track tasks, documents, and collaborate effectively.

## 🚀 Project Overview

AgileOrbit is a modern, full-stack web application that combines task management with document collaboration in a single platform. Built with a React.js frontend and Node.js backend, it provides a seamless experience for development teams to manage their projects efficiently.

### Key Features

- **Task Management**: Create, assign, and track tasks with a Kanban-style board
- **Document Organization**: Store and organize project documents with a hierarchical structure
- **Epic & Subtask System**: Break down work into epics and subtasks for better organization
- **Real-time Collaboration**: Team members can collaborate on tasks and documents in real-time
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### Tech Stack

- **Frontend**: React.js, Redux, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: Firebase (Firestore, Authentication)

## 🎯 Use Cases

### 1. Sprint Planning
- Create and assign tasks for upcoming sprints
- Organize tasks by assigning epics for better project structure

### 2. Task Tracking
- Move tasks across different status columns (To Do, In Progress, Review, Done)
- Add detailed descriptions, checklists and issueType to tasks

### 3. Document Management
- Store and organize project documentation in a hierarchical structure
- Link documents to specific tasks or epics

### 4. Team Collaboration
- Assign tasks to team members
- Work together on Tasks and Documents

### 5. Progress Tracking
- Visualize project progress with the Kanban board
- Keep up-to-date with the Documents that are located in the Documents section

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)
- Git

## 📦 Installation

1. **Clone the repository**
   ```bash
    - git clone https://github.com/CoOkieDragOnJuliaS/agileOrbit
    - cd agileorbit
   ```

## 🔧 Backend Setup
In root folder:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy/Paste the .env_backend file
   ```bash
   - Unzip the file "setup" and copy/paste the /backend/.env directly into the root folder \agileOrbit
   ```

3. Start the backend server (in the root folder):
   ```bash
   npm run dev
   ```

## 💻 Frontend Setup

1. In a new terminal, navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install dependencies:
   ```bash
   - If you have not unzipped the folder "setup", unzip the folder
   - Copy/Paste the /frontend/.env file into the \agileOrbit\client subfolder
   ```

4. Start the development server (inside the root directory):
   ```bash
   npm run client
   ```

## 🔑 Firebase Admin SDK Setup (One-time)
- If you have not unzipped the folder "setup", unzip the folder
- Copy/Paste the file serviceAccountKey.json into the root folder \agileOrbit

### Frontend (from /client)
- `npm start` - Start development server
- `npm test` - Run tests

### Backend (from /server)
- `npm start` - Start server in production mode
- `npm run dev` - Start server in development mode with nodemon
- `npm run client` - start the Frontend in development mode


## 🔍 Troubleshooting

### Common Issues
- **Firebase Authentication Errors**: Verify your Firebase configuration values
- **CORS Issues**: Ensure backend CORS is properly configured
- **Environment Variables Not Loading**: Restart your development server after changing `.env` files
- **Network Request Failed**: Check for typos in Firebase config and ensure all services are enabled
- **Unversioning a file you don't want to commit**: git rm --cached <filename>
- **Failed login**: may need a refresh of the page before you can login again - the browser can open faster than the connection is stable

## 📝 Notes
- Never commit `.env` files to version control
- Never commit serviceAccountKey.json to version control
- Keep your Firebase Admin credentials secure
- The project uses a monorepo structure with separate client and server directories
