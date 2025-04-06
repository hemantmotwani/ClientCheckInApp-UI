import { 
    Container, 
    VStack, 
    Heading, 
    Button, 
    Card, 
    CardBody, 
    Box 
  } from '@chakra-ui/react';
  
  export default function Login() {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Box w="100%" maxW="500px">
          <Card boxShadow="md">
            <CardBody>
              <VStack spacing={6} py={8}>
                <Heading size="xl" color="gray.700" textAlign="center">
                  Welcome Back
                </Heading>
                
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={() => window.location.href = "http://localhost:3001/auth/google"}
                  _hover={{ transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                >
                  Continue with Google
                </Button>
                <Box typography="md">
                Secure login using your organization account
</Box>  

              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Container>
    )
  }