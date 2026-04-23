/**
 * Normalizes phone input by removing all non-digit characters.
 */
export const normalizePhone = (input) => {
  if (!input) return "";
  return input.replace(/\D/g, "");
};

/**
 * Validates if the input matches the Indian mobile number format.
 * - Must be exactly 10 digits after normalization (handling 91 prefix).
 * - Must start with 6, 7, 8, or 9.
 */
export const isValidPhone = (input) => {
  if (!input) return false;
  
  let phone = normalizePhone(input);

  // Handle +91 / 91 prefix
  if (phone.length === 12 && phone.startsWith("91")) {
    phone = phone.slice(2);
  }

  // Exactly 10 digits and starts with 6,7,8,or 9
  return phone.length === 10 && /^[6-9]/.test(phone);
};
