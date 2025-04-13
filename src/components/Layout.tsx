// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from './Header';
// Assuming UserProfile should always be visible regardless of page
// You might need to fetch user data here or in a higher context
// For simplicity, let's assume user data is handled within pages for now

export const Layout = () => {
  return (
    <Box position="relative" minHeight="100vh"> {/* Added relative positioning */}
      <Header />
      <Box as="main" pt={4}> {/* Add padding top to prevent content overlap */}
        {/* Page content will be rendered here */}
        <Outlet />
      </Box>
      {/* UserProfile is likely rendered within specific pages like AdminDashboard/CheckIn
          If you want it globally, you'd fetch user data here and pass it down,
          or use a global state/context. */}
    </Box>
  );
};

export default Layout;
