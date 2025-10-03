export function isValidEmail(email: string): string {
  if (!email || typeof email !== 'string') throw new Error('Email is required!')

  const trimmedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmedEmail)) throw new Error('Invalid email!')
  return trimmedEmail
}
