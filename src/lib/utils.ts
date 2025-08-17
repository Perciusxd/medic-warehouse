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
        const asNumber = Number(dateString);
        let dateObj: Date;

        if (!isNaN(asNumber)) {
            // handle timestamps in seconds (10 digits) or milliseconds (13+ digits)
            const ts = asNumber < 1e12 ? asNumber * 1000 : asNumber;
            dateObj = new Date(ts);
        } else {
            dateObj = new Date(dateString);
        }

        if (isNaN(dateObj.getTime())) return dateString;

        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = dateObj.getFullYear();

        return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
        //console.error("Error formatting date:", e);
        return dateString;
    }
};