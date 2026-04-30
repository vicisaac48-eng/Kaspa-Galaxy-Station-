
export function getApiBaseUrl(): string {
  // If we are in a browser and not on localhost (which could be the phone in an APK),
  // we might want to return the current origin.
  // However, Capacitor apps run on http://localhost on Android.
  
  const viteApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (viteApiUrl) return viteApiUrl;

  // Fallback: If we are on localhost but it's likely a phone, we might be in trouble
  // In AI Studio, the dev server is at a unique URL.
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // If we're on a unique Cloud Run URL or similar, use it.
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin;
    }
  }

  // Default to empty string for relative paths
  return '';
}
