import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Cinzel, Crimson_Pro } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', weight: ['400', '600', '700'] });
const crimson = Crimson_Pro({ subsets: ['latin'], variable: '--font-crimson', weight: ['300', '400', '600'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'Limanova — Science State',
  description: 'Limanova: A meritocratic science state built above the sea. Knowledge is the supreme power.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Limanova — Science State',
    description: 'A meritocratic science state built above the sea.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${cinzel.variable} ${crimson.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
