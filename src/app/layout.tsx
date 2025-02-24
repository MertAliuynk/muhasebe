import "@/styles/globals.css"

import { type Metadata } from "next"
import { TRPCReactProvider } from "@/trpc/react"
import { GeistSans } from "geist/font/sans"
import { SessionProvider } from "next-auth/react"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Toaster } from "sonner"

import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Karadeniz Özel Ağız ve Diş Sağlığı Polikliniği",
  description: "Karadeniz Özel Ağız ve Diş Sağlığı Polikliniği",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh bg-background font-sans antialiased">
        <SessionProvider>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              <NuqsAdapter>
                <div vaul-drawer-wrapper="">
                  <div className="relative flex min-h-svh flex-col bg-background">
                    {children}
                  </div>
                </div>
              </NuqsAdapter>
              <TailwindIndicator />
              <Toaster position="top-center" />
            </ThemeProvider>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
