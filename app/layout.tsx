import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Polis AI — Urban Policy Simulator',
  description: 'Simulate urban policy decisions and see multi-year projected outcomes for cities worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
