'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '@/lib/api';

export default function FeedbackPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const formik = useFormik({
        initialValues: { rating: 5, message: '' },
        validationSchema: Yup.object({
            rating: Yup.number().min(1).max(5).required('Rating is required'),
            message: Yup.string().required('Feedback message is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await api.post('/feedback', values);
                toast.success('Feedback submitted! Thank you!');
                setSubmitted(true);
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to submit feedback');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold mb-3">Your <span className="gradient-text">Feedback</span></h1>
                <p className="text-slate-400">Help us improve the CoFound experience</p>
            </header>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10">
                {submitted ? (
                    <div className="text-center py-10">
                        <Star size={48} className="mx-auto text-yellow-400 fill-yellow-400 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                        <p className="text-slate-400">Your feedback has been successfully submitted and will help us grow.</p>
                        <button onClick={() => { setSubmitted(false); formik.resetForm(); }} className="mt-8 gradient-btn px-6 py-3 rounded-2xl font-bold text-sm">
                            Submit Another Response
                        </button>
                    </div>
                ) : (
                    <form onSubmit={formik.handleSubmit} className="space-y-8">
                        <div>
                            <label className="text-sm font-bold text-slate-300 mb-4 block uppercase tracking-wider">How would you rate your experience? <span className="text-red-500">*</span></label>
                            <div className="flex gap-4 items-center justify-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => formik.setFieldValue('rating', star)}
                                        className="group transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={42}
                                            className={`transition-colors ${formik.values.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 group-hover:text-yellow-400/50'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="text-center mt-3 font-bold text-indigo-400">
                                {formik.values.rating === 5 && 'Excellent! 😍'}
                                {formik.values.rating === 4 && 'Good! 🙂'}
                                {formik.values.rating === 3 && 'Average 😐'}
                                {formik.values.rating === 2 && 'Needs Work 😕'}
                                {formik.values.rating === 1 && 'Terrible 😞'}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-300 mb-3 block uppercase tracking-wider">Tell us more <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <MessageSquare className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <textarea
                                    name="message"
                                    rows={5}
                                    placeholder="What did you like? What can we improve?"
                                    className={`w-full bg-slate-900 border ${formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-white/10'} p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 text-white resize-none transition-all`}
                                    value={formik.values.message}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {formik.touched.message && formik.errors.message && <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.message}</div>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full gradient-btn p-5 rounded-2xl font-bold text-base flex justify-center items-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                        >
                            <Save size={18} /> {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
