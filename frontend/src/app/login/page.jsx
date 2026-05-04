'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await login(values.email, values.password);
                toast.success('Welcome back!');
            } catch (err) {
                toast.error(err.response?.data?.error || 'Login failed');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-12 relative"
            >
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold mb-3">Welcome Back</h2>
                    <p className="text-slate-400">Continue your journey to find the perfect cofounder</p>
                </div>
                
                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Email address <span className="text-red-500">*</span></label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input 
                                name="email"
                                type="email" 
                                placeholder="name@example.com" 
                                className={`w-full bg-slate-900 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-white/10'} p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white`}
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.email && formik.errors.email && <div className="text-red-500 text-xs ml-1">{formik.errors.email}</div>}
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-slate-300">Password <span className="text-red-500">*</span></label>
                            <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input 
                                name="password"
                                type="password" 
                                placeholder="••••••••" 
                                className={`w-full bg-slate-900 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-white/10'} p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-white`}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        {formik.touched.password && formik.errors.password && <div className="text-red-500 text-xs ml-1">{formik.errors.password}</div>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full gradient-btn p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                        {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-slate-400">
                        Don&apos;t have an account? {' '}
                        <Link href="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
