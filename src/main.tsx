import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CheckIn from './pages/CheckIn';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
    path: "/",
    element: <CheckIn />,
  },
  {
    path: "/login",
    element: <Login />, // Create this component
  },
  
  {
    path: "/admin",
    element: <AdminDashboard />, // Create this component
  },
]);
createRoot(document.getElementById('root')!).render(
<ChakraProvider theme={theme}>
  <RouterProvider router={router} />
</ChakraProvider>
)