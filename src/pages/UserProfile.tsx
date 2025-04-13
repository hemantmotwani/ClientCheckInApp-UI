import { Avatar, Text, Flex, Menu, MenuButton, HStack, Button, MenuList, MenuItem, Divider, VStack,useColorModeValue  } from '@chakra-ui/react';
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
    // const headerHeight = "64px";

    const navigate = useNavigate();
    // State to manage the *currently selected* active role in the UI
    const [currentActiveRole, setCurrentActiveRole] = useState<Role | null>(null);    

     // Hook to get appropriate colors for light/dark mode
     const menuBg = useColorModeValue('white', 'gray.700'); // White in light mode, dark gray in dark mode
     const menuTextColor = useColorModeValue('gray.800', 'white'); // Dark text in light mode, white text in dark mode
     const menuHeaderColor = useColorModeValue('gray.500', 'gray.400'); // Slightly lighter header text
 
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
        // Remove positioning styles from Flex
        // Adjust padding if needed (p={4} might be too much inside the header)
        <Flex
            alignItems="center" // Align items vertically if needed
            // p={1} // Example: reduce padding
        >
            <Menu placement="bottom-end">
                <MenuButton
                    as={Button}
                    variant="ghost" // Keep ghost variant for header integration
                    color="white" // Ensure text/icon color contrasts with header bg
                    _hover={{ bg: 'blue.600' }} // Adjust hover bg for header
                    _active={{ bg: 'blue.700' }} // Adjust active bg for header
                    px={2} // Adjust padding
                    py={1} // Adjust padding
                    h="auto"
                >
                    <HStack spacing={2}> {/* Reduce spacing */}
                        <Avatar name={user.name} size="sm" /* Optional: Adjust size */ />
                        {/* Optionally hide name on smaller screens if needed */}
                        <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}> {/* Hide text on small screens */}
                            <Text fontWeight="medium" fontSize="sm" lineHeight="tight">{user.name}</Text>
                            <Text fontSize="xs" color="blue.100" lineHeight="tight"> {/* Lighter color for role */}
                                Role: {currentActiveRole.charAt(0).toUpperCase() + currentActiveRole.slice(1)}
                            </Text>
                        </VStack>
                    </HStack>
                </MenuButton>
                {/* MenuList will still appear below the button */}
                <MenuList zIndex="popover"
                    bg={menuBg} // Set background color based on color mode
                    color={menuTextColor} // Set default text color for items
                    boxShadow="md" // Add a subtle shadow
                > {/* Ensure menu appears above content */}
                    {/* Role Switching Section */}
                    {switchableRoles.length > 0 && (
                        <>
                            <MenuItem isFocusable={false} fontWeight="bold" fontSize="sm" color={menuHeaderColor}>
                                Switch Role To:
                            </MenuItem>
                            {switchableRoles.map((role) => (
                                <MenuItem
                                    key={role}
                                    icon={<FiRepeat size="14px" />}
                                    onClick={() => handleSwitchRole(role)}
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                                    _focus={{ bg: useColorModeValue('gray.100', 'gray.600') }}                                    
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </MenuItem>
                            ))}
                            <Divider />
                        </>
                    )}
                    {/* Logout Section */}
                    <MenuItem
                        icon={<FiLogOut />}
                        color="red.500"
                        _hover={{ bg: 'red.50', color: 'red.600' }}
                        _focus={{ bg: 'red.50', color: 'red.600' }}
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