import { 
    Avatar, 
    Text, 
    Flex, 
    Menu, 
    MenuButton, 
    HStack, 
    Button, 
    MenuList, 
    MenuItem, 
    Divider, 
    VStack, 
    useColorModeValue,
    useToast
  } from '@chakra-ui/react';
  import { useNavigate } from 'react-router-dom';
  import { FiLogOut, FiRepeat } from 'react-icons/fi';
  import { useState, useMemo } from 'react';
  import { getAuth, signOut } from 'firebase/auth'; // Import Firebase signOut

  // Constants
  export const ROLES = {
    ADMIN: 'admin',
    VOLUNTEER: 'volunteer',
    STAFF: 'staff',
  } as const;
  
  export type Role = typeof ROLES[keyof typeof ROLES];
  
  export interface User {
    email: string;
    name: string;
    roles: Role[];
    activeRole: Role;
  }
  
  interface UserProfileProps {
    user: User | null;
  }
  
//   const API_URL = import.meta.env.VITE_API_URL;
  
  const UserProfile = ({ user }: UserProfileProps) => {
    const navigate = useNavigate();
    const toast = useToast(); // Add toast
    const auth = getAuth(); // Get Firebase auth instance
    // Initialize state directly from props
    const [currentActiveRole, setCurrentActiveRole] = useState<Role | null>(user?.activeRole || null);
    
    // Color mode values (all hooks called unconditionally at top level)
    const menuBg = useColorModeValue('white', 'gray.700');
    const menuTextColor = useColorModeValue('gray.800', 'white');
    const menuHeaderColor = useColorModeValue('gray.500', 'gray.400');
    const menuItemHoverBg = useColorModeValue('gray.100', 'gray.600');
    const logoutItemHoverBg = useColorModeValue('red.50', 'red.900');
    const logoutItemHoverColor = useColorModeValue('red.600', 'red.300');
  
    // Memoized role switching logic
    const switchableRoles = useMemo(() => {
      if (!user || !currentActiveRole) return [];
      
      return user.roles.filter(role => {
        if (role === currentActiveRole) return false;
        
        // Role switching rules
        switch (currentActiveRole) {
          case ROLES.VOLUNTEER:
            return role === ROLES.ADMIN || role === ROLES.STAFF;
          case ROLES.ADMIN:
            return role === ROLES.VOLUNTEER || role === ROLES.STAFF;
          case ROLES.STAFF:
            return role === ROLES.VOLUNTEER || role === ROLES.ADMIN;
          default:
            return false;
        }
      });
    }, [user, currentActiveRole]);
  
    // Early return after all hooks
    if (!user || !currentActiveRole) return null;
  
    const handleLogout = async () => {
        try {
          await signOut(auth); // Use Firebase signOut
          console.log('Firebase user signed out.');
          // Navigation to /login will be handled by the onAuthStateChanged listener in Layout
          // navigate('/login'); // Not strictly necessary here anymore
          toast({
              title: 'Logged Out',
              status: 'info',
              duration: 2000,
              isClosable: true,
          });
        } catch (error) {
          console.error("Firebase Logout failed:", error);
          toast({
              title: 'Logout Error',
              description: error instanceof Error ? error.message : 'Failed to log out.',
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
        }
        // No finally needed
      };
  
    const handleSwitchRole = (newRole: Role) => {
      setCurrentActiveRole(newRole);
    };
  
    return (
      <Flex alignItems="center">
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.600' }}
            _active={{ bg: 'blue.700' }}
            px={2}
            py={1}
            h="auto"
          >
            <HStack spacing={2}>
              <Avatar name={user.name} size="sm" />
              <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}>
                <Text fontWeight="medium" fontSize="sm" lineHeight="tight">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="blue.100" lineHeight="tight">
                  {currentActiveRole.charAt(0).toUpperCase() + currentActiveRole.slice(1)}
                </Text>
              </VStack>
            </HStack>
          </MenuButton>
          
          <MenuList
            zIndex="popover"
            bg={menuBg}
            color={menuTextColor}
            boxShadow="md"
          >
            {switchableRoles.length > 0 && (
              <>
                <MenuItem 
                  isFocusable={false} 
                  fontWeight="bold" 
                  fontSize="sm" 
                  color={menuHeaderColor}
                >
                  Switch Role To:
                </MenuItem>
                {switchableRoles.map((role) => (
                  <MenuItem
                    key={role}
                    icon={<FiRepeat size="14px" />}
                    onClick={() => handleSwitchRole(role)}
                    _hover={{ bg: menuItemHoverBg }}
                    _focus={{ bg: menuItemHoverBg }}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
                <Divider />
              </>
            )}
            
            <MenuItem
              icon={<FiLogOut />}
              color="red.500"
              _hover={{ 
                bg: logoutItemHoverBg, 
                color: logoutItemHoverColor 
              }}
              _focus={{ 
                bg: logoutItemHoverBg, 
                color: logoutItemHoverColor 
              }}
              onClick={handleLogout}
            >
              Log Out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    );
  };
  
  export default UserProfile;