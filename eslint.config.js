import js from '@eslint/js'
import typescript from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
