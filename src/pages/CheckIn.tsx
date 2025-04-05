import { useState } from 'react'
import {
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Grid,
  GridItem,
  useToast,
  Spinner,
  Card,
  CardBody,
  Divider,
  HStack,
  Container,
} from '@chakra-ui/react'
import { Client } from '../types/client'

export default function CheckIn() {
  const [barcode, setBarcode] = useState('')
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleFindClient = async () => {
    if (!barcode) {
      toast({
        title: 'Error',
        description: 'Please enter a barcode',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Clear previous client data when searching for a new client
    setClient(null)
    setIsLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL

      const response =await fetch(`${API_URL}/api/clients/${barcode}`)
      if (!response.ok) {
        throw new Error('Client not found')
      }
      const data = await response.json()
      setClient(data)
      
      toast({
        title: 'Success',
        description: 'Client found successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to find client',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!barcode) {
      toast({
        title: 'Error',
        description: 'Please enter a barcode',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL
      const response = await fetch(`${API_URL}/api/check-ins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode }),
      })

      if (!response.ok) {
        throw new Error('Failed to check in')
      }

      const data = await response.json()
      setClient(data)
      toast({
        title: 'Success',
        description: 'Check-in successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to check in',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Client Check-In</Heading>
        
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Input
                placeholder="Enter client barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                size="lg"
              />
              <Button
                colorScheme="blue"
                onClick={handleFindClient}
                isLoading={isLoading}
                loadingText="Finding client..."
                width="full"
                size="lg"
              >
                Find Client
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {isLoading && (
          <HStack justify="center">
            <Spinner size="xl" />
          </HStack>
        )}

        {client && (
          <>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Client Information</Heading>
                  <Divider />
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontWeight="bold">Name</Text>
                      <Text>{`${client.first_name} ${client.last_name}`}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Client ID</Text>
                      <Text>{client.client_id}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Link To Feed ID</Text>
                      <Text>{client.ltf_id}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Email</Text>
                      <Text>{client.email}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Phone</Text>
                      <Text>{client.phone}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Address</Text>
                      <Text>{client.address}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">City</Text>
                      <Text>{client.city}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">State</Text>
                      <Text>{client.state}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Postal Code</Text>
                      <Text>{client.postal}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Date of Birth</Text>
                      <Text>{client.dob}</Text>
                    </GridItem>
                    <GridItem>
                      <Text fontWeight="bold">Last Visit</Text>
                      <Text>{client.last_visit}</Text>
                    </GridItem>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <VStack spacing={4}>
                  <Button
                    colorScheme="green"
                    onClick={handleCheckIn}
                    isLoading={isLoading}
                    loadingText="Checking in..."
                    width="full"
                    size="lg"
                  >
                    Check In
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  )
} 