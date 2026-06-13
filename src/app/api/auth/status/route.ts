import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookies = request.headers.get('cookie') || '';
  const getCookie = (name: string) => {
    const match = cookies.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  };
  const token = getCookie('swiggy_access_token');

  if (token) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}
