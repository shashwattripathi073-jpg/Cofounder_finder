import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutShell from "@/components/LayoutShell";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata = {
  title: "CoFound | Find Your Perfect Co-Founder",
  description: "Connect with visionaries, builders, and dreamers to build the next big thing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} min-h-screen antialiased bg-slate-950 text-white`}>
        <AuthProvider>
          {/* Ambient background glows */}
          <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <LayoutShell>{children}</LayoutShell>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
