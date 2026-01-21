import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

export const metadata: Metadata = {
  title: "Ascoltare - Social Listening Platform",
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
        <div className="flex min-h-screen bg-gray-950">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
