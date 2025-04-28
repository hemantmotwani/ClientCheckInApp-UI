// src/pages/SignUp.tsx
import { useState } from 'react';
import {
  Container,
  VStack,
  Heading,
  Button,
  Card,
  CardBody,
  Box,
  useToast,
  Text,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Link as ChakraLink, // Import ChakraLink
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import RouterLink

// Assume your Cloud Function URL is stored in an env variable
const SIGNUP_FUNCTION_URL = import.meta.env.VITE_SIGNUP_FUNCTION_URL;

export default function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  if (!SIGNUP_FUNCTION_URL) {
    setError('Sign up configuration error. Please contact support.');
    console.error("VITE_SIGNUP_FUNCTION_URL is not defined.");
    setIsLoading(false);
    return;
}
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password || !confirmPassword || !inviteCode) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!SIGNUP_FUNCTION_URL) {
        setError('Sign up configuration error. Please contact support.');
        console.error("VITE_SIGNUP_FUNCTION_URL is not defined.");
        setIsLoading(false);
        return;
    }

    try {
      // Call your backend Cloud Function to handle sign-up
      const response = await fetch(SIGNUP_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          inviteCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use error message from backend if available, otherwise provide a default
        throw new Error(data.message || 'Sign up failed. Please check your invite code and details.');
      }

      // Sign up successful!
      console.log('Sign Up Successful (via backend):', data); // Log backend response if needed

      toast({
        title: 'Sign Up Successful',
        description: 'Your account has been created. Please log in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect user to the login page
      navigate('/login');

    } catch (error: any) {
      console.error("Sign Up Error:", error);
      setError(error.message || 'An unexpected error occurred during sign up.');
      toast({
        title: 'Sign Up Error',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
    // No finally block needed if navigating away on success
  };

  return (
    <Container maxW="container.md" py={8} centerContent>
      <Box w="100%" maxW="400px">
        <Card boxShadow="lg" borderRadius="md">
          <CardBody>
            <form onSubmit={handleSignUp}>
              <VStack spacing={4} py={8}> {/* Reduced spacing slightly */}
                <Heading size="lg" color="gray.700" textAlign="center">
                  Create Account
                </Heading>

                <FormControl isInvalid={!!error}>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    isRequired
                  />
                </FormControl>

                <FormControl isInvalid={!!error && error.includes('password')}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    isRequired
                  />
                </FormControl>

                <FormControl isInvalid={!!error && error.includes('match')}>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    isRequired
                  />
                </FormControl>

                <FormControl isInvalid={!!error && (error.includes('code') || error.includes('invite'))}>
                  <FormLabel htmlFor="inviteCode">Invite Code</FormLabel>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter your invite code"
                    isRequired
                  />
                   {/* Display general form error message */}
                   {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </FormControl>


                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  mt={4} // Add margin top
                >
                  Sign Up
                </Button>

                <Text textAlign="center" fontSize="sm">
                  Already have an account?{' '}
                  <ChakraLink as={RouterLink} to="/login" color="blue.500">
                    Log In
                  </ChakraLink>
                </Text>

              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}
