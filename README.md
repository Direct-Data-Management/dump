# DUMP - Direct Unified and Modular Portal

A modular React application that uses Module Federation to dynamically load remote React applications based on user access control from JWT tokens.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone Repository](#clone-repository)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Build Instructions](#build-instructions)
- [Module Federation Setup](#module-federation-setup)
  - [Host Configuration (DUMP)](#host-configuration-dump)
  - [Remote Module Configuration](#remote-module-configuration)
  - [Access Control](#access-control)
- [Running the Project](#running-the-project)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (or pnpm/yarn as alternatives)
- **Git**: For version control

## Clone Repository

Clone the repository from GitHub:

```bash
git clone https://github.com/Direct-Data-Management/dump.git
cd dump
```

## Installation

Install all project dependencies:

```bash
npm install
```

### Dependencies Overview

- **react** & **react-dom**: React 19 for building the UI
- **react-router-dom**: Client-side routing
- **jwt-decode**: Decoding JWT tokens for access control
- **@module-federation/enhanced**: Module Federation implementation for Vite
- **vite**: Build tool and development server (v7)
- **tailwindcss**: Utility-first CSS framework (v4)
- **typescript**: Type safety and enhanced developer experience

## Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
# API Configuration
VITE_API_URL=https://api.example.com
VITE_AUTH_ISSUER=https://auth.example.com
VITE_AUTH_AUDIENCE=dump-app

# Module Federation Remote URLs
# VITE_REMOTE_APP1_URL=http://localhost:5174/assets/remoteEntry.js
# VITE_REMOTE_APP2_URL=http://localhost:5175/assets/remoteEntry.js

# Environment
VITE_ENVIRONMENT=development
```

### Environment Variables

- **VITE_API_URL**: Base URL for your backend API
- **VITE_AUTH_ISSUER**: JWT token issuer URL
- **VITE_AUTH_AUDIENCE**: Expected audience for JWT validation
- **VITE_REMOTE_*_URL**: URLs for remote federated modules (configured per remote app)
- **VITE_ENVIRONMENT**: Current environment (development, staging, production)

## Build Instructions

### Development Build

Start the development server (default port 5173):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

This command:
1. Runs TypeScript type checking
2. Creates an optimized production build in the `dist` folder

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Module Federation Setup

### Host Configuration (DUMP)

DUMP acts as the host application that dynamically loads remote modules. The configuration is defined in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/enhanced/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'dump',
      remotes: {
        // Define remote modules here
        // remoteApp1: 'http://localhost:5174/assets/remoteEntry.js',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-router-dom': {
          singleton: true,
        },
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
```

### Remote Module Configuration

Remote applications should be configured to expose their components. Example `vite.config.ts` for a remote module:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/enhanced/vite'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remoteApp1',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './Component': './src/components/MyComponent.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
      },
    }),
  ],
  server: {
    port: 5174,
  },
  build: {
    target: 'esnext',
  },
})
```

### Access Control

DUMP uses JWT tokens to control which remote modules are loaded for each user. Lazy loaded modules are selected based on the **roles** and **permissions** stored in the JWT token.

**How it works:**

1. User authenticates and receives a JWT token
2. Token is stored (e.g., localStorage) and decoded using `jwt-decode`
3. Token contains user roles/permissions (e.g., `{ roles: ['admin'], permissions: ['view-dashboard', 'edit-users'] }`)
4. DUMP reads these permissions and dynamically loads only the remote modules the user has access to
5. Unauthorized modules are never loaded or exposed to the user

**Example JWT payload:**

```json
{
  "sub": "user123",
  "roles": ["admin", "editor"],
  "permissions": [
    "view-dashboard",
    "edit-users",
    "access-reports"
  ],
  "exp": 1735862400
}
```

## Running the Project

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to:

```
http://localhost:5173
```

3. The application will load and dynamically fetch remote modules based on your JWT token permissions

---

## Additional Scripts

- **Type checking**: `npm run type-check` - Check TypeScript types without emitting files
- **Linting**: `npm run lint` - Run ESLint on the codebase

## Contributing

Please ensure all code passes type checking and linting before submitting pull requests:

```bash
npm run type-check
npm run lint
```

## License

[Specify your license here]
