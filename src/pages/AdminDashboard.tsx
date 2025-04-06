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
} from '@chakra-ui/react'
import UserProfile from './UserProfile';
import { useNavigate } from 'react-router-dom'

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
  const [user, setUser] = useState<{ email: string; name: string } | null >()
  const [authLoading, setAuthLoading] = useState(true); // Add auth loading state
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [filteredCheckIns, setFilteredCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        // const API_URL = import.meta.env.VITE_API_URL
        const response = await fetch(`${API_URL}/api/check-ins`)
        if (!response.ok) {
          throw new Error('Failed to fetch check-ins')
        }
        const data = await response.json()
        setCheckIns(data)
        setFilteredCheckIns(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch check-ins',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckIns()
  }, [toast])

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


  useEffect(() => {
    fetch(`${API_URL}/auth/status`, { credentials: 'include' ,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated) {
          setUser(data.user);
        } else {
          navigate ( '/login');
        }
        setAuthLoading(false);
      });
  }, [navigate]);


  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value ? [value] : []
    }))
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <HStack justify="center">
          <Spinner size="xl" />
        </HStack>
      </Container>
    )
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
                  {filteredCheckIns.map((checkIn, index) => (
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
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 