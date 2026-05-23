export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return "";
};
