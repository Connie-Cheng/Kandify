const SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

export function getClientId(): string {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? '';
}

function redirectUri(): string {
  // Spotify does not allow "localhost" — use 127.0.0.1 instead
  return window.location.origin.replace('localhost', '127.0.0.1') + '/';
}

function generateVerifier(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function redirectToSpotifyAuth(): Promise<void> {
  const clientId = getClientId();
  if (!clientId) throw new Error('Set VITE_SPOTIFY_CLIENT_ID in .env.local');
  const verifier = generateVerifier();
  sessionStorage.setItem('pkce_verifier', verifier);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: await generateChallenge(verifier),
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleAuthCallback(code: string): Promise<void> {
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('No PKCE verifier found');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: getClientId(),
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error_description ?? json.error);
  localStorage.setItem('sp_token', json.access_token);
  localStorage.setItem('sp_refresh', json.refresh_token);
  localStorage.setItem('sp_expiry', String(Date.now() + json.expires_in * 1000));
  sessionStorage.removeItem('pkce_verifier');
}

export async function getAccessToken(): Promise<string | null> {
  const token = localStorage.getItem('sp_token');
  const expiry = Number(localStorage.getItem('sp_expiry') ?? 0);
  if (!token) return null;
  if (Date.now() < expiry - 60_000) return token;
  const refresh = localStorage.getItem('sp_refresh');
  if (!refresh) { spotifyLogout(); return null; }
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: getClientId(),
        grant_type: 'refresh_token',
        refresh_token: refresh,
      }),
    });
    const json = await res.json();
    if (json.error) { spotifyLogout(); return null; }
    localStorage.setItem('sp_token', json.access_token);
    localStorage.setItem('sp_expiry', String(Date.now() + json.expires_in * 1000));
    if (json.refresh_token) localStorage.setItem('sp_refresh', json.refresh_token);
    return json.access_token;
  } catch {
    return null;
  }
}

export function isSpotifyAuthenticated(): boolean {
  return !!localStorage.getItem('sp_token');
}

export function spotifyLogout(): void {
  localStorage.removeItem('sp_token');
  localStorage.removeItem('sp_refresh');
  localStorage.removeItem('sp_expiry');
}
