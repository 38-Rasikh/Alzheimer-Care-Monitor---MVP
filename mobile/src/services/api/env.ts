import Constants from 'expo-constants';

/**
 * Gets the Expo dev server host IP address.
 * This is the same IP that Expo uses to serve your bundled JavaScript.
 */
function getDevServerHost(): string | null {
  try {
    const anyConstants = Constants as any;
    const hostUri: string | undefined =
      anyConstants?.expoConfig?.hostUri ||
      anyConstants?.manifest2?.extra?.expoGo?.hostUri ||
      anyConstants?.manifest?.hostUri;
    
    if (!hostUri) return null;
    
    // hostUri format: "192.168.1.100:8081"
    const host = hostUri.split(':')[0];
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Gets the API base URL.
 * Priority:
 * 1. EXPO_PUBLIC_API_URL env variable (for production or manual override)
 * 2. Auto-detected dev server host with configured port (for development)
 * 3. localhost with configured port (fallback)
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    const protocol = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';
    const url = fromEnv.trim().replace(/^https?:\/\//, `${protocol}://`);
    console.log('[API] Using env URL:', url);
    return url;
  }
  
  const host = getDevServerHost();
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  const protocol = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';
  
  if (host) {
    const url = `${protocol}://${host}:${port}`;
    console.log('[API] Using detected host URL:', url);
    return url;
  }
  
  console.log(`[API] Using fallback URL: ${protocol}://localhost:${port}`);
  return `${protocol}://localhost:${port}`;
}

/**
 * Gets the Socket.IO URL.
 * Falls back to API URL if no separate socket URL is specified.
 */
export function getSocketUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WS_URL || process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.trim().length > 0) {
    const protocol = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';
    const url = fromEnv.trim().replace(/^https?:\/\//, `${protocol}://`);
    console.log('[Socket] Using env URL:', url);
    return url;
  }
  
  const host = getDevServerHost();
  const port = process.env.EXPO_PUBLIC_API_PORT || '3001';
  const protocol = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';
  
  if (host) {
    const url = `${protocol}://${host}:${port}`;
    console.log('[Socket] Using detected host URL:', url);
    return url;
  }
  
  console.log(`[Socket] Using fallback URL: ${protocol}://localhost:${port}`);
  return `${protocol}://localhost:${port}`;
}
