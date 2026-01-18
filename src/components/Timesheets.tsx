import React from 'react';
import { TimesheetEntry, Task, Project } from '../types';
import { Save, Check, Clock, X } from 'lucide-react';

interface TimesheetsProps {
    entries: TimesheetEntry[];
    projects: Project[];
    tasks: Task[];
    onAddEntry: (entry: Partial<TimesheetEntry>) => void;
}

const Timesheets: React.FC<TimesheetsProps> = ({ entries, projects, tasks, onAddEntry }) => {
    const [showModal, setShowModal] = React.useState(false);
    const [newEntry, setNewEntry] = React.useState<Partial<TimesheetEntry>>({
        projectId: '',
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: ''
    });

    const projectTasks = tasks.filter(t => t.projectId === newEntry.projectId);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
                    <p className="text-sm text-gray-500">Week of Mar 11, 2024</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        <Save size={18} /> Save Draft
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95 font-bold"
                    >
                        <Check size={18} /> Add Time Entry
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-700 text-sm">Project / Task</th>
                            {weekDays.map(d => (
                                <th key={d} className="px-4 py-4 font-medium text-gray-700 text-sm w-24 text-center">{d}</th>
                            ))}
                            <th className="px-6 py-4 font-medium text-gray-700 text-sm text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {entries.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">No time entries recorded yet.</td></tr>
                        ) : (
                            entries.map(entry => {
                                const project = projects.find(p => p.id === entry.projectId);
                                const task = tasks.find(t => t.id === entry.taskId);
                                return (
                                    <tr key={entry.id} className="hover:bg-gray-50 group border-b border-gray-100 last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{project?.name || 'Unknown Project'}</div>
                                            <div className="text-xs text-blue-600 font-medium">{task?.name || 'General Task'}</div>
                                        </td>
                                        {weekDays.map(d => {
                                            const entryDate = new Date(entry.date);
                                            const entryDay = entryDate.toLocaleDateString('en-US', { weekday: 'short' });
                                            return (
                                                <td key={d} className="px-4 py-4 text-center">
                                                    {entryDay === d ? (
                                                        <span className="inline-block w-8 h-8 leading-8 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100">{entry.hours}</span>
                                                    ) : <span className="text-gray-300">-</span>}
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-gray-900">{entry.hours.toFixed(1)}</span>
                                                <span className={`text - [10px] font - bold px - 1.5 py - 0.5 rounded border uppercase mt - 1 ${entry.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                    } `}>
                                                    {entry.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                            <td className="px-6 py-4 font-bold text-gray-900">Total Hours</td>
                            <td className="text-center font-medium text-gray-700 py-4">8</td>
                            <td className="text-center font-medium text-gray-700 py-4">8</td>
                            <td className="text-center font-medium text-gray-700 py-4">8</td>
                            <td className="text-center font-medium text-gray-700 py-4">8</td>
                            <td className="text-center font-medium text-gray-700 py-4">8</td>
                            <td className="text-right font-bold text-blue-600 px-6 py-4 text-lg">40.0</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={24} className="text-blue-600" />
                                Record Time
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Project</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newEntry.projectId}
                                        onChange={e => setNewEntry({ ...newEntry, projectId: e.target.value, taskId: '' })}
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Task</label>
                                    <select
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newEntry.taskId}
                                        onChange={e => setNewEntry({ ...newEntry, taskId: e.target.value })}
                                        disabled={!newEntry.projectId}
                                    >
                                        <option value="">Select Task</option>
                                        {projectTasks.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newEntry.date}
                                        onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Hours</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-all"
                                        value={newEntry.hours}
                                        onChange={e => setNewEntry({ ...newEntry, hours: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 h-24 focus:border-blue-500 focus:outline-none transition-all resize-none"
                                    placeholder="Briefly describe what you worked on..."
                                    value={newEntry.description}
                                    onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!newEntry.projectId || !newEntry.taskId || !newEntry.hours) return;
                                    onAddEntry(newEntry);
                                    setShowModal(false);
                                    setNewEntry({
                                        projectId: '',
                                        taskId: '',
                                        date: new Date().toISOString().split('T')[0],
                                        hours: 0,
                                        description: ''
                                    });
                                }}
                                disabled={!newEntry.projectId || !newEntry.taskId || !newEntry.hours}
                                className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Record Time
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timesheets;