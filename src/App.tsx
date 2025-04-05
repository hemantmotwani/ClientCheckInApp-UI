import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CheckIn from './pages/CheckIn'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CheckIn />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ChakraProvider>
  )
}

export default App
