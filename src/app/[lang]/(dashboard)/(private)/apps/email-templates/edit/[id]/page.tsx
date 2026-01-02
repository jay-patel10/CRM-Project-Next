'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import CustomTextField from '@core/components/mui/TextField'
import { showToast } from '@/utils/toast'
import apiClient from '@/libs/api'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const EditEmailTemplatePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const templateId = params.id

  const [tabValue, setTabValue] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subject: '',
    body: '',
    variables: '',
    isActive: true
  })

  // Visual editor state
  const [styling, setStyling] = useState({
    primaryColor: '#7367F0',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    buttonColor: '#7367F0',
    buttonTextColor: '#ffffff'
  })

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

          // Extract colors from existing HTML
          extractStylingFromHTML(template.body)
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

  const extractStylingFromHTML = (html: string) => {
    // Extract colors and styles from existing HTML
    const primaryColorMatch = html.match(/background[:-]#?([A-Fa-f0-9]{6})/i)
    const textColorMatch = html.match(/color[:-]#?([A-Fa-f0-9]{6})/i)

    if (primaryColorMatch) {
      setStyling(prev => ({ ...prev, primaryColor: `#${primaryColorMatch[1]}` }))
    }

    if (textColorMatch) {
      setStyling(prev => ({ ...prev, textColor: `#${textColorMatch[1]}` }))
    }
  }

  const applyStylesToHTML = (html: string) => {
    let styledHTML = html

    // Replace color values in the HTML
    styledHTML = styledHTML.replace(/background:#[A-Fa-f0-9]{6}/gi, `background:${styling.buttonColor}`)
    styledHTML = styledHTML.replace(/color:#[A-Fa-f0-9]{6}/gi, `color:${styling.textColor}`)
    styledHTML = styledHTML.replace(/font-family:[^;]+/gi, `font-family:${styling.fontFamily}`)

    return styledHTML
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject.trim()) {
      showToast.error('Subject is required')

      return
    }

    setLoading(true)

    try {
      const variables = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v)

      // Apply styling to HTML body
      const styledBody = applyStylesToHTML(formData.body)

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        subject: formData.subject.trim(),
        body: styledBody,
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

  // Generate preview HTML
  const previewHTML = applyStylesToHTML(formData.body)

  return (
    <Card>
      <CardHeader title={`Customize: ${formData.name}`} />
      <Divider />

      <CardContent>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label='Visual Editor' />
          <Tab label='Content' />
          <Tab label='Preview' />
        </Tabs>

        <form onSubmit={handleSubmit}>
          {/* Visual Editor Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  Color & Style Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' gutterBottom>
                  Primary/Button Color
                </Typography>
                <div className='flex gap-2 items-center'>
                  <input
                    type='color'
                    value={styling.buttonColor}
                    onChange={e => setStyling(prev => ({ ...prev, buttonColor: e.target.value }))}
                    style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }}
                  />
                  <CustomTextField
                    value={styling.buttonColor}
                    onChange={e => setStyling(prev => ({ ...prev, buttonColor: e.target.value }))}
                    size='small'
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' gutterBottom>
                  Text Color
                </Typography>
                <div className='flex gap-2 items-center'>
                  <input
                    type='color'
                    value={styling.textColor}
                    onChange={e => setStyling(prev => ({ ...prev, textColor: e.target.value }))}
                    style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }}
                  />
                  <CustomTextField
                    value={styling.textColor}
                    onChange={e => setStyling(prev => ({ ...prev, textColor: e.target.value }))}
                    size='small'
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='body2' gutterBottom>
                  Background Color
                </Typography>
                <div className='flex gap-2 items-center'>
                  <input
                    type='color'
                    value={styling.backgroundColor}
                    onChange={e => setStyling(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }}
                  />
                  <CustomTextField
                    value={styling.backgroundColor}
                    onChange={e => setStyling(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    size='small'
                  />
                </div>
              </Grid>

              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  select
                  label='Font Family'
                  value={styling.fontFamily}
                  onChange={e => setStyling(prev => ({ ...prev, fontFamily: e.target.value }))}
                  SelectProps={{ native: true }}
                >
                  <option value='Arial, sans-serif'>Arial</option>
                  <option value='Helvetica, sans-serif'>Helvetica</option>
                  <option value='Georgia, serif'>Georgia</option>
                  <option value='Times New Roman, serif'>Times New Roman</option>
                  <option value='Verdana, sans-serif'>Verdana</option>
                </CustomTextField>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Content Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Email Subject'
                  value={formData.subject}
                  onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  helperText='Use {{variable_name}} for dynamic content'
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  multiline
                  rows={16}
                  label='Email Body (HTML)'
                  value={formData.body}
                  onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  helperText='Modify text content. Colors will be applied from Visual Editor tab.'
                />
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
            </Grid>
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant='h6' gutterBottom>
              Email Preview
            </Typography>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Subject: {formData.subject}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Paper elevation={2} sx={{ p: 3, backgroundColor: styling.backgroundColor }}>
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            </Paper>
          </TabPanel>

          {/* Action Buttons */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <div className='flex gap-4'>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  startIcon={loading ? <i className='tabler-loader animate-spin' /> : <i className='tabler-check' />}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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
