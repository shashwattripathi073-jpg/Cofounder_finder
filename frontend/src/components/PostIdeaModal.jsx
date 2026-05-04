'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Rocket, Target, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const PostIdeaModal = ({ isOpen, onClose, onIdeaCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        industry: '',
        lookingFor: '',
        equityOffered: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                lookingFor: formData.lookingFor.split(',').map(s => s.trim())
            };
            const { data: newIdea } = await api.post('/ideas', data);
            toast.success('Business idea posted successfully!');
            onIdeaCreated(newIdea);
            onClose();
            setFormData({ title: '', description: '', industry: '', lookingFor: '', equityOffered: '' });
        } catch (err) {
            toast.error('Failed to post idea');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card w-full max-w-2xl overflow-hidden relative"
                >
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                        <X size={24} />
                    </button>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="flex items-center gap-4 mb-2">
                             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <Rocket size={24} />
                             </div>
                             <div>
                                <h2 className="text-3xl font-extrabold">Pitch Your <span className="gradient-text">Idea</span></h2>
                                <p className="text-slate-400 text-sm">Find co-founders for your next big venture.</p>
                             </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Startup Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900/60 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50" 
                                    placeholder="e.g. EcoSphere AI"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Business Description</label>
                                <textarea 
                                    className="w-full bg-slate-900/60 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 h-32" 
                                    placeholder="Describe your vision, roadmap and value proposition..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Industry</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input type="text" className="w-full bg-slate-900/60 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. EdTech" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Equity %</label>
                                    <div className="relative">
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input type="text" className="w-full bg-slate-900/60 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. 5% - 20%" value={formData.equityOffered} onChange={(e) => setFormData({...formData, equityOffered: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Looking for (Comma separated roles)</label>
                                <input type="text" className="w-full bg-slate-900/60 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="e.g. Developer, Designer, CTO" value={formData.lookingFor} onChange={(e) => setFormData({...formData, lookingFor: e.target.value})} />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full gradient-btn p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
                        >
                            {loading ? 'Posting...' : 'Pitch Idea'}
                            <Send size={20} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PostIdeaModal;
