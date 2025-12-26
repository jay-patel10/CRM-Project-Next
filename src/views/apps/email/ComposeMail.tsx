// React Imports
import { useState } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import type { Editor } from '@tiptap/core'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

// Service Imports
import EmailAPIService from '@/services/emailService'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

type Props = {
  openCompose: boolean
  setOpenCompose: (value: boolean) => void
  isBelowSmScreen: boolean
  isBelowMdScreen: boolean
}

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 plb-2 pli-4 border-bs'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i
          className={classnames('tabler-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classnames('tabler-align-center', {
            'text-textSecondary': !editor.isActive({ textAlign: 'center' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classnames('tabler-align-right', {
            'text-textSecondary': !editor.isActive({ textAlign: 'right' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classnames('tabler-align-justified', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>
    </div>
  )
}

const ComposeMail = (props: Props) => {
  // Props
  const { openCompose, setOpenCompose, isBelowSmScreen, isBelowMdScreen } = props

  // States
  const [visibility, setVisibility] = useState({ cc: false, bcc: false })
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Hooks
  const { settings } = useSettings()

  const toggleVisibility = (value: 'cc' | 'bcc') => {
    setVisibility(prev => ({ ...prev, [value]: !prev[value] }))
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Message'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ]
  })

  // Handle send email
  const handleSendEmail = async () => {
    setError(null)
    setSuccess(null)

    // Validation
    if (!to.trim()) {
      setError('Please enter recipient email')

      return
    }

    if (!subject.trim()) {
      setError('Please enter email subject')

      return
    }

    const body = editor?.getHTML() || ''

    if (!body || body === '<p></p>') {
      setError('Please enter email message')

      return
    }

    try {
      setLoading(true)

      const payload = {
        to: to.trim(),
        subject: subject.trim(),
        body,
        ...(cc && {
          cc: cc
            .split(',')
            .map(e => e.trim())
            .filter(Boolean)
        }),
        ...(bcc && {
          bcc: bcc
            .split(',')
            .map(e => e.trim())
            .filter(Boolean)
        })
      }

      await EmailAPIService.sendEmail(payload)

      setSuccess('✅ Email sent successfully!')

      // Reset form after 2 seconds
      setTimeout(() => {
        setTo('')
        setCc('')
        setBcc('')
        setSubject('')
        editor?.commands.clearContent()
        setSuccess(null)
        setOpenCompose(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer
      anchor='bottom'
      variant='persistent'
      hideBackdrop
      open={openCompose}
      onClose={() => setOpenCompose(false)}
      PaperProps={{
        sx: {
          width: isBelowMdScreen ? 'calc(100% - 2 * 1.5rem)' : '100%',
          maxWidth: 600,
          position: 'absolute',
          height: 'auto',
          insetInlineStart: 'auto',
          insetInlineEnd: '1.5rem',
          insetBlockEnd: '1.5rem',
          borderRadius: 'var(--mui-shape-borderRadius)',
          borderTop: 0,
          boxShadow: settings.skin === 'bordered' ? 'none' : 'var(--mui-customShadows-xl)',
          border: settings.skin === 'bordered' ? '1px solid var(--mui-palette-divider)' : undefined,
          zIndex: 12
        }
      }}
    >
      <div className='flex items-center justify-between plb-3.5 pli-6 bg-actionHover'>
        <Typography variant='h5' color='text.secondary'>
          Compose Mail
        </Typography>
        <div className='flex gap-2'>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-minus text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-x text-textSecondary' />
          </IconButton>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity='error' onClose={() => setError(null)} className='m-4'>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity='success' onClose={() => setSuccess(null)} className='m-4'>
          {success}
        </Alert>
      )}

      <div className='flex items-center gap-2 pli-6 plb-1'>
        <Typography className='font-medium' color='text.disabled'>
          To:
        </Typography>
        <InputBase fullWidth value={to} onChange={e => setTo(e.target.value)} placeholder='recipient@example.com' />
        <div className='text-textSecondary'>
          <span className='cursor-pointer' onClick={() => toggleVisibility('cc')}>
            Cc
          </span>
          <span className='mli-1'>|</span>
          <span className='cursor-pointer' onClick={() => toggleVisibility('bcc')}>
            Bcc
          </span>
        </div>
      </div>

      {visibility.cc && (
        <InputBase
          className='plb-1 pli-6 border-bs'
          value={cc}
          onChange={e => setCc(e.target.value)}
          placeholder='email1@example.com, email2@example.com'
          startAdornment={
            <Typography className='font-medium mie-2' color='text.disabled'>
              Cc:
            </Typography>
          }
        />
      )}

      {visibility.bcc && (
        <InputBase
          className='plb-1 pli-6 border-bs'
          value={bcc}
          onChange={e => setBcc(e.target.value)}
          placeholder='email1@example.com, email2@example.com'
          startAdornment={
            <Typography className='font-medium mie-2' color='text.disabled'>
              Bcc:
            </Typography>
          }
        />
      )}

      <InputBase
        className='plb-1 pli-6 border-bs'
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder='Enter subject'
        startAdornment={
          <Typography className='font-medium mie-2' color='text.disabled'>
            Subject:
          </Typography>
        }
      />

      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className='bs-[105px] overflow-y-auto flex border-bs' />

      <div className='plb-4 pli-5 flex justify-between items-center gap-4'>
        <div className='flex items-center gap-4 max-sm:gap-3'>
          {isBelowSmScreen ? (
            <CustomIconButton color='primary' variant='contained' onClick={handleSendEmail} disabled={loading}>
              {loading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-send' />}
            </CustomIconButton>
          ) : (
            <Button
              variant='contained'
              endIcon={loading ? <CircularProgress size={20} color='inherit' /> : <i className='tabler-send' />}
              onClick={handleSendEmail}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          )}
          <IconButton size='small'>
            <i className='tabler-paperclip text-textSecondary' />
          </IconButton>
        </div>
        <div className='flex gap-2'>
          <IconButton size='small'>
            <i className='tabler-dots-vertical text-textSecondary' />
          </IconButton>
          <IconButton size='small' onClick={() => setOpenCompose(false)}>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        </div>
      </div>
    </Drawer>
  )
}

export default ComposeMail
