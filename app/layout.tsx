import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RAG Assistant',
  description: 'Ask questions about your document using a lightweight retrieval chat assistant.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
