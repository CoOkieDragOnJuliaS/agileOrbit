# AgileOrbit

FH Project for SoftwareEngineering - AgileOrbit is a tool to help developers keep track of tasks and documents. It can evolve in the future to hold more responsibilities and features to help coordinate and cooperate with the team itself.

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
   - Unzip the file "setup" and copy the .env_backend directly into the root folder \agileOrbit
   - Rename the file to .env
   ```

3. Start the backend server:
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
   - Copy/Paste the .env_frontend file into the \agileOrbit\client subfolder
   - Rename the file to .env 
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
- `npm run build` - Create production build

### Backend (from /server)
- `npm start` - Start server in production mode
- `npm run dev` - Start server in development mode with nodemon


## 🔍 Troubleshooting

### Common Issues
- **Firebase Authentication Errors**: Verify your Firebase configuration values
- **CORS Issues**: Ensure backend CORS is properly configured
- **Environment Variables Not Loading**: Restart your development server after changing `.env` files
- **Network Request Failed**: Check for typos in Firebase config and ensure all services are enabled
- **Unversioning a file you don't want to commit**: git rm --cached <filename>

## 📝 Notes
- Never commit `.env` files to version control
- Never commit serviceAccountKey.json to version control
- Keep your Firebase Admin credentials secure
- The project uses a monorepo structure with separate client and server directories
