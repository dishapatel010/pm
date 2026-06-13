import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const cookies = request.headers.get('cookie') || '';
    
    // Parse cookies manually for route compatibility
    const getCookie = (name: string) => {
      const match = cookies.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const codeVerifier = getCookie('pkce_verifier');
    const clientId = getCookie('oauth_client_id');
    const savedState = getCookie('oauth_state');

    if (!code || !state) {
      return NextResponse.json({ error: 'Auth code or state missing from redirect' }, { status: 400 });
    }

    if (state !== savedState) {
      return NextResponse.json({ error: 'State verification failed. Possible CSRF attack.' }, { status: 400 });
    }

    // Force exchange redirectUri to match what was registered and sent to authorize
    const redirectUri = 'http://localhost:3002/api/auth/callback';

    // Exchange Code for Access Token
    const tokenRes = await fetch('https://mcp.swiggy.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
        client_id: clientId
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Token exchange failed:', errText);
      return NextResponse.json({ error: 'Failed to exchange authorization code for access token.' }, { status: 500 });
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Redirect user relatively to the current request domain (the tunnel domain!)
    const response = NextResponse.redirect(new URL('/', request.url));
    
    const host = request.headers.get('host') || 'localhost:3002';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    response.cookies.set('swiggy_access_token', accessToken, {
      httpOnly: true,
      secure: protocol === 'https',
      path: '/',
      maxAge: 5 * 24 * 60 * 60 // 5 days token lifetime
    });

    // Clear login helper cookies
    response.cookies.delete('pkce_verifier');
    response.cookies.delete('oauth_client_id');
    response.cookies.delete('oauth_state');

    return response;
  } catch (error: any) {
    console.error('OAuth Callback error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during token exchange' }, { status: 500 });
  }
}
