import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  HStack,
  Input,
  Card,
  CardBody,
  Flex,
  Text,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import UserProfile, { User, Role, ROLES } from './UserProfile';


interface CheckIn {
  id: string;
  client_id: string;
  ltf_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  postal: string;
  phone: string;
  email: string;
  checkInTime: string;
}

interface Filters {
  name: string[];
  clientId: string[];
  ltfId: string[];
  email: string[];
  phone: string[];
  address: string[];
  city: string[];
  state: string[];
  postal: string[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Add auth loading state
  const [isAuthorized, setIsAuthorized] = useState(false); // Add state for authorization status
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([])
  const [isDataLoading, setIsDataLoading] = useState(false); // Changed name
  const [filters, setFilters] = useState<Filters>({
    name: [],
    clientId: [],
    ltfId: [],
    email: [],
    phone: [],
    address: [],
    city: [],
    state: [],
    postal: [],
  })
  const toast = useToast()
  const API_URL = import.meta.env.VITE_API_URL

  // --- Authentication & Authorization useEffect ---
  useEffect(() => {
    // Set initial data loading state (optional, depends on UX)
    // setIsDataLoading(true); // You might want data loading to start only AFTER auth

    fetch(`${API_URL}/auth/status`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Auth status failed: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("AdminDashboard: Received auth data:", data); // Log raw data

        if (data.isAuthenticated && data.user) {
          setUser(data.user);

          // Ensure the user object has the expected structure
          if (data.user.email && data.user.name && data.user.roles && data.user.activeRole) {
            const fetchedUser = data.user as User;
            setUser(fetchedUser);
            console.log(`AdminDashboard: Checking authorization. Comparing fetchedUser.activeRole ('${fetchedUser.activeRole}', type: ${typeof fetchedUser.activeRole}) with ROLES.ADMIN ('${ROLES.ADMIN}', type: ${typeof ROLES.ADMIN})`);

            // **** AUTHORIZATION CHECK: Based on ACTIVE ROLE ****
            if (fetchedUser.activeRole === ROLES.ADMIN) {
              console.log("AdminDashboard: Authorization check PASSED. Setting isAuthorized to true.");
              
              setIsAuthorized(true);
              // Fetch data only if authorized (moved fetch logic)
              // fetchCheckIns(); // Call fetch function here or trigger via another useEffect
            } else {
              console.log("AdminDashboard: Authorization check FAILED. Setting isAuthorized to false.");

              setIsAuthorized(false);
              // Optional: Show toast immediately, but the main feedback will be the page content
              // toast({ /* ... Unauthorized toast ... */ });
            }
          } else {
            // Handle incomplete user data from backend
            console.error("AdminDashboard Auth Error: User data incomplete.");
            toast({ title: 'Login Error', description: 'User data incomplete. Please log in again.', status: 'error', /*...*/ });
            navigate('/login');
          }
        } else {
          console.log("AdminDashboard: Not authenticated or user data missing in response. Navigating to login.");
          navigate('/login');
        }
      })
      .catch(error => {
        console.error("AdminDashboard: Authentication check fetch failed:", error);
        toast({ title: 'Authentication Error', description: 'Could not verify login status.', status: 'error', duration: 5000, isClosable: true });
        navigate('/login');
      })
      .finally(() => {
        console.log("AdminDashboard: Auth check finished. Setting authLoading to false.");
        setAuthLoading(false);
      });
  // Removed fetchCheckIns call from here, handle it separately
  }, [navigate, toast, API_URL]); // Dependencies for auth check



