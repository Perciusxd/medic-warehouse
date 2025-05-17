import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to format dates consistently
 * @param {string|number} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
        // Try to handle various date formats
        if (isNaN(Number(dateString))) {
            return new Date(dateString).toLocaleDateString();
        } else {
            return new Date(Number(dateString)).toLocaleDateString();
        }
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};