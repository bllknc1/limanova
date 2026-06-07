import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'tr'],
  defaultLocale: 'en',
  localeDetection: true, // auto-detect from browser
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
