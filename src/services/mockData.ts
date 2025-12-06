import { User, Project, Task, ChangeRequest, TimesheetEntry, UserRole, ProjectStatus, TaskStatus, CRStatus } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Alice Admin',
        email: 'alice@nexus.com',
        role: UserRole.ADMIN,
        avatar: 'https://ui-avatars.com/api/?name=Alice+Admin&background=3b82f6&color=fff'
    },
    {
        id: 'u2',
        name: 'Bob Manager',
        email: 'bob@nexus.com',
        role: UserRole.PROJECT_MANAGER,
        avatar: 'https://ui-avatars.com/api/?name=Bob+Manager&background=10b981&color=fff'
    },
    {
        id: 'u3',
        name: 'Charlie Dev',
        email: 'charlie@nexus.com',
        role: UserRole.MEMBER,
        avatar: 'https://ui-avatars.com/api/?name=Charlie+Dev&background=f59e0b&color=fff'
    },
    {
        id: 'u4',
        name: 'Diana Approver',
        email: 'diana@nexus.com',
        role: UserRole.CAB_APPROVER,
        avatar: 'https://ui-avatars.com/api/?name=Diana+Approver&background=ef4444&color=fff'
    }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1',
        code: 'PRJ-2024-001',
        name: 'ERP Migration Phase 1',
        description: 'Migrate legacy financial systems to modern cloud-based ERP platform. Includes data migration, API development, and user training.',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        status: ProjectStatus.ACTIVE,
        budget: 500000,
        managerId: 'u2',
        progress: 45
    },
    {
        id: 'p2',
        code: 'PRJ-2024-002',
        name: 'Mobile App Redesign',
        description: 'Complete redesign of customer-facing mobile application with improved UX and performance optimizations.',
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        status: ProjectStatus.ACTIVE,
        budget: 300000,
        managerId: 'u2',
        progress: 30
    },
    {
        id: 'p3',
        code: 'PRJ-2024-003',
        name: 'Security Audit & Compliance',
        description: 'Comprehensive security audit and implementation of GDPR compliance measures across all systems.',
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        status: ProjectStatus.ON_HOLD,
        budget: 150000,
        managerId: 'u2',
        progress: 10
    },
    {
        id: 'p4',
        code: 'PRJ-2023-045',
        name: 'Q4 Marketing Campaign',
        description: 'End-of-year marketing campaign with social media integration and analytics dashboard.',
        startDate: '2023-10-01',
        endDate: '2023-12-31',
        status: ProjectStatus.COMPLETED,
        budget: 200000,
        managerId: 'u2',
        progress: 100
    }
];

export const MOCK_TASKS: Task[] = [
    {
        id: 't1',
        projectId: 'p1',
        name: 'Database Schema Design',
        startDate: '2024-01-15',
        endDate: '2024-02-15',
        assigneeId: 'u3',
        status: TaskStatus.DONE,
        progress: 100
    },
    {
        id: 't2',
        projectId: 'p1',
        name: 'API Development',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        assigneeId: 'u3',
        status: TaskStatus.IN_PROGRESS,
        progress: 60,
        dependencies: ['t1']
    },
    {
        id: 't3',
        projectId: 'p1',
        name: 'Data Migration Scripts',
        startDate: '2024-03-01',
        endDate: '2024-05-15',
        assigneeId: 'u3',
        status: TaskStatus.IN_PROGRESS,
        progress: 40,
        dependencies: ['t1', 't2']
    },
    {
        id: 't4',
        projectId: 'p1',
        name: 'User Training Materials',
        startDate: '2024-05-01',
        endDate: '2024-06-15',
        status: TaskStatus.TODO,
        progress: 0,
        dependencies: ['t3']
    },
    {
        id: 't5',
        projectId: 'p2',
        name: 'User Research',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        assigneeId: 'u3',
        status: TaskStatus.DONE,
        progress: 100
    },
    {
        id: 't6',
        projectId: 'p2',
        name: 'UI/UX Design',
        startDate: '2024-03-01',
        endDate: '2024-04-15',
        status: TaskStatus.IN_PROGRESS,
        progress: 50,
        dependencies: ['t5']
    },
    {
        id: 't7',
        projectId: 'p2',
        name: 'Frontend Development',
        startDate: '2024-03-15',
        endDate: '2024-05-01',
        status: TaskStatus.IN_PROGRESS,
        progress: 30,
        dependencies: ['t6']
    },
    {
        id: 't8',
        projectId: 'p3',
        name: 'Security Assessment',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        status: TaskStatus.REVIEW,
        progress: 90
    }
];

export const MOCK_CRS: ChangeRequest[] = [
    {
        id: 'cr1',
        projectId: 'p1',
        title: 'Additional API Endpoints',
        description: 'Request to add 5 additional REST API endpoints for advanced reporting features that were not in the original scope.',
        impact: 'This change will require additional development time and testing. The new endpoints will integrate with the existing authentication system.',
        costImpact: 25000,
        timeImpactDays: 10,
        status: CRStatus.CAB_REVIEW,
        requesterId: 'u2',
        createdAt: '2024-03-15'
    },
    {
        id: 'cr2',
        projectId: 'p2',
        title: 'Dark Mode Support',
        description: 'Add dark mode theme option to the mobile app redesign. This was requested by users during the research phase.',
        impact: 'Minimal impact on timeline as design system already supports theming. Additional QA testing required.',
        costImpact: 5000,
        timeImpactDays: 3,
        status: CRStatus.SUBMITTED,
        requesterId: 'u2',
        createdAt: '2024-03-20'
    },
    {
        id: 'cr3',
        projectId: 'p1',
        title: 'Extended Data Retention Period',
        description: 'Change data retention policy from 2 years to 5 years to comply with new regulatory requirements.',
        impact: 'Significant impact on storage costs and database performance. Requires infrastructure scaling.',
        costImpact: 75000,
        timeImpactDays: 20,
        status: CRStatus.IMPACT_ANALYSIS,
        requesterId: 'u2',
        createdAt: '2024-03-18'
    }
];

export const MOCK_TIMESHEETS: TimesheetEntry[] = [
    {
        id: 'ts1',
        userId: 'u3',
        projectId: 'p1',
        taskId: 't2',
        date: '2024-03-11',
        hours: 8,
        description: 'API endpoint development',
        status: 'DRAFT'
    },
    {
        id: 'ts2',
        userId: 'u3',
        projectId: 'p1',
        taskId: 't2',
        date: '2024-03-12',
        hours: 8,
        description: 'API endpoint development',
        status: 'DRAFT'
    },
    {
        id: 'ts3',
        userId: 'u3',
        projectId: 'p1',
        taskId: 't2',
        date: '2024-03-13',
        hours: 8,
        description: 'API testing and debugging',
        status: 'DRAFT'
    },
    {
        id: 'ts4',
        userId: 'u3',
        projectId: 'p1',
        taskId: 't2',
        date: '2024-03-14',
        hours: 4,
        description: 'Code review and documentation',
        status: 'DRAFT'
    },
    {
        id: 'ts5',
        userId: 'u3',
        projectId: 'p2',
        taskId: 't6',
        date: '2024-03-14',
        hours: 4,
        description: 'UI component design',
        status: 'DRAFT'
    },
    {
        id: 'ts6',
        userId: 'u3',
        projectId: 'p2',
        taskId: 't6',
        date: '2024-03-15',
        hours: 8,
        description: 'Design system implementation',
        status: 'DRAFT'
    }
];

