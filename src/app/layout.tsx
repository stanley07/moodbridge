// src/app/layout.tsx
import '../styles/global.css';

export const metadata = {
  title: 'MoodBridge',
  description: 'Bridging your emotions with intelligent care',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
