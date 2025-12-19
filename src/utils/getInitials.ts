export const getInitials = (value?: string) => {
  if (!value || typeof value !== 'string') return ''

  return value
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}
