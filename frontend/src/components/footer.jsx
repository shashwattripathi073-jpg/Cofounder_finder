'use client';
import Link from 'next/link';
import { Rocket, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-950/40 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Rocket size={16} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold gradient-text text-lg">CoFound</span>
                            <p className="text-xs text-slate-600">Find your co-founder today.</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-6 text-sm text-slate-500 font-medium">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <Link href="/register" className="hover:text-white transition-colors">Register</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Discover</Link>
                    </div>

                    {/* Socials */}
                    <div className="flex items-center gap-3">
                        {[
                            { icon: Twitter, href: '#' },
                            { icon: Github, href: '#' },
                            { icon: Linkedin, href: '#' },
                        ].map(({ icon: Icon, href }, i) => (
                            <a key={i} href={href} className="w-9 h-9 glass-card flex items-center justify-center text-slate-500 hover:text-white hover:border-indigo-500/30 transition-all">
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/5 mt-10 pt-8 text-center text-xs text-slate-600">
                    © {new Date().getFullYear()} CoFound. All rights reserved. Built with ❤️ to connect dreamers.
                </div>
            </div>
        </footer>
    );
}
