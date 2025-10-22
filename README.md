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
  - [Local Development Setup](#local-development-setup)
  - [NPM Package Federation](#npm-package-federation)
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

### Local Development Setup

Setting up Module Federation for local development requires running both the host application (DUMP) and remote applications simultaneously. Follow these steps to configure a complete local development environment:

#### Step 1: Project Structure

Organize your projects in a logical folder structure:

```
projects/
├── dump/                    # Host application (this repo)
├── remote-dashboard/        # Remote module 1
├── remote-user-management/  # Remote module 2
└── remote-reports/         # Remote module 3
```

#### Step 2: Configure Remote Applications

For each remote application, ensure your `vite.config.ts` includes the federation plugin:

```typescript
// remote-dashboard/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/enhanced/vite'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remoteDashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './Dashboard': './src/Dashboard.tsx',
        './DashboardRoutes': './src/routes.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5174,
    cors: true,
  },
  build: {
    target: 'esnext',
  },
})
```

#### Step 3: Update DUMP Configuration

In the host application (DUMP), update your `vite.config.ts` to include the local remote URLs:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'dump',
      remotes: {
        remoteDashboard: 'http://localhost:5174/assets/remoteEntry.js',
        remoteUserMgmt: 'http://localhost:5175/assets/remoteEntry.js',
        remoteReports: 'http://localhost:5176/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
```

#### Step 4: Environment Variables for Development

Update your `.env` file to include the local remote URLs:

```env
# Local Development - Module Federation Remote URLs
VITE_REMOTE_DASHBOARD_URL=http://localhost:5174/assets/remoteEntry.js
VITE_REMOTE_USER_MGMT_URL=http://localhost:5175/assets/remoteEntry.js
VITE_REMOTE_REPORTS_URL=http://localhost:5176/assets/remoteEntry.js

# Development settings
VITE_ENVIRONMENT=development
VITE_API_URL=http://localhost:3000
```

#### Step 5: Start All Applications

To run the complete federated system locally, you need to start all applications:

1. **Start each remote application** (in separate terminals):

```bash
# Terminal 1 - Dashboard
cd remote-dashboard
npm run dev  # Should run on port 5174

# Terminal 2 - User Management
cd remote-user-management
npm run dev  # Should run on port 5175

# Terminal 3 - Reports
cd remote-reports
npm run dev  # Should run on port 5176
```

2. **Start the host application**:

```bash
# Terminal 4 - Host (DUMP)
cd dump
npm run dev  # Should run on port 5173
```

#### Step 6: Verify Module Federation

1. Open your browser to `http://localhost:5173`
2. Check the browser's network tab to see remote modules being loaded
3. Verify that remote components render correctly within the host application

#### Troubleshooting Local Development

**Common Issues:**

1. **CORS Errors**: Ensure all remote applications have `cors: true` in their Vite server configuration
2. **Port Conflicts**: Make sure each application runs on a unique port (5173, 5174, 5175, etc.)
3. **Shared Dependencies**: Ensure all applications use the same versions for shared dependencies (React, React DOM, etc.)
4. **Remote Not Loading**: Check that the remote application is running and accessible at the specified URL

**Development Tips:**

- Use browser developer tools to monitor network requests for remote modules
- Enable verbose logging in Vite for federation debugging
- Consider using a process manager like `concurrently` to start all applications with one command
- Create a development script to automate the startup process

**Example startup script (package.json)**:

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev\" \"cd ../remote-dashboard && npm run dev\" \"cd ../remote-user-management && npm run dev\""
  }
}
```

### NPM Package Federation

You can publish your remote modules as npm packages while still leveraging Module Federation for dynamic loading. This approach provides versioning, dependency management, and distribution benefits while maintaining the flexibility of federated architecture.

#### Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   DUMP (Host)   │    │  Package Registry │    │ Remote Modules  │
│                 │    │  (npm/private)    │    │  as Packages    │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Federation  │◄┼────┼► @company/dash   │◄───┤ dashboard-pkg   │
│ │   Loader    │ │    │  @company/users  │◄───┤ users-pkg       │
│ │             │ │    │  @company/reports│◄───┤ reports-pkg     │
│ └─────────────┘ │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

#### Step 1: Package Structure

Organize each remote module as a publishable npm package:

```
packages/
├── dashboard-remote/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── index.ts          # Main export
│   │   ├── Dashboard.tsx     # Federated component
│   │   └── routes.tsx
│   └── dist/                 # Built federation assets
├── users-remote/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
└── reports-remote/
    ├── package.json
    ├── vite.config.ts
    └── src/
```

#### Step 2: Package Configuration

**Example `package.json` for a remote module package:**

```json
{
  "name": "@your-company/dashboard-remote",
  "version": "1.2.3",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "federation"
  ],
  "scripts": {
    "build": "vite build",
    "build:federation": "vite build --mode federation",
    "dev": "vite serve",
    "prepublishOnly": "npm run build && npm run build:federation"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@module-federation/enhanced": "^0.6.0",
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "federation": {
    "name": "dashboardRemote",
    "filename": "remoteEntry.js",
    "exposes": {
      "./Dashboard": "./src/Dashboard.tsx",
      "./routes": "./src/routes.tsx"
    }
  }
}
```

#### Step 3: Dual Build Configuration

Configure Vite to build both regular npm package and federation assets:

```typescript
// packages/dashboard-remote/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/enhanced/vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isFederation = mode === 'federation'
  
  if (isFederation) {
    // Federation build configuration
    return {
      plugins: [
        react(),
        federation({
          name: 'dashboardRemote',
          filename: 'remoteEntry.js',
          exposes: {
            './Dashboard': './src/Dashboard.tsx',
            './routes': './src/routes.tsx',
          },
          shared: {
            react: { singleton: true, requiredVersion: '^19.0.0' },
            'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
            'react-router-dom': { singleton: true },
          },
        }),
      ],
      build: {
        outDir: 'federation',
        target: 'esnext',
      },
      server: {
        port: 5174,
      },
    }
  }
  
  // Regular npm package build
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'DashboardRemote',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-router-dom'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
  }
})
```

#### Step 4: Publishing Strategy

**Option A: Public npm Registry**

```bash
# Build and publish
npm run build
npm publish
```

**Option B: Private npm Registry**

```bash
# Configure private registry
npm config set registry https://your-private-registry.com

