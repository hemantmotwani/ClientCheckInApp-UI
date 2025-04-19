import { useEffect, useRef, useState } from 'react';
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
    Spinner, // Import Spinner
    Center,
  } from '@chakra-ui/react';
  
  import { useNavigate } from 'react-router-dom'; // Import useNavigate
  const API_URL = import.meta.env.VITE_API_URL
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

  export default function Login() {
    const navigate = useNavigate(); // Hook for navigation
    const toast = useToast();
    const googleButtonDiv = useRef<HTMLDivElement>(null); // Ref for the button container
    const [isGsiLoading, setIsGsiLoading] = useState(true); // State to track GIS loading/initialization
  
    // Callback function to handle the credential response from Google
    const handleCredentialResponse = async (response: google.accounts.id.CredentialResponse) => {
      console.log("Encoded JWT ID token: " + response.credential);
      setIsGsiLoading(true); // Show loading indicator during backend verification
  
      try {
        // Send the token to your backend verification endpoint
        const backendResponse = await fetch(`${API_URL}/auth/google/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the token received from Google
          body: JSON.stringify({ token: response.credential }),
          credentials: 'include', });
  
        const data = await backendResponse.json();
  
        if (!backendResponse.ok) {
          throw new Error(data.message || 'Login failed. Please try again.');
        }
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Redirect to the check-in page or dashboard after successful login
        // The Layout component's auth check should now find the user session
        navigate('/check-in'); // Or '/' or '/dashboard' depending on your flow
  
      } catch (error) {
        console.error("Login Error:", error);
        toast({
          title: 'Login Error',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
         setIsGsiLoading(false); // Hide loading indicator on error
      }
      // No need for finally { setIsGsiLoading(false) } if navigating away on success
    };
  
    useEffect(() => {
      if (!GOOGLE_CLIENT_ID) {
        console.error("VITE_GOOGLE_CLIENT_ID is not defined. Google Sign-In cannot be initialized.");
        toast({
          title: 'Configuration Error',
          description: 'Google Sign-In is not configured correctly.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
        setIsGsiLoading(false); // Stop loading if client ID is missing
        return;
      }
  
      // Check if the google global object is available
      if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
        console.log("Google Identity Services script not loaded yet, waiting...");
        // Optional: Add a timeout or retry mechanism if needed, but async/defer should handle it.
        // For simplicity, we'll rely on the script loading before this effect runs.
        // If it consistently fails, consider dynamically loading the script.
        setIsGsiLoading(false); // Or keep it true and show a message?
        return;
      }
      console.log("Using Google Client ID:", GOOGLE_CLIENT_ID);

      // Initialize Google Identity Services
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse, // Function to handle the response
      });
      console.log('Checking googleButtonDiv.current:', googleButtonDiv.current);

      // Render the Google Sign-In button
      if (!isGsiLoading && googleButtonDiv.current) {
        console.log('Attempting to render Google button into:', googleButtonDiv.current);
        google.accounts.id.renderButton(
          googleButtonDiv.current,
          { theme: 'outline', size: 'large', type: 'standard', shape: 'rectangular', text: 'signin_with' }
        );
        // Button is rendered, no need to change loading state here
      } else if (isGsiLoading) {
        // If we are still in the initial loading state, it means the google object is now ready.
        // Set loading to false to trigger a re-render, which will display the Box container.
        // The effect will run again because isGsiLoading changes.
        console.log("Google object ready. Setting loading false to render button container.");
        setIsGsiLoading(false);
      } else if (!googleButtonDiv.current) {
        // This condition means: isGsiLoading is false, but the ref is still null.
        // This might happen briefly during React's render cycle. Log it if it persists.
        console.warn("Login component rendered, but Google button container ref is not yet available.");
      }
  
      // Optional: Display the One Tap prompt
      // google.accounts.id.prompt();
  
      // Cleanup function if the component unmounts (optional but good practice)
      return () => {
        // google?.accounts?.id?.cancel(); // If using One Tap prompt
      };
  
      // Add isGsiLoading to the dependency array
    }, [navigate, toast, isGsiLoading]); // <-- Dependency added
  
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Box w="100%" maxW="400px"> {/* Adjusted maxW slightly */}
          <Card boxShadow="lg" borderRadius="md"> {/* Added subtle shadow/radius */}
            <CardBody>
              <VStack spacing={6} py={8}>
                <Heading size="lg" color="gray.700" textAlign="center"> {/* Adjusted size */}
                  Sign In
                </Heading>
  
                {/* Container for the Google Sign-In button */}
                {/* The button will be rendered inside this div by the GIS library */}
                {isGsiLoading ? (
                   <Center py={4}>
                      <Spinner size="lg" thickness="4px" speed="0.65s" color="blue.500" />
                      <Text ml={3}>Loading Sign-In...</Text>
                   </Center>
                ) : (
                   <Box ref={googleButtonDiv} w="full" display="flex" justifyContent="center"></Box>
                )}
  
                {/* Remove the old button */}
                {/*
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={() => window.location.href = `${API_URL}/auth/google`} // Old redirect method
                  _hover={{ transform: 'scale(1.02)' }}
                  transition="all 0.2s"
                >
                  Continue with Google
                </Button>
                */}
  
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Container>
    );
  }
