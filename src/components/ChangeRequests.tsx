import React from 'react';
import { ChangeRequest, CRStatus, Project } from '../types';
import { analyzeCRImpact } from '../services/geminiService';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface ChangeRequestsProps {
    crs: ChangeRequest[];
    projects: Project[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onCreateCR: (cr: Partial<ChangeRequest>) => void;
    currentUser: any;
}

const ChangeRequests: React.FC<ChangeRequestsProps> = ({ crs, projects, onApprove, onReject, onCreateCR, currentUser }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [newCR, setNewCR] = React.useState<Partial<ChangeRequest>>({
        title: '',
        description: '',
        impact: '',
        costImpact: 0,
        timeImpactDays: 0,
        projectId: ''
    });
    const [analysisResult, setAnalysisResult] = React.useState<Record<string, string>>({});
    const [analyzingId, setAnalyzingId] = React.useState<string | null>(null);

    const handleAnalyze = async (cr: ChangeRequest) => {
        setAnalyzingId(cr.id);
        const result = await analyzeCRImpact(cr.description, "Current project timeline is tight with only 2 weeks buffer.");
        setAnalysisResult(prev => ({ ...prev, [cr.id]: result }));
        setAnalyzingId(null);
    };

    const getStatusBadge = (status: CRStatus) => {
        switch (status) {
            case CRStatus.APPROVED: return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">APPROVED</span>;
            case CRStatus.REJECTED: return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">REJECTED</span>;
            case CRStatus.CAB_REVIEW: return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">CAB REVIEW</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
                    <p className="text-sm text-gray-500">Review and approve scope changes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    Create Change Request
                </button>
            </div>

            <div className="grid gap-6">
                {crs.map((cr) => (
                    <div key={cr.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{cr.title}</h3>
                                    <p className="text-sm text-gray-500">Requested by Project Manager • {new Date(cr.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {getStatusBadge(cr.status)}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Description</h4>
                                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{cr.description}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Initial Impact Assessment</h4>
                                <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                    <p><span className="font-medium">Cost:</span> ${cr.costImpact}</p>
                                    <p><span className="font-medium">Time:</span> +{cr.timeImpactDays} days</p>
                                    <p className="mt-1">{cr.impact}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                    <span className="text-lg">✨</span> Gemini Risk Analysis
                                </h4>
                                {!analysisResult[cr.id] && (
                                    <button
                                        onClick={() => handleAnalyze(cr)}
                                        disabled={analyzingId === cr.id}
                                        className="text-xs bg-white text-indigo-600 border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50"
                                    >
                                        {analyzingId === cr.id ? 'Analyzing...' : 'Run Analysis'}
                                    </button>
                                )}
                            </div>
                            {analysisResult[cr.id] ? (
                                <p className="text-sm text-indigo-800 leading-relaxed">{analysisResult[cr.id]}</p>
                            ) : (
                                <p className="text-xs text-indigo-400 italic">Click "Run Analysis" to get an AI-powered second opinion on this change.</p>
                            )}
                        </div>

                        {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && cr.status !== CRStatus.APPROVED && cr.status !== CRStatus.REJECTED && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => onReject(cr.id)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50">
                                    <XCircle size={18} /> Reject
                                </button>
                                <button onClick={() => onApprove(cr.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm">
                                    <CheckCircle size={18} /> Approve Change
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">New Change Request</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XCircle size={24} className="text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
                                <select
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                    value={newCR.projectId}
                                    onChange={e => setNewCR({ ...newCR, projectId: e.target.value })}
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                <input
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                    placeholder="Brief title of the change"
                                    value={newCR.title}
                                    onChange={e => setNewCR({ ...newCR, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 h-32 focus:border-blue-500 focus:outline-none transition-all resize-none"
                                    placeholder="Detailed explanation of what needs to change and why..."
                                    value={newCR.description}
                                    onChange={e => setNewCR({ ...newCR, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cost Impact ($)</label>
                                    <input
                                        type="number"
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newCR.costImpact}
                                        onChange={e => setNewCR({ ...newCR, costImpact: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Time Impact (Days)</label>
                                    <input
                                        type="number"
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newCR.timeImpactDays}
                                        onChange={e => setNewCR({ ...newCR, timeImpactDays: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!newCR.title || !newCR.projectId) return;
                                    onCreateCR(newCR);
                                    setShowModal(false);
                                    setNewCR({
                                        title: '',
                                        description: '',
                                        impact: '',
                                        costImpact: 0,
                                        timeImpactDays: 0,
                                        projectId: ''
                                    });
                                }}
                                disabled={!newCR.title || !newCR.projectId}
                                className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeRequests;