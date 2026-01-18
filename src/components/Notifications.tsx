import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock, FileText, Users, ArrowRight } from 'lucide-react';
import { ChangeRequest, Task, Project, CRStatus, TaskStatus } from '../types';

interface Notification {
    id: string;
    type: 'change_request' | 'task_overdue' | 'task_assigned' | 'project_update' | 'approval_needed';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    link?: string;
    metadata?: any;
}

interface NotificationsProps {
    changeRequests: ChangeRequest[];
    tasks: Task[];
    projects: Project[];
    currentUserId: string;
    onNavigate: (path: string) => void;
}

export default function Notifications({ changeRequests, tasks, projects, currentUserId, onNavigate, onNavigateToProject }: NotificationsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Generate notifications based on data
    useEffect(() => {
        const newNotifications: Notification[] = [];

        // New change requests (submitted in last 7 days)
        const recentCRs = changeRequests.filter(cr => {
            const createdAt = new Date(cr.createdAt);
            const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= 7 && cr.status === CRStatus.SUBMITTED;
        });

        recentCRs.forEach(cr => {
            const project = projects.find(p => p.id === cr.projectId);
            newNotifications.push({
                id: `cr-${cr.id}`,
                type: 'change_request',
                title: 'New Change Request',
                message: `${cr.title} for ${project?.name || 'Project'}`,
                timestamp: new Date(cr.createdAt),
                read: readNotifications.has(`cr-${cr.id}`),
                link: `/changes`,
                metadata: { crId: cr.id }
            });
        });

        // Change requests needing approval (if user is CAB_APPROVER or ADMIN)
        const pendingCRs = changeRequests.filter(cr => 
            cr.status === CRStatus.CAB_REVIEW || cr.status === CRStatus.IMPACT_ANALYSIS
        );

        pendingCRs.forEach(cr => {
            const project = projects.find(p => p.id === cr.projectId);
            newNotifications.push({
                id: `cr-pending-${cr.id}`,
                type: 'approval_needed',
                title: 'Change Request Needs Approval',
                message: `${cr.title} is waiting for review`,
                timestamp: new Date(cr.createdAt),
                read: readNotifications.has(`cr-pending-${cr.id}`),
                link: `/changes`,
                metadata: { crId: cr.id }
            });
        });

        // Overdue tasks
        const overdueTasks = tasks.filter(t => {
            if (t.status === TaskStatus.DONE) return false;
            const endDate = new Date(t.endDate);
            return endDate < new Date() && !readNotifications.has(`task-overdue-${t.id}`);
        });

        overdueTasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            newNotifications.push({
                id: `task-overdue-${task.id}`,
                type: 'task_overdue',
                title: 'Overdue Task',
                message: `${task.name} in ${project?.name || 'Project'}`,
                timestamp: new Date(task.endDate),
                read: readNotifications.has(`task-overdue-${task.id}`),
                link: `/projects/${task.projectId}`,
                metadata: { taskId: task.id, projectId: task.projectId }
            });
        });

        // Tasks assigned to current user (recently assigned)
        const myTasks = tasks.filter(t => 
            t.assigneeId === currentUserId && 
            t.status !== TaskStatus.DONE &&
            !readNotifications.has(`task-assigned-${t.id}`)
        );

        myTasks.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            newNotifications.push({
                id: `task-assigned-${task.id}`,
                type: 'task_assigned',
                title: 'Task Assigned to You',
                message: `${task.name} in ${project?.name || 'Project'}`,
                timestamp: new Date(),
                read: readNotifications.has(`task-assigned-${task.id}`),
                link: `/projects/${task.projectId}`,
                metadata: { taskId: task.id, projectId: task.projectId }
            });
        });

        // Sort by timestamp (newest first)
        newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(newNotifications);
    }, [changeRequests, tasks, projects, currentUserId, readNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'change_request':
                return <FileText size={18} className="text-blue-600" />;
            case 'approval_needed':
                return <AlertTriangle size={18} className="text-orange-600" />;
            case 'task_overdue':
                return <Clock size={18} className="text-red-600" />;
            case 'task_assigned':
                return <CheckCircle size={18} className="text-green-600" />;
            case 'project_update':
                return <Users size={18} className="text-purple-600" />;
            default:
                return <Bell size={18} className="text-gray-600" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        setReadNotifications(prev => new Set([...prev, notification.id]));
        
        // Navigate if link exists
        if (notification.link) {
            // Handle project detail routes
            if (notification.link.startsWith('/projects/')) {
                const projectId = notification.link.replace('/projects/', '');
                if (onNavigateToProject) {
                    onNavigateToProject(projectId);
                } else {
                    onNavigate(`projects/${projectId}`);
                }
            } else {
                // Remove leading slash and navigate
                const page = notification.link.replace(/^\//, '');
                onNavigate(page);
            }
            setIsOpen(false);
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadNotifications(prev => new Set([...prev, ...allIds]));
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Bell size={18} />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                            !notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            {formatTimeAgo(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></div>
                                                    )}
                                                </div>
                                            </div>
                                            {notification.link && (
                                                <ArrowRight size={16} className="text-gray-400 shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

