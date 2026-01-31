import type { Metadata } from "next";
import RootLayoutClient from "./RootLayoutClient"; // Import the client component

export const metadata: Metadata = {
  title: "Gestione Interventi",
  description: "Gestione anagrafica clienti e richieste di intervento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}