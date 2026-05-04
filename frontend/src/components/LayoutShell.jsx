'use client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/footer';
import { usePathname } from 'next/navigation';

const AUTH_PAGES = ['/login', '/register'];

export default function LayoutShell({ children }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isLandingPage = pathname === '/';

    // ── Logged IN: left sidebar layout ──
    if (user) {
        return (
            <div className="flex min-h-screen">
                <Navbar /> {/* renders as Sidebar */}
                <div className="flex-1 ml-64 flex flex-col min-h-screen">
                    <main className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
                        {children}
                    </main>
                    {/* Footer only on landing page for logged-in users */}
                </div>
            </div>
        );
    }

    // ── Guest: top navbar + full page ──
    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Navbar />} {/* Guest top navbar, hidden on auth pages */}
            <main className={`flex-1 ${!isAuthPage && !isLandingPage ? 'pt-20' : ''} ${isLandingPage ? 'pt-16' : ''} ${isAuthPage ? 'flex items-center justify-center py-10 px-4' : 'px-6'}`}>
                {children}
            </main>
            {isLandingPage && <Footer />}
        </div>
    );
}
