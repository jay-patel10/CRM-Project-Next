'use client'

import { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

const AddEmailTemplatePage = () => {
  const router = useRouter()
  const { lang: locale } = useParams()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subject: '',
    body: '',
    variables: '',
    isActive: true
  })

  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }))
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Email body is required'
    }

    // Validate variables format (comma-separated)
    if (formData.variables.trim()) {
      const vars = formData.variables.split(',').map(v => v.trim())
      const invalidVars = vars.filter(v => !/^[a-z_][a-z0-9_]*$/i.test(v))

      if (invalidVars.length > 0) {
        newErrors.variables = `Invalid variable names: ${invalidVars.join(', ')}. Use only letters, numbers, and underscores.`
      }
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast.error('Please fix all validation errors')

      return
    }

    setLoading(true)

    try {
      // Convert comma-separated variables to array
      const variables = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v)

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        variables,
        isActive: formData.isActive
      }

      const response = await apiClient.post('/emails/templates', payload)

      if (response.data.success) {
        showToast.success('Email template created successfully!')
        router.push(`/${locale}/apps/email-templates/list`)
      } else {
        showToast.error(response.data.message || 'Failed to create template')
      }
    } catch (err: any) {
      console.error('Create error:', err)
      const errorMessage = err.response?.data?.message || 'Error creating template'

      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const extractedVars = formData.body.match(/{{([^}]+)}}/g)?.map(v => v.slice(2, -2)) || []

  const declaredVars = formData.variables
    .split(',')
    .map(v => v.trim())
    .filter(v => v)

  const missingVars = extractedVars.filter(v => !declaredVars.includes(v))

  return (
    <Card>
      <CardHeader title='Add Email Template' />
      <Divider />

      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            {/* Template Name */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Template Name'
                placeholder='e.g., Welcome Email'
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Slug */}
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Slug (URL-friendly identifier)'
                placeholder='e.g., welcome-email'
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                error={!!errors.slug}
                helperText={errors.slug || 'Auto-generated from name, can be edited'}
                required
              />
            </Grid>

            {/* Subject */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Email Subject'
                placeholder='e.g., Welcome to {{company_name}}, {{name}}!'
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                error={!!errors.subject}
                helperText={errors.subject || 'Use {{variable_name}} for dynamic content'}
                required
              />
            </Grid>

            {/* Body */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={12}
                label='Email Body (HTML)'
                placeholder='Enter HTML email template with {{variables}}'
                value={formData.body}
                onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                error={!!errors.body}
                helperText={errors.body || 'Full HTML is supported. Use {{variable_name}} for dynamic content'}
                required
              />
            </Grid>

            {/* Variables */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Variables (comma-separated)'
                placeholder='e.g., name, email, company_name, reset_link'
                value={formData.variables}
                onChange={e => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                error={!!errors.variables}
                helperText={errors.variables || 'List all variables used in subject and body'}
              />

              {/* Variable Detection Helper */}
              {extractedVars.length > 0 && (
                <Alert severity={missingVars.length > 0 ? 'warning' : 'success'} sx={{ mt: 2 }}>
                  <Typography variant='body2' fontWeight='medium' gutterBottom>
                    Variables found in template:
                  </Typography>
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {extractedVars.map((v, i) => (
                      <Chip
                        key={i}
                        label={v}
                        size='small'
                        color={declaredVars.includes(v) ? 'success' : 'warning'}
                        variant='outlined'
                      />
                    ))}
                  </div>
                  {missingVars.length > 0 && (
                    <Typography variant='caption' color='warning.main' sx={{ mt: 1, display: 'block' }}>
                      Missing in variables list: {missingVars.join(', ')}
                    </Typography>
                  )}
                </Alert>
              )}
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                }
                label='Active Template'
              />
              <Typography variant='caption' color='text.secondary' display='block' sx={{ ml: 4 }}>
                Only active templates can be used for sending emails
              </Typography>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <div className='flex gap-4'>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Creating...' : 'Create Template'}
                </Button>

                <Button
                  variant='tonal'
                  color='secondary'
                  onClick={() => router.push(`/${locale}/apps/email-templates/list`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddEmailTemplatePage
