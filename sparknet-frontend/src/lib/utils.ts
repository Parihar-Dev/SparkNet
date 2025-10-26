import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stellar protocol has 7 decimal places, so 1 XLM = 10,000,000 stroops
const STROOPS_PER_XLM = 10_000_000n;

/**
 * Converts BigInt value in stroops (10^-7 XLM) to a formatted XLM string (e.g., '1.2345678').
 * @param {bigint} stroops - The amount in stroops.
 * @returns {string} The formatted XLM amount.
 */
export function stroopsToXLM(stroops: bigint): string {
  // Handle case where stroops is 0
  if (stroops === 0n) return '0';
    
  // Convert to string and pad with leading zeros up to 7 digits for proper slicing
  let stroopsString = stroops.toString().padStart(7, '0');
  
  // Find the position for the decimal point (7 places from the end)
  const decimalIndex = stroopsString.length - 7;
  
  // Slice the string into XLM part and fractional part
  const xlmPart = decimalIndex > 0 ? stroopsString.slice(0, decimalIndex) : '0';
  const fractionalPart = stroopsString.slice(decimalIndex).padStart(7, '0');

  // Combine, then clean up trailing zeros (e.g., '1.0000000' -> '1')
  return `${xlmPart}.${fractionalPart}`.replace(/\.?0+$/, '');
}