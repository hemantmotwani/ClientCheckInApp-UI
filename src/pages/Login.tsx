// src/pages/Login.tsx
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
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
// import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Firebase Auth functions
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';


// No longer need VITE_GOOGLE_CLIENT_ID directly here if using Firebase popup
// const API_URL = import.meta.env.VITE_API_URL; // Keep if needed for other calls, but not for login itself

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // State for form errors
  const auth = getAuth();

  const handleEmailPasswordSignIn = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      // Sign in using email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      console.log('Firebase Email/Password Sign-In Successful:', user);

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.email}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate away after successful login
      navigate('/check-in'); // Or '/'

    } catch (error: any) {
      const errorCode = error.code;
      let friendlyMessage = 'An unexpected error occurred during sign-in.';

      // Provide more user-friendly error messages
      switch (errorCode) {
        case 'auth/invalid-email':
          friendlyMessage = 'The email address is not valid.';
          break;
        case 'auth/user-disabled':
          friendlyMessage = 'This user account has been disabled.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password': // Combine these for security
        case 'auth/invalid-credential': // Newer error code for wrong email/password
          friendlyMessage = 'Incorrect email or password.';
          break;
        default:
          friendlyMessage = error.message; // Fallback to Firebase message
      }

      console.error("Firebase Login Error:", errorCode, error.message);
      setError(friendlyMessage); // Display error in the form
      toast({
        title: 'Login Error',
        description: friendlyMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8} centerContent>
      <Box w="100%" maxW="400px">
        <Card boxShadow="lg" borderRadius="md">
          <CardBody>
            {/* Use a form element */}
            <form onSubmit={handleEmailPasswordSignIn}>
              <VStack spacing={6} py={8}>
                <Heading size="lg" color="gray.700" textAlign="center">
                  Sign In
                </Heading>

                {/* Email Input */}
                <FormControl isInvalid={!!error}>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    isRequired // Add basic HTML5 validation
                  />
                </FormControl>

                {/* Password Input */}
                <FormControl isInvalid={!!error}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    isRequired
                  />
                  {/* Display general form error message */}
                  {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </FormControl>

                {/* Submit Button */}
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  type="submit" // Make this the submit button
                  isLoading={isLoading}
                  loadingText="Signing In..."
                >
                  Sign In
                </Button>

              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Container>
  );
}