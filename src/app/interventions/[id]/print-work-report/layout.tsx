import { ReactNode } from 'react';

export default function PrintLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Skip AppShell for print pages
  return <>{children}</>;
}