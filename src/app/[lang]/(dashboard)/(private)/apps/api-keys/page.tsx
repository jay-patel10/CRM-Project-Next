'use client'

import { useState, useEffect } from 'react'

import { toast } from 'react-toastify'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [formData, setFormData] = useState({
    name: '',
    permissions: [],
    expiresAt: ''
  })

  const availablePermissions = [
    'leads:create',
    'leads:read',
    'leads:update',
    'leads:delete',
    'users:read',
    'users:create',
    'users:update',
    'subscriptions:read'
  ]

  useEffect(() => {
    fetchApiKeys()
  }, [searchQuery, statusFilter])

  const fetchApiKeys = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('isActive', statusFilter)

      const response = await apiClient.get(`/api-keys?${params}`)

      if (response.data.success) {
        setApiKeys(response.data.data)
      } else {
        toast.error(response.data.message || 'Failed to fetch API keys')
      }
    } catch (error) {
      toast.error('Error fetching API keys')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (key = null) => {
    if (key) {
      setEditMode(true)
      setSelectedKey(key)
      setFormData({
        name: key.name,
        permissions: key.permissions || [],
        expiresAt: key.expiresAt ? key.expiresAt.split('T')[0] : ''
      })
    } else {
      setEditMode(false)
      setSelectedKey(null)
      setFormData({ name: '', permissions: [], expiresAt: '' })
    }

    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditMode(false)
    setSelectedKey(null)
    setFormData({ name: '', permissions: [], expiresAt: '' })
  }

  const handleViewKey = async keyId => {
    try {
      const response = await apiClient.get(`/api-keys/${keyId}`)

      if (response.data.success) {
        setSelectedKey(response.data.data)
        setOpenViewDialog(true)
      } else {
        toast.error(response.data.message || 'Failed to fetch API key details')
      }
    } catch (error) {
      toast.error('Error fetching API key details')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || formData.permissions.length === 0) {
      toast.error('Please fill in all required fields')

      return
    }

    try {
      const url = editMode ? `/api-keys/${selectedKey.id}` : '/api-keys'
      const method = editMode ? 'put' : 'post'

      const response = await apiClient[method](url, formData)

      if (response.data.success) {
        toast.success(response.data.message)
        handleCloseDialog()
        fetchApiKeys()

        if (!editMode && response.data.data.key) {
          navigator.clipboard.writeText(response.data.data.key)
          toast.info('API Key copied to clipboard! Save it securely.')
        }
      } else {
        toast.error(response.data.message || 'Operation failed')
      }
    } catch (error) {
      toast.error('Error processing request')
    }
  }

  const handleToggleStatus = async keyId => {
    try {
      const response = await apiClient.patch(`/api-keys/${keyId}/toggle`)

      if (response.data.success) {
        toast.success(response.data.message)
        fetchApiKeys()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Error toggling status')
    }
  }

  const handleRegenerate = async keyId => {
    if (!confirm('Regenerate this key? The old key will stop working immediately.')) {
      return
    }

    try {
      const response = await apiClient.post(`/api-keys/${keyId}/regenerate`)

      if (response.data.success) {
        toast.success('Key regenerated!')

        if (response.data.data.key) {
          navigator.clipboard.writeText(response.data.data.key)
          toast.info('New key copied to clipboard!')
        }

        fetchApiKeys()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Error regenerating key')
    }
  }

  const handleDelete = async keyId => {
    if (!confirm('Delete this API key? This cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.delete(`/api-keys/${keyId}`)

      if (response.data.success) {
        toast.success('API Key deleted')
        fetchApiKeys()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error('Error deleting key')
    }
  }

  const handleCopyKey = key => {
    navigator.clipboard.writeText(key)
    toast.success('Copied to clipboard!')
  }

  const togglePermission = permission => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <Card>
        <CardContent>
          <div className='flex justify-between items-center'>
            <div>
              <Typography variant='h4' className='font-bold mb-1'>
                API Keys Management
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Create and manage API keys for external integrations
              </Typography>
            </div>
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => handleOpenDialog()}>
              Create API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className='flex gap-4'>
            <CustomTextField
              fullWidth
              placeholder='Search by name...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <CustomTextField
              select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='min-w-[150px]'
            >
              <MenuItem value='all'>All Status</MenuItem>
              <MenuItem value='true'>Active</MenuItem>
              <MenuItem value='false'>Inactive</MenuItem>
            </CustomTextField>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b'>
                <th className='px-6 py-3 text-left text-sm font-medium'>Name</th>
                <th className='px-6 py-3 text-left text-sm font-medium'>Key</th>
                <th className='px-6 py-3 text-left text-sm font-medium'>Permissions</th>
                <th className='px-6 py-3 text-left text-sm font-medium'>Status</th>
                <th className='px-6 py-3 text-left text-sm font-medium'>Last Used</th>
                <th className='px-6 py-3 text-left text-sm font-medium'>Expires</th>
                <th className='px-6 py-3 text-right text-sm font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className='px-6 py-12 text-center text-gray-500'>
                    Loading...
                  </td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className='px-6 py-12 text-center text-gray-500'>
                    No API keys found. Create your first one!
                  </td>
                </tr>
              ) : (
                apiKeys.map(key => (
                  <tr key={key.id} className='border-b hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <Typography variant='body2' className='font-medium'>
                        {key.name}
                      </Typography>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <code className='text-sm text-gray-600'>crm_••••••••••••</code>
                        <Tooltip title='View full key'>
                          <IconButton size='small' onClick={() => handleViewKey(key.id)}>
                            <i className='tabler-eye text-xl' />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-1 flex-wrap'>
                        {key.permissions
                          ?.slice(0, 2)
                          .map(perm => <Chip key={perm} label={perm} size='small' color='primary' variant='tonal' />)}
                        {key.permissions?.length > 2 && (
                          <Chip label={`+${key.permissions.length - 2}`} size='small' variant='tonal' />
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <Chip
                        label={key.isActive ? 'Active' : 'Inactive'}
                        size='small'
                        color={key.isActive ? 'success' : 'default'}
                        variant='tonal'
                      />
                    </td>
                    <td className='px-6 py-4'>
                      <Typography variant='body2'>
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                      </Typography>
                    </td>
                    <td className='px-6 py-4'>
                      <Typography variant='body2'>
                        {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                      </Typography>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-2'>
                        <Tooltip title='Toggle Status'>
                          <IconButton size='small' onClick={() => handleToggleStatus(key.id)}>
                            <i className='tabler-power text-xl' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Regenerate'>
                          <IconButton size='small' onClick={() => handleRegenerate(key.id)}>
                            <i className='tabler-refresh text-xl' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Edit'>
                          <IconButton size='small' onClick={() => handleOpenDialog(key)}>
                            <i className='tabler-edit text-xl' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete'>
                          <IconButton size='small' color='error' onClick={() => handleDelete(key.id)}>
                            <i className='tabler-trash text-xl' />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editMode ? 'Edit API Key' : 'Create New API Key'}</DialogTitle>
        <DialogContent>
          <Box className='space-y-4 mt-2'>
            <CustomTextField
              fullWidth
              label='API Key Name'
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder='e.g., Production API Key'
            />

            <div>
              <Typography variant='subtitle2' className='mb-2'>
                Permissions
              </Typography>
              <Grid container spacing={2}>
                {availablePermissions.map(permission => (
                  <Grid item xs={6} key={permission}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />
                      }
                      label={permission}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>

            <CustomTextField
              fullWidth
              type='date'
              label='Expiration Date (Optional)'
              value={formData.expiresAt}
              onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText='Leave empty for no expiration'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant='contained'>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Key Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>API Key Details</DialogTitle>
        <DialogContent>
          {selectedKey && (
            <Box className='space-y-4 mt-2'>
              <CustomTextField
                fullWidth
                label='Key'
                value={selectedKey.key}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={() => handleCopyKey(selectedKey.key)}>
                      <i className='tabler-copy' />
                    </IconButton>
                  )
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
