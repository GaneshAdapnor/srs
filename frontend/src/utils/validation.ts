export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (password.length > 16) {
      errors.push('Password must be at most 16 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Name is required');
  } else {
    if (name.length < 20) {
      errors.push('Name must be at least 20 characters');
    }
    if (name.length > 60) {
      errors.push('Name must be at most 60 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateAddress = (address: string): ValidationResult => {
  const errors: string[] = [];

  if (!address) {
    errors.push('Address is required');
  } else if (address.length > 400) {
    errors.push('Address must be at most 400 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateStoreName = (name: string): ValidationResult => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Store name is required');
  } else {
    if (name.length < 1) {
      errors.push('Store name cannot be empty');
    }
    if (name.length > 100) {
      errors.push('Store name must be at most 100 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRating = (rating: number): ValidationResult => {
  const errors: string[] = [];

  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