  useEffect(() => {
    // Only fetch if authorized and not already loading/fetched
    if (!isAuthorized || authLoading) {
      return; // Don't fetch if not authorized or auth is still loading
    }

    const fetchCheckIns = async () => {
      setIsDataLoading(true); // Start data loading indicator

      try {
          const response = await fetch(`${API_URL}/api/dashboard/check-ins`, {
          credentials: 'include',
        });
        // Specific check for 403 from backend (belt-and-suspenders)
        if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to view this data.');
       }
        if (!response.ok) {
          throw new Error('Failed to fetch check-ins')
        }
        const data = await response.json()
        setCheckIns(data)
        setFilteredCheckIns(data)
      } catch (error) {
        toast({
          title: 'Error Fetching Data',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setCheckIns([]); // Clear data on error
        setFilteredCheckIns([]);
     } finally {
       setIsDataLoading(false); // Stop data loading indicator
     }
    }

    fetchCheckIns()
  },[isAuthorized, authLoading, toast, API_URL]);

  useEffect(() => {
    const filtered = checkIns.filter(checkIn => {
      const fullName = `${checkIn.first_name} ${checkIn.last_name}`
      return (
        (filters.name.length === 0 || filters.name.includes(fullName)) &&
        (filters.clientId.length === 0 || filters.clientId.includes(checkIn.client_id)) &&
        (filters.ltfId.length === 0 || filters.ltfId.includes(checkIn.ltf_id)) &&
        (filters.email.length === 0 || filters.email.includes(checkIn.email)) &&
        (filters.phone.length === 0 || filters.phone.includes(checkIn.phone)) &&
        (filters.address.length === 0 || filters.address.includes(checkIn.address)) &&
        (filters.city.length === 0 || filters.city.includes(checkIn.city)) &&
        (filters.state.length === 0 || filters.state.includes(checkIn.state)) &&
        (filters.postal.length === 0 || filters.postal.includes(checkIn.postal))
      )
    })
    setFilteredCheckIns(filtered)
  }, [filters, checkIns])


  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value ? [value] : []
    }))
  }

  if (authLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <HStack justify="center">
          <Spinner size="xl" />
        </HStack>
      </Container>
    )
  }
  if (!isAuthorized) {
    return (
      <Container maxW="container.xl" py={8}>
         {/* Still show UserProfile so they can switch roles or log out */}
         <Flex justify="flex-end" mb={8}>
           <UserProfile user={user} />
         </Flex>
         <VStack spacing={4} textAlign="center" mt={20}>
            <Heading size="lg" color="orange.500">Access Denied</Heading>
            <Text>Your current active role does not have permission to view this page.</Text>
            <Text fontSize="sm">Try switching roles via your profile menu if you have access.</Text>
            {/* Optional: Button to navigate home */}
            {/* <Button onClick={() => navigate('/')}>Go Home</Button> */}
         </VStack>
      </Container>
    );
  }
  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="flex-end" mb={8}>
        <UserProfile user={user} />
      </Flex>      
      <VStack spacing={8} align="stretch">
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading textAlign="center" size="lg">Admin Dashboard</Heading>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
          {isDataLoading ? (
              <HStack justify="center" py={10}>
                <Spinner size="lg" />
                <Text ml={3}>Loading dashboard data...</Text>
              </HStack>
            ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr bg="blue.500">
                    <Th color="white" width="20%">Name</Th>
                    <Th color="white" width="15%">Client ID</Th>
                    <Th color="white" width="20%">Link To Feed ID</Th>
                    <Th color="white" width="20%">Email</Th>
                    <Th color="white" width="15%">Phone</Th>
                    <Th color="white" width="20%">Address</Th>
                    <Th color="white" width="15%">City</Th>
                    <Th color="white" width="15%">State</Th>
                    <Th color="white" width="15%">Postal Code</Th>
                    <Th color="white" width="20%">Check In Time</Th>
                  </Tr>
                  <Tr>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by name"
                        value={filters.name[0] || ''}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by client ID"
                        value={filters.clientId[0] || ''}
                        onChange={(e) => handleFilterChange('clientId', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by LTF ID"
                        value={filters.ltfId[0] || ''}
                        onChange={(e) => handleFilterChange('ltfId', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by email"
                        value={filters.email[0] || ''}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by phone"
                        value={filters.phone[0] || ''}
                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by address"
                        value={filters.address[0] || ''}
                        onChange={(e) => handleFilterChange('address', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by city"
                        value={filters.city[0] || ''}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by state"
                        value={filters.state[0] || ''}
                        onChange={(e) => handleFilterChange('state', e.target.value)}
                      />
                    </Th>
                    <Th p={2}>
                      <Input
                        size="xs"
                        placeholder="Filter by postal code"
                        value={filters.postal[0] || ''}
                        onChange={(e) => handleFilterChange('postal', e.target.value)}
                      />
                    </Th>
                    <Th p={2}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  
                  {
                  filteredCheckIns.length === 0 && !isDataLoading ? (
                       <Tr><Td colSpan={10} textAlign="center" py={10}>No check-in records found.</Td></Tr>
                    ) : (
                  filteredCheckIns.map((checkIn, index) => (
                    <Tr 
                      key={checkIn.id}
                      bg={index % 2 === 0 ? 'white' : 'blue.50'}
                      _hover={{ bg: 'blue.100' }}
                    >
                      <Td>{`${checkIn.first_name} ${checkIn.last_name}`}</Td>
                      <Td>{checkIn.client_id}</Td>
                      <Td>{checkIn.ltf_id}</Td>
                      <Td>{checkIn.email}</Td>
                      <Td>{checkIn.phone}</Td>
                      <Td>{checkIn.address}</Td>
                      <Td>{checkIn.city}</Td>
                      <Td>{checkIn.state}</Td>
                      <Td>{checkIn.postal}</Td>
                      <Td>{new Date(checkIn.checkInTime).toLocaleString()}</Td>
                    </Tr>
                  ))
                  )}
                </Tbody>
              </Table>
            </Box>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
} 