# Publish to private registry
npm publish
```

**Option C: GitHub Packages**

```json
// .npmrc
@your-company:registry=https://npm.pkg.github.com
```

#### Step 5: Host Configuration for Packaged Remotes

Update DUMP to consume federated modules from npm packages:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/enhanced/vite'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'dump',
      remotes: {
        // Load from CDN (like unpkg or jsDelivr)
        dashboardRemote: 'https://unpkg.com/@your-company/dashboard-remote@latest/federation/remoteEntry.js',
        usersRemote: 'https://unpkg.com/@your-company/users-remote@latest/federation/remoteEntry.js',
        
        // Or from your own CDN
        // dashboardRemote: 'https://cdn.yourcompany.com/@your-company/dashboard-remote/1.2.3/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
})
```

#### Step 6: Dynamic Version Management

Implement runtime version resolution for better control:

```typescript
// src/federation/remoteLoader.ts
interface RemoteConfig {
  name: string
  url: string
  version?: string
}

class FederationLoader {
  private async getRemoteUrl(packageName: string, version = 'latest'): Promise<string> {
    if (import.meta.env.DEV) {
      // Local development URLs
      return `http://localhost:${this.getDevPort(packageName)}/assets/remoteEntry.js`
    }
    
    // Production: resolve from package registry
    const baseUrl = import.meta.env.VITE_CDN_URL || 'https://unpkg.com'
    return `${baseUrl}/${packageName}@${version}/federation/remoteEntry.js`
  }
  
  private getDevPort(packageName: string): number {
    const portMap: Record<string, number> = {
      '@your-company/dashboard-remote': 5174,
      '@your-company/users-remote': 5175,
      '@your-company/reports-remote': 5176,
    }
    return portMap[packageName] || 5174
  }
  
  async loadRemote(packageName: string, version?: string) {
    const url = await this.getRemoteUrl(packageName, version)
    // Dynamic import logic here
    return import(/* @vite-ignore */ url)
  }
}
```

#### Step 7: Development Workflow

**For Package Development:**

```bash
# 1. Develop locally with federation
cd packages/dashboard-remote
npm run dev  # Runs federation dev server on port 5174

# 2. Test with host application
cd ../../dump
npm run dev  # Loads remote from localhost:5174

# 3. Build and test package
cd packages/dashboard-remote
npm run build          # Build npm package
npm run build:federation  # Build federation assets

# 4. Publish new version
npm version patch
npm publish
```

**For Host Development:**

```bash
# Development (uses local remotes)
npm run dev

# Production build (uses published packages)
npm run build
```

#### Benefits of Package Federation

1. **Versioning**: Semantic versioning for remote modules
2. **Dependency Management**: npm handles dependencies and conflicts
3. **Distribution**: Use CDNs and package registries for global distribution
4. **Caching**: Browser caching and CDN edge caching
5. **Security**: Package signing and vulnerability scanning
6. **CI/CD Integration**: Automated testing and publishing
7. **Rollback**: Easy version rollback using package versions

#### Environment Configuration

```env
# Development
VITE_ENVIRONMENT=development
VITE_USE_LOCAL_REMOTES=true

# Staging
VITE_ENVIRONMENT=staging
VITE_CDN_URL=https://cdn-staging.yourcompany.com
VITE_REMOTE_DASHBOARD_VERSION=1.2.3-beta.1

# Production
VITE_ENVIRONMENT=production
VITE_CDN_URL=https://cdn.yourcompany.com
VITE_REMOTE_DASHBOARD_VERSION=1.2.3
VITE_REMOTE_USERS_VERSION=2.1.0
```

This approach gives you the best of both worlds: the distribution and versioning benefits of npm packages with the dynamic loading capabilities of Module Federation.

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
