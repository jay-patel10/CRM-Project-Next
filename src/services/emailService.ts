// src/services/emailService.ts

interface SendEmailPayload {
  to: string
  subject: string
  body: string
  cc?: string[]
  bcc?: string[]
}

interface SendEmailResponse {
  success: boolean
  message: string
}

class EmailAPIService {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }

    return null
  }

  // Send email using generic-email template
  async sendEmail(payload: SendEmailPayload): Promise<SendEmailResponse> {
    try {
      const token = this.getAuthToken()

      const requestBody = {
        to: payload.to,
        templateSlug: 'generic-email',
        variables: {
          subject: payload.subject,
          body: payload.body
        },
        cc: payload.cc,
        bcc: payload.bcc
      }

      console.log('📤 Frontend - Sending email request:', requestBody)
      console.log('🔑 Token:', token ? 'Present' : 'Missing')

      const response = await fetch(`${this.baseURL}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status)

      const data = await response.json()

      console.log('📥 Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }

      return {
        success: true,
        message: data.message || 'Email sent successfully'
      }
    } catch (error) {
      console.error('❌ Frontend email send error:', error)
      throw error
    }
  }

  // Get all email templates
  async getTemplates() {
    try {
      const token = this.getAuthToken()

      const response = await fetch(`${this.baseURL}/emails/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch templates')
      }

      return data
    } catch (error) {
      console.error('❌ Fetch templates error:', error)
      throw error
    }
  }
}

export default new EmailAPIService()
