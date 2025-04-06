import { Avatar, Text, Flex, Menu, MenuButton, HStack, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

interface UserProfileProps {
    user: { email: string; name: string; };
}
const API_URL = import.meta.env.VITE_API_URL
const UserProfile = ({ user }: UserProfileProps) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).then(() => navigate('/login'));
    };

    return (
        <Flex
            as="header"
            position="absolute" // or "fixed" if you want it to stay on scroll
            top="0"
            right="0"
            p={4}
            zIndex="10"
        >
            <Menu>
                <MenuButton as={Button} variant="ghost" px={3} py={2} _hover={{ bg: 'gray.100' }}
                    _active={{ bg: 'gray.200' }}>
                    <HStack spacing={3}>
                        <Avatar name={user?.name} size="sm" bg="blue.500"
                            color="white" />
                        <Text fontWeight="medium" fontSize="md">{user?.name}</Text>
                    </HStack>
                </MenuButton>
                <MenuList>
                    <MenuItem
                        icon={<FiLogOut />}
                        bg="red.500"
                        color="white"
                        _hover={{ bg: 'red.600' }}
                        _focus={{ bg: 'red.600' }}
                        onClick={handleLogout}
                    >
                        Log Out
                    </MenuItem>
                </MenuList>
            </Menu>
        </Flex>
    );
};
export default UserProfile