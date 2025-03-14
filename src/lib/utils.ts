import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Display only first 6 and last 4 characters of the address
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

// Copy text to clipboard
export const copyToClipboard = (
  text: string,
  message = 'Copied to clipboard'
) => {
  navigator.clipboard.writeText(text).then(
    () => {
      toast.success(message, {
        duration: 2000,
        className: 'bg-secondary border-white/10 text-white',
      });
    },
    (err) => {
      console.error('Could not copy text: ', err);
      toast.error('Could not copy to clipboard', {
        duration: 3000,
      });
    }
  );
};

//Format a date string
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Format: YYYY-MM-DD HH:MM:SS UTC
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return dateString || 'Invalid date';
  }
}

//Additional helper for client-side date formatting when you want localized dates
export function formatDateLocalized(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return dateString || 'Invalid date';
  }
}
