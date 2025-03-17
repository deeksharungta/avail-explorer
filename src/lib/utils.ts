import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { EXPLORER_BASE_URL } from './config/endpoints';

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

// Converts a Unix timestamp to human-readable format: DD/MM/YYYY, HH:MM:SS
export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  // Extract date components
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Extract time components
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Combine into the specified format: DD/MM/YYYY, HH:MM:SS
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

export const getTransactionLink = (hash: string) => {
  return `${
    process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'
  }/explorer/tx/${hash}`;
};

export const getExplorerLink = (hash: string) => {
  return `${EXPLORER_BASE_URL}/extrinsic/${hash}`;
};

export const getAccountLink = (address: string) => {
  return `${EXPLORER_BASE_URL}/account/${address}`;
};
