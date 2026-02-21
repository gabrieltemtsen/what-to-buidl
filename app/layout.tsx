import './globals.css';
import type { ReactNode } from 'react';
import { ConvexClientProvider } from '@/components/convex-client-provider';

export const metadata = {
  title: 'What to Buidl Explorer',
  description: 'Discover and rate technical project ideas for the AI era.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
