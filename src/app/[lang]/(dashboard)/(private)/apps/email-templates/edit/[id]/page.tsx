'use client'

import { useState, useEffect } from 'react'

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
import CircularProgress from '@mui/material/CircularProgress'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

const EditEmailTemplatePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const templateId = params.id

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
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    try {
      const response = await apiClient.get('/emails/templates')

      if (response.data.success) {
        const template = response.data.templates.find((t: any) => t.id === parseInt(templateId))

        if (template) {
          setFormData({
            name: template.name,
            slug: template.slug,
            subject: template.subject,
            body: template.body,
            variables: Array.isArray(template.variables) ? template.variables.join(', ') : '',
            isActive: template.isActive
          })
        } else {
          showToast.error('Template not found')
          router.push(`/${locale}/apps/email-templates/list`)
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch template:', err)
      showToast.error('Failed to load template')
    } finally {
      setFetching(false)
    }
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

    if (formData.variables.trim()) {
      const vars = formData.variables.split(',').map(v => v.trim())
      const invalidVars = vars.filter(v => !/^[a-z_][a-z0-9_]*$/i.test(v))

      if (invalidVars.length > 0) {
        newErrors.variables = `Invalid variable names: ${invalidVars.join(', ')}`
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

      const response = await apiClient.put(`/emails/templates/${templateId}`, payload)

      if (response.data.success) {
        showToast.success('Email template updated successfully!')
        router.push(`/${locale}/apps/email-templates/list`)
      } else {
        showToast.error(response.data.message || 'Failed to update template')
      }
    } catch (err: any) {
      console.error('Update error:', err)
      const errorMessage = err.response?.data?.message || 'Error updating template'

      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center' style={{ minHeight: 400 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  const extractedVars = formData.body.match(/{{([^}]+)}}/g)?.map(v => v.slice(2, -2)) || []

  const declaredVars = formData.variables
    .split(',')
    .map(v => v.trim())
    .filter(v => v)

  const missingVars = extractedVars.filter(v => !declaredVars.includes(v))

  return (
    <Card>
      <CardHeader title='Edit Email Template' />
      <Divider />

      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Template Name'
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomTextField
                fullWidth
                label='Slug'
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                error={!!errors.slug}
                helperText={errors.slug}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Email Subject'
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                error={!!errors.subject}
                helperText={errors.subject || 'Use {{variable_name}} for dynamic content'}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={12}
                label='Email Body (HTML)'
                value={formData.body}
                onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                error={!!errors.body}
                helperText={errors.body}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Variables (comma-separated)'
                value={formData.variables}
                onChange={e => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                error={!!errors.variables}
                helperText={errors.variables}
              />

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
                      Missing: {missingVars.join(', ')}
                    </Typography>
                  )}
                </Alert>
              )}
            </Grid>

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
            </Grid>

            <Grid item xs={12}>
              <div className='flex gap-4'>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Updating...' : 'Update Template'}
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

export default EditEmailTemplatePage
