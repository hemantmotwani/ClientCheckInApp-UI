// src/components/Layout.tsx
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Spinner, Container } from '@chakra-ui/react'; // Removed Flex as it wasn't used directly here
import Header from './Header';
import { User } from '../pages/UserProfile';

// Define the type for the context data passed via Outlet
type OutletContextType = { user: User | null };

// Custom hook for child components to easily access the context
// Ensure this function is exported correctly
export function useUserContext() {
  // Make sure useOutletContext is correctly imported from 'react-router-dom'
  return useOutletContext<OutletContextType>();
}

const API_URL = import.meta.env.VITE_API_URL;

// Ensure the Layout component itself is also exported if needed elsewhere by name,
// but the default export is usually sufficient for the router.
export const Layout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch authentication status when the layout mounts
  useEffect(() => {
    fetch(`${API_URL}/auth/status`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Auth status check failed: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.isAuthenticated && data.user) {
          // Basic validation of user object structure
          if (data.user.email && data.user.name && data.user.roles && data.user.activeRole) {
            setUser(data.user as User);
          } else {
             console.error("Layout Auth Error: Received user data is incomplete.");
             navigate('/login'); // Treat incomplete data as unauthenticated
          }
        } else {
          navigate('/login'); // Redirect if not authenticated
        }
      })
      .catch(error => {
        console.error("Layout Authentication check failed:", error);
        navigate('/login'); // Redirect on any fetch error
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [navigate]); // Dependency array

  // Estimate header height - adjust if needed
  const headerHeight = "56px"; 

  // Show a loading spinner for the whole page while checking auth
  if (authLoading) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" />
      </Container>
    );
  }

  // If auth check finished but user is null (should have been redirected)
  if (!user) {
     return null; // Or a specific "Not Authenticated" component
  }

  return (
    // Keep relative positioning if other absolute elements might exist, otherwise optional
    <Box position="relative" minHeight="100vh" pb={10}>
      {/* Pass user data to Header */}
      <Header user={user} />

      {/* Remove UserProfile rendering from here */}
      {/* <UserProfile user={user} /> */}

      {/* Add padding-top to main content area */}
      <Box as="main" pt={headerHeight} px={4}>
        {/* Pass user data down to child routes via context */}
        <Outlet context={{ user } satisfies OutletContextType} />
      </Box>
    </Box>
  );
};

// Default export is Layout component
export default Layout;
