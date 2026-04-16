export function isValidEmail(email: string): boolean {
  // Matches the same level of strictness as the server-side check.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

