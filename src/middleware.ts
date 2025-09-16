import { NextResponse, type NextRequest } from 'next/server'

// HTTP → HTTPS 강제 및 보안 헤더 보완(엣지)
export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const isSecure = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'

  // 프리뷰/프로덕션 환경에서만 HTTPS 강제 (localhost 제외)
  if (!isSecure && url.hostname !== 'localhost') {
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()
  // 추가 방어적 헤더 (서버에서 못 다는 경우 보조)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'same-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


