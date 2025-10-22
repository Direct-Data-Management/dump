import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  roles?: string[]
  permissions?: string[]
}

function App() {
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    // Example: Decode JWT to get user permissions
    const token = localStorage.getItem('jwt_token')
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token)
        setUserPermissions(decoded.permissions || [])
      } catch (error) {
        console.error('Failed to decode JWT:', error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          DUMP - Direct Unified and Modular Portal
        </h1>
        <p className="text-gray-600">
          Module Federation Host Application
        </p>
        {userPermissions.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold">Your Permissions:</h2>
            <ul className="list-disc list-inside">
              {userPermissions.map((perm, idx) => (
                <li key={idx}>{perm}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
