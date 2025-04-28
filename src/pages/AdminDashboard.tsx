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
  Text,
} from '@chakra-ui/react'
import { ROLES } from './UserProfile'; // Keep ROLES if needed for comparison
import { useUserContext } from '../components/Layout'; // Import the custom hook
import { getAuth } from 'firebase/auth'; // Import getAuth

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
  const { userProfile, loading: authLoading, firebaseUser } = useUserContext();
  const auth = getAuth(); // Get auth instance

  const [isAuthorized, setIsAuthorized] = useState(false); // Add state for authorization status
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


    // --- Authorization Check useEffect (runs when user context changes) ---
    useEffect(() => {
      // Check profile exists and has the admin role
      if (userProfile && userProfile.activeRole === ROLES.ADMIN) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }, [userProfile]); // Depend on the fetched profile


  useEffect(() => {
    // Only fetch if authorized and not already loading/fetched
    if (!isAuthorized ) {
      setCheckIns([]);
      setFilteredCheckIns([]);
      return; // Don't fetch if not authorized
    }

    const fetchCheckIns = async () => {
      setIsDataLoading(true); // Start data loading indicator
      let idToken: string | null = null;

      try {
        idToken = await firebaseUser.getIdToken();
        const response = await fetch(`${API_URL}/api/dashboard/check-ins`, {
        credentials: 'omit',
        headers: {
          // --- Add Authorization Header ---
          'Authorization': `Bearer ${idToken}`,
          // --- ---
          'Content-Type': 'application/json', // If sending data, otherwise optional for GET
      },        
        });
        // Specific check for 403 from backend (belt-and-suspenders)
        if (response.status === 401 || response.status === 403) {
          throw new Error('Unauthorized or Forbidden: You do not have permission.');
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch check-ins (Status: ${response.status})`);
        }
        const data = await response.json()
        setCheckIns(data)
        setFilteredCheckIns(data)
      } catch (error) {
        toast({
          title: 'Error Fetching Data',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setCheckIns([]); // Clear data on error
        setFilteredCheckIns([]);
     } finally {
       setIsDataLoading(false); // Stop data loading indicator
     }
    }

    fetchCheckIns()
  }, [isAuthorized, firebaseUser, toast, API_URL]);

  useEffect(() => {
    const filtered = checkIns.filter(checkIn => {
      const fullName = `${checkIn.first_name} ${checkIn.last_name}`
      return (
        (!filters.name[0] || fullName.toLowerCase().includes(filters.name[0].toLowerCase())) &&
        (!filters.clientId[0] || checkIn.client_id.includes(filters.clientId[0])) &&
        (!filters.ltfId[0] || checkIn.ltf_id.includes(filters.ltfId[0])) &&
        (!filters.email[0] || checkIn.email.toLowerCase().includes(filters.email[0].toLowerCase())) &&
        (!filters.phone[0] || checkIn.phone.includes(filters.phone[0])) &&
        (!filters.address[0] || checkIn.address.toLowerCase().includes(filters.address[0].toLowerCase())) &&
        (!filters.city[0] || checkIn.city.toLowerCase().includes(filters.city[0].toLowerCase())) &&
        (!filters.state[0] || checkIn.state.toLowerCase().includes(filters.state[0].toLowerCase())) &&
        (!filters.postal[0] || checkIn.postal.includes(filters.postal[0]))
    );
    });
    setFilteredCheckIns(filtered);
  }, [filters, checkIns]);


  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value ? [value] : []
    }));
  };
  if (authLoading) {
    return <Container maxW="container.xl" py={8} centerContent><Spinner size="xl" /></Container>;
}
  if (!isAuthorized) {
    return (
      <Container maxW="container.xl" py={8}>
         <VStack spacing={4} textAlign="center" mt={20}>
            <Heading size="lg" color="orange.500">Access Denied</Heading>
            <Text>Your current active role does not have permission to view this page.</Text>
            <Text fontSize="sm">Try switching roles via your profile menu if you have access.</Text>
         </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="center"  >
        <Card >
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Heading textAlign="center" size="lg">Admin Dashboard</Heading>
            </VStack>
          </CardBody>
        </Card>

        <Card w="full">
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