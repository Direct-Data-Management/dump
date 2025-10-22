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
    <div className="bg-muted min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="bg-table-background shadow-md rounded-lg p-6 border-l-4 border-button-color">
          <h2 className="text-2xl font-bold text-primary mb-4">
            DUMP - Direct Unified and Modular Portal
          </h2>
          <p className="text-foreground">
            Module Federation Host Application
          </p>
        </section>

        {userPermissions.length > 0 && (
          <section className="bg-table-background shadow-md rounded-lg p-6 border-l-4 border-button-color">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Permissions</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              {userPermissions.map((perm, idx) => (
                <li key={idx}>{perm}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-table-background shadow-md rounded-lg p-6 border-l-4 border-button-color">
          <h2 className="text-2xl font-bold text-primary mb-4">Getting Started</h2>
          <div className="text-foreground space-y-4">
            <p>
              Welcome to the Direct Unified and Modular Portal. This application uses Module Federation
              to provide a flexible and modular architecture.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-semibold text-primary mb-2">Modular Design</h3>
                <p className="text-sm text-muted-foreground">
                  Load modules dynamically based on your permissions and requirements.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-semibold text-primary mb-2">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  JWT-based authentication ensures secure access to your resources.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
