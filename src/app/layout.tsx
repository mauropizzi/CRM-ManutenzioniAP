import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileSidebar } from "@/components/app-sidebar"
import { Search } from "@/components/search"
import { UserNav } from "@/components/user-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gestionale Aziendale",
  description: "Sistema di gestione aziendale completo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <AppSidebar />
            <div className="flex flex-col">
              <header className="flex h-14 items-center gap-4 border-b border-border bg-surface px-4 lg:h-[60px] lg:px-6">
                <MobileSidebar />
                <div className="w-full flex-1">
                  <Search />
                </div>
                <UserNav />
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                <div className="container-custom">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}