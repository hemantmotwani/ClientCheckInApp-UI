// src/components/Layout.tsx
import {
  Box,
  Flex,
  Spinner,
  Center,
  Container,
  useToast,
} from '@chakra-ui/react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'; // Import Firebase Auth types

// Keep your existing Role definitions
import { User, Role, ROLES } from '../pages/UserProfile'; // Assuming UserProfile exports these

// --- Define a new UserContextType ---
// We'll store the FirebaseUser and potentially your custom User profile
interface UserContextType {
  firebaseUser: FirebaseUser | null; // Store the raw Firebase user
  userProfile: User | null; // Store your custom user profile (roles, etc.)
  loading: boolean;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
});

// Custom hook to use the context
export const useUserContext = () => useContext(UserContext);

// --- Layout Component ---
export default function Layout() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null); // Your custom user profile
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const auth = getAuth(); // Get the auth instance
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user); // Update Firebase user state

      if (user) {
        // --- User is logged in via Firebase ---
        console.log('Firebase user logged in:', user.uid);

        // Fetch custom user profile only if not already fetched or user changed
        // This basic check prevents refetching on every auth state change if user is already logged in
        if (!userProfile || userProfile.email !== user.email) {
          console.log('Firebase user Email:', user.email);

          setLoading(true); // Set loading true specifically for profile fetch
          try {
            // 1. Get the Firebase ID token
            const idToken = await user.getIdToken();

            // 2. Fetch the user profile from your backend /api/profile endpoint
            if (!API_URL) {
              throw new Error("API URL (VITE_API_URL) is not configured in .env file.");
            }
            const profileResponse = await fetch(`${API_URL}/api/profile`, { // Use the /api/profile endpoint
              headers: {
                'Authorization': `Bearer ${idToken}`, // Send token for verification
              },
            });

            if (!profileResponse.ok) {
              // Handle specific errors like 404 (profile not found) or 401/403 (unauthorized)
              let errorMsg = `Failed to fetch user profile: ${profileResponse.statusText}`;
              if (profileResponse.status === 404) {
                 errorMsg = 'User profile not found on backend.';
              } else if (profileResponse.status === 401 || profileResponse.status === 403) {
                 errorMsg = 'Unauthorized to fetch user profile.';
              }
              try {
                // Attempt to get more specific error from backend response body
                const errorData = await profileResponse.json();
                errorMsg = errorData.message || errorMsg;
              } catch (e) { /* Ignore if response body isn't JSON */ }
              throw new Error(errorMsg);
            }

            // 3. Parse the JSON response from your backend
            const profileData: User = await profileResponse.json(); // Ensure 'User' type matches backend response

            // --- Log the received profile data ---
            console.log('User profile received from backend:', profileData);
            console.log('Roles:', profileData.roles); // Specifically log roles
            // ---

            // 4. Validate received data (optional but recommended)
            if (!profileData || !profileData.roles || !profileData.activeRole || !profileData.email) {
                console.error("Received profile data is incomplete:", profileData);
                throw new Error("Incomplete user profile data received from backend.");
            }

            // 5. Set the fetched user profile state
            setUserProfile(profileData);

          } catch (error) {
            console.error("Failed to fetch or process user profile:", error);
            setUserProfile(null); // Clear profile on error
            toast({
              title: 'Profile Error',
              description: error instanceof Error ? error.message : 'Could not load user profile data.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            // Consider signing out if the profile is essential and fetch failed badly
            // await auth.signOut();
          } finally {
             setLoading(false); // Profile fetch attempt complete
          }
        } else {
           // User is already logged in and profile is likely loaded, ensure loading is false
           setLoading(false);
        }
      } else {
        // --- User is logged out ---
        console.log('Firebase user logged out.');
        setUserProfile(null); // Clear custom profile
        setLoading(false); // Not loading anymore
        // Redirect to login only if not already on login or signup page
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login');
        }
      }
      // Note: setLoading(false) is now handled within the if/else branches and finally block
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [auth, navigate, location.pathname, toast]); // Add dependencies

  // Memoize context value
  const contextValue = useMemo(() => ({
    firebaseUser,
    userProfile,
    loading
  }), [firebaseUser, userProfile, loading]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Container maxW="container.md" py={8} centerContent>
        <Center h="100vh">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        </Center>
      </Container>
    );
  }

  // Render layout if authenticated (or on login page)
  return (
    <UserContext.Provider value={contextValue}>
      <Flex direction="column" minH="100vh">
        {/* Conditionally render Header if user is logged in */}
        {firebaseUser && userProfile && <Header user={userProfile} />}
        <Box flex="1" pt={firebaseUser && userProfile ? "60px" : "0"}> {/* Adjust pt if Header height changes */}
          <Outlet /> {/* Renders the matched child route */}
        </Box>
        {/* Footer could go here */}
      </Flex>
    </UserContext.Provider>
  );
}
