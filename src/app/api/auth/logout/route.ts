import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3002';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const response = NextResponse.redirect(`${protocol}://${host}/`);
  response.cookies.delete('swiggy_access_token');
  
  return response;
}
