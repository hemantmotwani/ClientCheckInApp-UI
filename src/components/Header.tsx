// src/components/Header.tsx
import { Box, Flex, Heading, HStack, Link as ChakraLink, Spacer } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // Use alias to avoid name clash

// Define the navigation links
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Check In', path: '/check-in' }, // Assuming '/check-in' is the route for CheckIn page
  { label: 'Admin', path: '/admin' },
  // Add other links as needed, e.g., Client Details if you have that page
  // { label: 'Client Details', path: '/clients' },
];

export const Header = () => {
  return (
    <Box bg="blue.500" px={6} py={3} color="white" boxShadow="sm">
      <Flex alignItems="center">
        {/* Logo/Brand */}
        <Heading as="h1" size="md" mr={8}>
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            ClientCheckInApp
          </ChakraLink>
        </Heading>

        {/* Navigation Links */}
        <HStack spacing={6}>
          {navItems.map((item) => (
            <ChakraLink
              key={item.label}
              as={RouterLink}
              to={item.path}
              fontWeight="medium"
              _hover={{ textDecoration: 'underline' }}
              // Optional: Add active styling based on current route if needed
              // isActive={location.pathname === item.path} // Requires useLocation hook
            >
              {item.label}
            </ChakraLink>
          ))}
        </HStack>

        {/* Spacer pushes UserProfile to the right, but UserProfile is positioned absolutely */}
        <Spacer />

        {/* UserProfile will be positioned absolutely relative to its nearest positioned ancestor,
            so it doesn't need to be directly inside the Header's Flex layout here.
            It will overlay on top. Ensure the parent container where Header is used
            allows for this absolute positioning. */}
      </Flex>
    </Box>
  );
};

export default Header;
