import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import config from './config';

// Initialize Firebase
const app = initializeApp(config.firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth, analytics };
export default app;