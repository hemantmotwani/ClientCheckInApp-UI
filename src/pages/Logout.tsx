// LogoutButton.tsx
const Logout = () => {
    const handleLogout = () => {
      fetch('http://localhost:3001/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for session deletion
      }).then(() => window.location.href = '/login');
    };
  
    return <button onClick={handleLogout}>Log out</button>;
  };
  export default Logout;