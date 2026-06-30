import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'EduNexus — School & College ERP',
  description: 'Premium multi-tenant education ERP SaaS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="theme-premium">{children}</body>
    </html>
  );
}
