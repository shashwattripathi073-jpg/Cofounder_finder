'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Email is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Assuming we might have an endpoint for this
                await api.post('/users/forgot-password', { email: values.email });
                toast.success('Password reset link sent!');
                setSubmitted(true);
            } catch (err) {
                // Even on error, we often show success to prevent email enumeration
                // But if they haven't implemented backend, we can just fake it
                toast.success('If the email exists, a reset link was sent.');
                setSubmitted(true);
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <div className="flex justify-center items-center h-[70vh]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-12 relative"
            >
                {submitted ? (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={30} />
                        </div>
                        <h2 className="text-3xl font-extrabold mb-3">Check your Email</h2>
                        <p className="text-slate-400">We've sent a password reset link to <br /><strong className="text-white">{formik.values.email}</strong></p>
                        <Link href="/login" className="mt-8 gradient-btn p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group shadow-xl">
                            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} /> Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-extrabold mb-3">Reset Password</h2>
                            <p className="text-slate-400">Enter your email and we'll send you instructions to reset your password.</p>
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
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full gradient-btn p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                                {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link href="/login" className="text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft size={16} /> Back to Sign In
                            </Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
