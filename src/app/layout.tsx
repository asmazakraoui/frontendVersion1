import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
//import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            {/* <AuthProvider> */}
              <NotificationProvider>
                {children}
              </NotificationProvider>
            {/* </AuthProvider> */}
            <Toaster 
              containerStyle={{
                zIndex: 999999,
                position: 'fixed',
                top: '20px',
                right: '20px'
              }}
              position="top-right" 
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#333',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  zIndex: 999999
                },
                className: 'z-[999999]',
                success: {
                  icon: '✅',
                  style: {
                    background: '#f0fff4',
                    border: '1px solid #c6f6d5'
                  }
                },
                error: {
                  icon: '❌',
                  style: {
                    background: '#fff5f5',
                    border: '1px solid #fed7d7'
                  }
                }
              }} />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}