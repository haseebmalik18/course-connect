const CUNY_EMAIL_DOMAINS = [
  'bcmail.cuny.edu',
  'myhunter.cuny.edu',
  'citymail.cuny.edu',
  'baruch.cuny.edu',
  'jjay.cuny.edu',
  'lehman.cuny.edu'
]

export function validateCunyEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailLower = email.toLowerCase().trim()
  
  if (!emailLower.includes('@')) {
    return false
  }

  const domain = emailLower.split('@')[1]
  return CUNY_EMAIL_DOMAINS.includes(domain)
}

export function getCunyEmailErrorMessage(email: string): string {
  if (!email) {
    return 'Email is required'
  }
  
  if (!email.includes('@')) {
    return 'Please enter a valid email address'
  }
  
  const domain = email.toLowerCase().trim().split('@')[1]
  if (domain && !CUNY_EMAIL_DOMAINS.includes(domain)) {
    return `"${domain}" is not a valid CUNY email domain. Please use a valid CUNY email address (e.g., your.name@cuny.edu, your.name@hunter.cuny.edu)`
  }
  
  return 'Please use a valid CUNY email address (e.g., your.name@cuny.edu, your.name@hunter.cuny.edu)'
}