export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Stampa Bolla di Consegna</title>
      </head>
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}