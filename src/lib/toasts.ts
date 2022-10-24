
// Imports:
import { toast } from '@zerodevx/svelte-toast';

// Toast Settings:
const toastDuration: number = 30000;

// Toast Themes:
const themes = {
  success: { '--toastColor': 'rgb(135, 221, 100)', '--toastBarBackground': 'rgb(135, 221, 100)' },
  fail: { '--toastColor': 'rgb(221, 100, 100)', '--toastBarBackground': 'rgb(221, 100, 100)' }
}

/* ========================================================================================================================================================================= */

// Function to create a toast:
export const bake = (message: string, options?: { theme?: 'success' | 'fail', duration?: number }) => {
  const duration = options?.duration ?? toastDuration;
  const theme = options?.theme ? themes[options.theme] : undefined;
  toast.push(message, { duration, theme });
}

// Function to remove latest toast:
export const eat = () => {
  toast.pop(0);
}