// app/[lang]/(dashboard)/(private)/apps/google-tag-manager/page.tsx
'use client'

import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { showToast } from '@/utils/toast'

import { extractTrackingParams, getStoredTrackingParams, pushToDataLayer, clearTrackingParams } from '@/utils/gtm'
import apiClient from '@/libs/api'

const GoogleTagManagerPage = () => {
  const [gtmId, setGtmId] = useState('')
  const [currentParams, setCurrentParams] = useState<any>({})
  const [testEvent, setTestEvent] = useState('')
  const [recentEvents, setRecentEvents] = useState<any[]>([])

  const [stats, setStats] = useState({
    totalLeads: 0,
    withUTM: 0,
    sources: []
  })

  useEffect(() => {
    // Load current tracking params
    const params = getStoredTrackingParams()

    setCurrentParams(params)

    // Load GTM ID from localStorage if exists
    const savedGtmId = localStorage.getItem('gtmId')

    if (savedGtmId) setGtmId(savedGtmId)

    // Fetch lead statistics
    fetchLeadStats()
  }, [])

  const fetchLeadStats = async () => {
    try {
      const response = await apiClient.get('/leads/stats')

      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSaveGTM = () => {
    if (!gtmId.startsWith('GTM-')) {
      showToast.error('Invalid GTM ID format. Should start with GTM-')

      return
    }

    localStorage.setItem('gtmId', gtmId)
    showToast.success('GTM ID saved successfully')

    // Reload page to initialize GTM
    setTimeout(() => window.location.reload(), 1000)
  }

  const handleTestEvent = () => {
    if (!testEvent.trim()) {
      showToast.error('Please enter an event name')

      return
    }

    const eventData = {
      event: testEvent,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    }

    pushToDataLayer(eventData)

    setRecentEvents(prev => [eventData, ...prev.slice(0, 9)])
    showToast.success(`Event "${testEvent}" pushed to dataLayer`)
    setTestEvent('')
  }

  const handleClearParams = () => {
    clearTrackingParams()
    setCurrentParams({})
    showToast.success('Tracking parameters cleared')
  }

  const handleRefreshParams = () => {
    const params = extractTrackingParams()

    setCurrentParams(params)

    if (Object.keys(params).length > 0) {
      showToast.success('Parameters extracted from current URL')
    } else {
      showToast('No tracking parameters found in current URL', { icon: 'ℹ️' })
    }
  }

  return (
    <Grid container spacing={6}>
      {/* GTM Configuration */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Google Tag Manager Configuration' />
          <CardContent>
            <Alert severity='info' sx={{ mb: 4 }}>
              Enter your GTM Container ID to enable tracking. The ID format is GTM-XXXXXXX. You can find this in your
              Google Tag Manager account.
            </Alert>

            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label='GTM Container ID'
                  placeholder='GTM-XXXXXXX'
                  value={gtmId}
                  onChange={e => setGtmId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant='contained' onClick={handleSaveGTM} sx={{ height: '56px' }}>
                  Save & Initialize GTM
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Current Tracking Parameters */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Current Session Tracking'
            action={
              <Box>
                <Tooltip title='Refresh from URL'>
                  <IconButton onClick={handleRefreshParams} size='small'>
                    <i className='tabler-refresh' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Clear parameters'>
                  <IconButton onClick={handleClearParams} size='small'>
                    <i className='tabler-trash' />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          <CardContent>
            {Object.keys(currentParams).length === 0 ? (
              <Alert severity='warning'>
                No tracking parameters detected. Visit a URL with UTM parameters to test.
              </Alert>
            ) : (
              <TableContainer>
                <Table size='small'>
                  <TableBody>
                    {Object.entries(currentParams).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                        <TableCell>{value as string}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant='body2' color='text.secondary'>
              These parameters are automatically captured from the URL and stored for lead attribution.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Lead Statistics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Lead Attribution Statistics' />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Box textAlign='center'>
                  <Typography variant='h3' color='primary'>
                    {stats.totalLeads}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Total Leads
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign='center'>
                  <Typography variant='h3' color='success.main'>
                    {stats.withUTM}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    With UTM Data
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              Top Sources:
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={1}>
              {stats.sources.map((source: any, index) => (
                <Chip
                  key={index}
                  label={`${source.name} (${source.count})`}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Test Events */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Test DataLayer Events' />
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label='Event Name'
                  placeholder='test_event'
                  value={testEvent}
                  onChange={e => setTestEvent(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleTestEvent()}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant='outlined' onClick={handleTestEvent} sx={{ height: '56px' }}>
                  Push Test Event
                </Button>
              </Grid>
            </Grid>

            {recentEvents.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant='subtitle2' sx={{ mb: 2 }}>
                  Recent Events (Check Browser Console):
                </Typography>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Page</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentEvents.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={event.event} size='small' />
                          </TableCell>
                          <TableCell>{new Date(event.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell>{event.page}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* URL Testing Examples */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Testing Guide' />
          <CardContent>
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              Test URL Examples (Click to copy):
            </Typography>

            {[
              '?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale',
              '?utm_source=facebook&utm_medium=social&utm_campaign=awareness',
              '?utm_source=email&utm_medium=newsletter&utm_campaign=monthly',
              '?gclid=abc123&utm_source=google&utm_medium=cpc'
            ].map((params, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Button
                  size='small'
                  variant='outlined'
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + window.location.pathname + params)
                    showToast.success('URL copied to clipboard')
                  }}
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                >
                  {window.location.pathname + params}
                </Button>
              </Box>
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant='body2' color='text.secondary'>
              <strong>How it works:</strong>
              <br />
              1. Visit a URL with UTM parameters
              <br />
              2. Parameters are automatically extracted and stored
              <br />
              3. When creating a lead, parameters are attached for attribution
              <br />
              4. View lead data in the Leads section with source information
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default GoogleTagManagerPage
