import { createRoot } from 'react-dom/client'
import './index.css'
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component


const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500', // Medium weight for all buttons
      },
    },
  },
})
const router = createBrowserRouter([
  {
    // Routes that should use the Layout (Header + page content)
    path: '/',
    element: <Layout />, // Use Layout as the parent element
    // errorElement: <ErrorPage />, // Optional: Add error handling
    children: [
      {
        index: true, // Matches the root path "/"
        element: <CheckIn />, // Default page shown at "/"
      },
      {
        path: 'check-in', // Matches "/check-in"
        element: <CheckIn />,
      },
      {
        path: 'admin', // Matches "/admin"
        element: <AdminDashboard />,
      },
      // Add other routes that need the header here
    ],
  },
  {
    // Route without the Layout (e.g., Login page)
    path: '/login',
    element: <Login />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <ChakraProvider theme={theme}>
    <RouterProvider router={router} />
  </ChakraProvider>
);