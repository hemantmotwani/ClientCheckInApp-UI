import { Avatar, Text, Flex, Menu, MenuButton, HStack, Button, MenuList, MenuItem, Divider, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiRepeat } from 'react-icons/fi';
import { useState, useEffect } from 'react';


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
// ---

interface UserProfileProps {
    // Allow user to be null initially while auth is loading in parent
    user: User | null;
}
const API_URL = import.meta.env.VITE_API_URL
const UserProfile = ({ user }: UserProfileProps) => {
    const navigate = useNavigate();
    // State to manage the *currently selected* active role in the UI
    const [currentActiveRole, setCurrentActiveRole] = useState<Role | null>(null);    
    // Initialize/update local active role state when the user prop changes
    useEffect(() => {
        if (user) {
            setCurrentActiveRole(user.activeRole);
        } else {
            setCurrentActiveRole(null); // Reset if user logs out or prop becomes null
        }
    }, [user]);    
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Error during logout:", error);
            // Optionally show a toast message for logout failure
        } finally {
            // Navigate regardless of backend success/failure
            navigate('/login');
        }
    };

    // Handler to update the local active role state
    const handleSwitchRole = (newRole: Role) => {
        setCurrentActiveRole(newRole);
        // No backend call or page refresh needed for now
        // The menu should close automatically on item click
    };
    console.log('user', user);
    console.log('currentActiveRole', currentActiveRole);
    
    // Render nothing if user data or the active role isn't available yet
    if (!user || !currentActiveRole) {
        return null;
    }

    // Determine which roles are available for switching based on the current active role
    const switchableRoles = user.roles.filter(role => {
        // Cannot switch to the role that's already active
        if (role === currentActiveRole) return false;

        // Apply the conditional logic based on the *current* active role
        switch (currentActiveRole) {
            case ROLES.VOLUNTEER:
                // If active is Volunteer, only show Admin or Staff if user has them
                return role === ROLES.ADMIN || role === ROLES.STAFF;
            case ROLES.ADMIN:
                // If active is Admin, show Volunteer or Staff if user has them
                return role === ROLES.VOLUNTEER || role === ROLES.STAFF;
            case ROLES.STAFF:
                // If active is Staff, show Volunteer or Admin if user has them
                return role === ROLES.VOLUNTEER || role === ROLES.ADMIN;
            default:
                // Should not happen with defined roles, but good practice
                return false;
        }
    });

    return (
        <Flex
            as="header"
            position="absolute"
            top="0"
            right="0"
            p={4}
            zIndex="10"
        >
            <Menu placement="bottom-end"> {/* Better placement */}
                <MenuButton
                    as={Button}
                    variant="ghost"
                    px={3} py={2}
                    _hover={{ bg: 'gray.100' }}
                    _active={{ bg: 'gray.200' }}
                    h="auto" // Adjust height automatically
                >
                    <HStack spacing={3}>
                        <Avatar name={user.name} size="sm" bg="blue.500" color="white" />
                        {/* Use VStack to stack name and active role */}
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="md" lineHeight="tight">{user.name}</Text>
                            {/* Display the current active role */}
                            <Text fontSize="xs" color="gray.600" lineHeight="tight">
                                Role: {currentActiveRole}
                            </Text>
                        </VStack>
                    </HStack>
                </MenuButton>
                <MenuList>
                    {/* --- Role Switching Section --- */}
                    {/* Only show this section if there are roles to switch to */}
                    {switchableRoles.length > 0 && (
                        <>
                            <MenuItem isFocusable={false} fontWeight="bold" fontSize="sm" color="gray.500">
                                Switch Role To:
                            </MenuItem>
                            {switchableRoles.map((role) => (
                                <MenuItem
                                    key={role}
                                    icon={<FiRepeat size="14px" />} // Add an icon
                                    onClick={() => handleSwitchRole(role)}
                                >
                                    {role}
                                </MenuItem>
                            ))}
                            <Divider />
                        </>
                    )}
                    {/* --- End Role Switching Section --- */}

                    {/* --- Logout Section --- */}
                    <MenuItem
                        icon={<FiLogOut />}
                        color="red.500" // Make text red for emphasis
                        _hover={{ bg: 'red.50', color: 'red.600' }} // Subtle hover
                        _focus={{ bg: 'red.50', color: 'red.600' }}
                        onClick={handleLogout}
                    >
                        Log Out
                    </MenuItem>
                    {/* --- End Logout Section --- */}
                </MenuList>
            </Menu>
        </Flex>
    );
};
export default UserProfile