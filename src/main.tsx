// src/main.tsx
import { createRoot } from 'react-dom/client';
import './index.css';
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component

// Import Firebase
import { initializeApp } from 'firebase/app';
// Optionally import other Firebase services you might use (e.g., Firestore)
// import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// Load these from your .env file (e.g., VITE_FIREBASE_API_KEY)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // measurementId is optional
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// Optionally initialize other services
// const db = getFirestore(firebaseApp);
// --- End Firebase Configuration ---


const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500', // Medium weight for all buttons
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CheckIn />,
      },
      {
        path: 'check-in',
        element: <CheckIn />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },{ // Add the new route for sign-up
    path: '/signup',
    element: <SignUp />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <ChakraProvider theme={theme}>
    {/* RouterProvider should be inside ChakraProvider */}
    <RouterProvider router={router} />
  </ChakraProvider>
);

// Export firebaseApp if needed elsewhere, though often auth is accessed via getAuth()
export { firebaseApp };
