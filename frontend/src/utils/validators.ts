// ─── SENTINEL Validators ──────────────────────────────────────────────────────
// Input validation functions used in forms.
// All functions return { valid: boolean, message: string }.

export interface ValidationResult {
  valid: boolean;
  message: string;
}

// ─── Email ────────────────────────────────────────────────────────────────────

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) return { valid: false, message: 'Email is required.' };
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) return { valid: false, message: 'Please enter a valid email address.' };
  return { valid: true, message: '' };
};

// ─── Password ─────────────────────────────────────────────────────────────────

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number.' };
  return { valid: true, message: '' };
};

/**
 * Returns a password strength score from 0 (empty) to 4 (strong).
 */
export const getPasswordStrength = (password: string): 0 | 1 | 2 | 3 | 4 => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/[0-9]/.test(password))        score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
};

export const PASSWORD_STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;
export const PASSWORD_STRENGTH_COLORS = ['', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'] as const;

// ─── Name ─────────────────────────────────────────────────────────────────────

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) return { valid: false, message: 'Full name is required.' };
  if (name.trim().length < 2) return { valid: false, message: 'Name must be at least 2 characters.' };
  if (name.trim().split(' ').length < 2) return { valid: false, message: 'Please enter your full name.' };
  return { valid: true, message: '' };
};

// ─── Date Range ───────────────────────────────────────────────────────────────

export const validateDateRange = (from: string, to: string): ValidationResult => {
  if (!from || !to) return { valid: false, message: 'Both dates are required.' };
  if (new Date(from) > new Date(to)) return { valid: false, message: '"From" date must be before "To" date.' };
  return { valid: true, message: '' };
};
