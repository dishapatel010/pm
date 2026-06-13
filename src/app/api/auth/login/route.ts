import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const host = request.headers.get('host') || 'localhost:3002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/callback`;

    // 1. Perform Dynamic Client Registration (RFC 7591)
    const registerRes = await fetch('https://mcp.swiggy.com/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Swiggy MCP Smart Meal Planner',
        redirect_uris: [redirectUri],
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none'
      })
    });

    if (!registerRes.ok) {
      const errorText = await registerRes.text();
      console.error('DCR Registration failed:', errorText);
      return NextResponse.json({ error: 'Failed to register client dynamically with Swiggy.' }, { status: 500 });
    }

    const clientData = await registerRes.json();
    const clientId = clientData.client_id;

    // 2. Generate PKCE verifier and challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const state = crypto.randomBytes(16).toString('hex');

    // 3. Build Swiggy OAuth Redirect URL
    const authUrl = new URL('https://mcp.swiggy.com/auth/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'mcp:tools mcp:resources mcp:prompts');

    // 4. Set cookies for code verifier, client id and state verification
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set('pkce_verifier', codeVerifier, { httpOnly: true, secure: protocol === 'https', path: '/' });
    response.cookies.set('oauth_client_id', clientId, { httpOnly: true, secure: protocol === 'https', path: '/' });
    response.cookies.set('oauth_state', state, { httpOnly: true, secure: protocol === 'https', path: '/' });

    return response;
  } catch (error: any) {
    console.error('OAuth Login init error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during login initialization' }, { status: 500 });
  }
}
