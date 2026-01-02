'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { toast } from 'react-toastify'

export default function ApiIntegrationPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('leads')
  const [selectedMethod, setSelectedMethod] = useState('GET')

  const apiEndpoints = {
    leads: {
      title: 'Leads API',
      baseUrl: '/leads',
      methods: {
        GET: {
          endpoint: '/leads',
          description: 'Get all leads with pagination and filters',
          auth: 'Required',
          permissions: ['leads.read'],
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
            { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 10)' },
            { name: 'search', type: 'string', required: false, description: 'Search by name, email, or phone' },
            { name: 'status', type: 'string', required: false, description: 'Filter by status ID' }
          ],
          example: `curl -X GET "http://localhost:5000/leads?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        },
        POST: {
          endpoint: '/leads',
          description: 'Create a new lead',
          auth: 'Required',
          permissions: ['leads.create'],
          body: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            company: 'Acme Corp',
            statusId: 1
          },
          example: `curl -X POST "http://localhost:5000/leads" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "statusId": 1
  }'`
        },
        PUT: {
          endpoint: '/leads/:id',
          description: 'Update an existing lead',
          auth: 'Required',
          permissions: ['leads.update'],
          body: {
            name: 'John Doe Updated',
            email: 'john.updated@example.com',
            statusId: 2
          },
          example: `curl -X PUT "http://localhost:5000/leads/123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe Updated",
    "statusId": 2
  }'`
        },
        DELETE: {
          endpoint: '/leads/:id',
          description: 'Delete a lead',
          auth: 'Required',
          permissions: ['leads.delete'],
          example: `curl -X DELETE "http://localhost:5000/leads/123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        }
      }
    },
    users: {
      title: 'Users API',
      baseUrl: '/users',
      methods: {
        GET: {
          endpoint: '/users',
          description: 'Get all users',
          auth: 'Required',
          permissions: ['users.read'],
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number' },
            { name: 'limit', type: 'number', required: false, description: 'Items per page' },
            { name: 'search', type: 'string', required: false, description: 'Search by name or email' }
          ],
          example: `curl -X GET "http://localhost:5000/users" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        },
        POST: {
          endpoint: '/users',
          description: 'Create a new user',
          auth: 'Required',
          permissions: ['users.create'],
          body: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            password: 'securePassword123',
            roleId: 3
          },
          example: `curl -X POST "http://localhost:5000/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123",
    "roleId": 3
  }'`
        }
      }
    },
    apiKeys: {
      title: 'API Keys API',
      baseUrl: '/api-keys',
      methods: {
        GET: {
          endpoint: '/api-keys',
          description: 'Get all API keys',
          auth: 'Required',
          permissions: ['api_keys.read'],
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number' },
            { name: 'limit', type: 'number', required: false, description: 'Items per page' },
            { name: 'search', type: 'string', required: false, description: 'Search by name' },
            { name: 'isActive', type: 'boolean', required: false, description: 'Filter by active status' }
          ],
          example: `curl -X GET "http://localhost:5000/api-keys" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
        },
        POST: {
          endpoint: '/api-keys',
          description: 'Create a new API key',
          auth: 'Required',
          permissions: ['api_keys.create'],
          body: {
            name: 'Production Key',
            permissions: ['leads:read', 'leads:create'],
            expiresAt: '2025-12-31'
          },
          example: `curl -X POST "http://localhost:5000/api-keys" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Key",
    "permissions": ["leads:read", "leads:create"],
    "expiresAt": "2025-12-31"
  }'`
        }
      }
    }
  }

  const currentEndpoint = apiEndpoints[selectedEndpoint]
  const currentMethod = currentEndpoint?.methods[selectedMethod]

  const handleCopyCode = code => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard!')
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <Card>
        <CardContent>
          <Typography variant='h4' className='font-bold mb-1'>
            API Integration
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Complete documentation for integrating with the CRM API
          </Typography>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardContent>
          <Typography variant='h5' className='font-bold mb-4'>
            Getting Started
          </Typography>
          <div className='space-y-4'>
            <div>
              <Typography variant='subtitle1' className='font-semibold mb-2'>
                1. Create an API Key
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Go to the{' '}
                <a href='/en/apps/api-keys' className='text-primary'>
                  API Keys page
                </a>{' '}
                to create a new API key with the required permissions.
              </Typography>
            </div>
            <div>
              <Typography variant='subtitle1' className='font-semibold mb-2'>
                2. Authentication
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mb-2'>
                Include your API key in the Authorization header:
              </Typography>
              <Box className='bg-gray-900 text-white p-4 rounded-lg relative font-mono text-sm'>
                <code>Authorization: Bearer YOUR_API_KEY</code>
                <Button
                  size='small'
                  onClick={() => handleCopyCode('Authorization: Bearer YOUR_API_KEY')}
                  className='absolute top-2 right-2 text-white'
                >
                  <i className='tabler-copy' />
                </Button>
              </Box>
            </div>
            <div>
              <Typography variant='subtitle1' className='font-semibold mb-2'>
                3. Base URL
              </Typography>
              <Box className='bg-gray-900 text-white p-3 rounded-lg font-mono text-sm'>http://localhost:5000</Box>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-12 gap-6'>
        {/* Sidebar */}
        <div className='col-span-3'>
          <Card className='sticky top-6'>
            <CardContent>
              <Typography variant='h6' className='font-semibold mb-3'>
                Endpoints
              </Typography>
              <div className='space-y-1'>
                {Object.keys(apiEndpoints).map(key => (
                  <Button
                    key={key}
                    fullWidth
                    variant={selectedEndpoint === key ? 'contained' : 'text'}
                    onClick={() => {
                      setSelectedEndpoint(key)
                      setSelectedMethod(Object.keys(apiEndpoints[key].methods)[0])
                    }}
                    className='justify-start'
                  >
                    {apiEndpoints[key].title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className='col-span-9'>
          <Card>
            <CardContent>
              {/* Method Tabs */}
              <Box className='flex gap-2 mb-6 border-b pb-4'>
                {Object.keys(currentEndpoint.methods).map(method => (
                  <Button
                    key={method}
                    variant={selectedMethod === method ? 'contained' : 'outlined'}
                    onClick={() => setSelectedMethod(method)}
                  >
                    {method}
                  </Button>
                ))}
              </Box>

              {/* Method Details */}
              <div className='space-y-6'>
                <div>
                  <Box className='flex items-center gap-3 mb-2'>
                    <Chip
                      label={selectedMethod}
                      color={
                        selectedMethod === 'GET'
                          ? 'success'
                          : selectedMethod === 'POST'
                            ? 'primary'
                            : selectedMethod === 'PUT'
                              ? 'warning'
                              : 'error'
                      }
                    />
                    <Typography variant='h6' component='code' className='font-mono'>
                      {currentMethod.endpoint}
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {currentMethod.description}
                  </Typography>
                </div>

                {/* Auth & Permissions */}
                <div className='grid grid-cols-2 gap-4'>
                  <Card variant='outlined'>
                    <CardContent>
                      <Typography variant='caption' color='text.secondary'>
                        Authentication
                      </Typography>
                      <Typography variant='body1' className='font-semibold'>
                        {currentMethod.auth}
                      </Typography>
                    </CardContent>
                  </Card>
                  {currentMethod.permissions && currentMethod.permissions.length > 0 && (
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='caption' color='text.secondary' className='mb-2'>
                          Required Permissions
                        </Typography>
                        <Box className='flex gap-1 flex-wrap'>
                          {currentMethod.permissions.map(perm => (
                            <Chip key={perm} label={perm} size='small' color='primary' variant='outlined' />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Parameters Table */}
                {currentMethod.parameters && (
                  <div>
                    <Typography variant='h6' className='font-semibold mb-3'>
                      Query Parameters
                    </Typography>
                    <Card variant='outlined'>
                      <table className='w-full'>
                        <thead className='bg-50'>
                          <tr>
                            <th className='px-4 py-2 text-left text-sm font-medium'>Parameter</th>
                            <th className='px-4 py-2 text-left text-sm font-medium'>Type</th>
                            <th className='px-4 py-2 text-left text-sm font-medium'>Required</th>
                            <th className='px-4 py-2 text-left text-sm font-medium'>Description</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y'>
                          {currentMethod.parameters.map(param => (
                            <tr key={param.name}>
                              <td className='px-4 py-2 font-mono text-sm text-primary'>{param.name}</td>
                              <td className='px-4 py-2 text-sm'>{param.type}</td>
                              <td className='px-4 py-2'>
                                <Chip
                                  label={param.required ? 'Yes' : 'No'}
                                  size='small'
                                  color={param.required ? 'error' : 'default'}
                                />
                              </td>
                              <td className='px-4 py-2 text-sm'>{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </div>
                )}

                {/* Request Body */}
                {currentMethod.body && (
                  <div>
                    <Typography variant='h6' className='font-semibold mb-3'>
                      Request Body
                    </Typography>
                    <Box className='bg-gray-900 text-white p-4 rounded-lg relative font-mono text-sm'>
                      <pre>{JSON.stringify(currentMethod.body, null, 2)}</pre>
                      <Button
                        size='small'
                        onClick={() => handleCopyCode(JSON.stringify(currentMethod.body, null, 2))}
                        className='absolute top-2 right-2 text-white'
                      >
                        <i className='tabler-copy' />
                      </Button>
                    </Box>
                  </div>
                )}

                {/* Example */}
                <div>
                  <Typography variant='h6' className='font-semibold mb-3'>
                    Example Request
                  </Typography>
                  <Box className='bg-gray-900 text-white p-4 rounded-lg relative font-mono text-sm overflow-x-auto'>
                    <pre className='whitespace-pre-wrap'>{currentMethod.example}</pre>
                    <Button
                      size='small'
                      onClick={() => handleCopyCode(currentMethod.example)}
                      className='absolute top-2 right-2 text-white'
                    >
                      <i className='tabler-copy' />
                    </Button>
                  </Box>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Response Codes */}
      <Card>
        <CardContent>
          <Typography variant='h5' className='font-bold mb-4'>
            Response Codes
          </Typography>
          <div className='grid grid-cols-2 gap-4'>
            {[
              { code: '200', label: 'Success', desc: 'Request completed successfully', color: 'success' },
              { code: '201', label: 'Created', desc: 'Resource created successfully', color: 'primary' },
              { code: '400', label: 'Bad Request', desc: 'Invalid request parameters', color: 'warning' },
              { code: '401', label: 'Unauthorized', desc: 'Invalid or missing API key', color: 'error' },
              { code: '403', label: 'Forbidden', desc: 'Insufficient permissions', color: 'error' },
              { code: '500', label: 'Server Error', desc: 'Internal server error', color: 'error' }
            ].map(item => (
              <Box key={item.code} className='flex items-start gap-3'>
                <Chip label={item.code} color={item.color as any} />
                <div>
                  <Typography variant='body1' className='font-medium'>
                    {item.label}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {item.desc}
                  </Typography>
                </div>
              </Box>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
