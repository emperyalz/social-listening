import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { ConvexClientProvider } from "./ConvexClientProvider"

export const metadata: Metadata = {
  title: "Orwell - Social Listening Platform",
  description: "Real estate social listening and analytics platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <ConvexClientProvider>
          <div className="flex min-h-screen bg-gray-950">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              {children}
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
