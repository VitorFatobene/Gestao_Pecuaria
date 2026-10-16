
import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './features/auth/context/AuthContext'
import { NotificationProvider } from './components/NotificationProvider'

function App() {
  return (
    <NotificationProvider><AuthProvider><AppRoutes /></AuthProvider></NotificationProvider>
  )
}

export default App
