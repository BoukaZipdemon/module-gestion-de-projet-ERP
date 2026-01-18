import React from 'react';
import { Project, Task, ProjectStatus, TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, FileDown } from 'lucide-react';
import { pdfService } from '../services/pdfService';

interface DashboardProps {
    projects: Project[];
    tasks: Task[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ projects, tasks }) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

    const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE).length;
    const overdueTasks = tasks.filter(t => t.status !== TaskStatus.DONE && new Date(t.endDate) < new Date()).length;

    // Calculate task-based budget metrics
    const totalTaskBudget = tasks.reduce((acc, t) => acc + (t.budget || 0), 0);
    const completedTaskBudget = tasks
        .filter(t => t.status === TaskStatus.DONE)
        .reduce((acc, t) => acc + (t.budget || 0), 0);
    const inProgressTaskBudget = tasks
        .filter(t => t.status === TaskStatus.IN_PROGRESS)
        .reduce((acc, t) => acc + (t.budget || 0), 0);
    const remainingTaskBudget = totalTaskBudget - completedTaskBudget;

    // Calculate project-level budget
    const totalProjectBudget = projects.reduce((acc, p) => acc + p.budget, 0);

    // Combined budget calculation: use task budgets as actual spent, project budget as allocated
    const totalBudget = totalProjectBudget;
    const totalSpent = completedTaskBudget; // Tasks marked as DONE count as spent
    const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Budget data for charts - now showing task-level spending per project
    const budgetData = projects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id);
        const projectTaskBudget = projectTasks.reduce((acc, t) => acc + (t.budget || 0), 0);
        const projectSpent = projectTasks
            .filter(t => t.status === TaskStatus.DONE)
            .reduce((acc, t) => acc + (t.budget || 0), 0);

        return {
            name: p.code,
            budget: p.budget,
            allocated: projectTaskBudget,
            spent: projectSpent
        };
    });

    const statusData = [
        { name: 'Active', value: activeProjects },
        { name: 'Completed', value: completedProjects },
        { name: 'On Hold', value: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length },
        { name: 'Draft', value: projects.filter(p => p.status === ProjectStatus.DRAFT).length },
    ];

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">{subtext}</p>
        </div>
    );

    const handleDownloadReport = async () => {
        setIsGeneratingPDF(true);
        try {
            await pdfService.generateDashboardReport({
                projects,
                tasks,
                generatedAt: new Date()
            });
        } catch (error) {
            console.error('Error generating PDF report:', error);
            alert('Failed to generate PDF report. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
                <button
                    onClick={handleDownloadReport}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileDown size={16} />
                    {isGeneratingPDF ? 'Generating PDF...' : 'Download Report (PDF)'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Projects"
                    value={activeProjects}
                    icon={Activity}
                    color="bg-blue-500"
                    subtext={`${completedProjects} completed total`}
                />
                <StatCard
                    title="Budget Spent"
                    value={`$${(totalSpent / 1000).toFixed(1)}K`}
                    icon={CheckCircle}
                    color="bg-green-500"
                    subtext={`${utilization}% of $${(totalBudget / 1000).toFixed(1)}K allocated`}
                />
                <StatCard
                    title="Pending Tasks"
                    value={pendingTasks}
                    icon={Clock}
                    color="bg-orange-500"
                    subtext={`${overdueTasks} overdue`}
                />
                <StatCard
                    title="Task Budget Pool"
                    value={`$${(totalTaskBudget / 1000).toFixed(1)}K`}
                    icon={AlertTriangle}
                    color="bg-purple-500"
                    subtext={`$${(remainingTaskBudget / 1000).toFixed(1)}K remaining`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Tracking by Project</h3>
                    <div className="overflow-x-auto pb-2">
                        <div style={{ minWidth: `${Math.max(projects.length * 150, 500)}px`, height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Project Budget" />
                                    <Bar dataKey="allocated" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Task Allocated" />
                                    <Bar dataKey="spent" fill="#10b981" radius={[4, 4, 0, 0]} name="Spent (Done)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Portfolio Health</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-sm text-gray-500 mt-2">
                        {statusData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;