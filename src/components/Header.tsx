// src/components/Header.tsx
import { Box, Flex, Heading, HStack, Link as ChakraLink, Spacer } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
// Import UserProfile and User type
import UserProfile, { User } from '../pages/UserProfile';

// Define the navigation links
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Check In', path: '/check-in' },
  { label: 'Admin', path: '/admin' },
];

// Define props for the Header, including the user
interface HeaderProps {
  user: User | null;
}

export const Header = ({ user }: HeaderProps) => {
  const location = useLocation();

  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="banner"
      bg="blue.500"
      px={6} // Main horizontal padding for the header bar
      py={2} // Adjust vertical padding if needed
      color="white"
      boxShadow="sm"
    >
      <Flex alignItems="center" maxW="container.xl" mx="auto">
        {/* Logo/Brand */}
        <Heading as="h1" size="md" mr={8}>
          <ChakraLink as={RouterNavLink} to="/" _hover={{ textDecoration: 'none' }}>
            ClientCheckInApp
          </ChakraLink>
        </Heading>

        {/* Navigation Links */}
        <HStack spacing={6}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/check-in');
            return (
              <ChakraLink
                key={item.label}
                as={RouterNavLink}
                to={item.path}
                fontWeight="medium"
                textDecoration={isActive ? 'underline' : 'none'}
                opacity={isActive ? 1 : 0.8}
                _hover={{ textDecoration: 'underline', opacity: 1 }}
              >
                {item.label}
              </ChakraLink>
            );
          })}
        </HStack>

        <Spacer />

        {/* Render UserProfile directly within the header if user exists */}
        {user && <UserProfile user={user} />}
      </Flex>
    </Box>
  );
};

export default Header;
