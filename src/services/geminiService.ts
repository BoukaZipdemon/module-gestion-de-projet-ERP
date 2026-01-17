// Stub implementation of Gemini service
// In a real application, this would make actual API calls to Google Gemini

export async function generateProjectWBS(projectDescription: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock WBS data
    return JSON.stringify([
        { name: 'Project Planning', dependencies: [] },
        { name: 'Requirements Gathering', dependencies: [] },
        { name: 'System Design', dependencies: ['Requirements Gathering'] },
        { name: 'Development', dependencies: ['System Design'] },
        { name: 'Testing', dependencies: ['Development'] },
        { name: 'Deployment', dependencies: ['Testing'] }
    ]);
}

export async function generateStatusReport(data: { project: any; tasks: any[] }): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { project, tasks } = data;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return `PROJECT STATUS REPORT
Generated: ${new Date().toLocaleDateString()}

Project: ${project.name}
Code: ${project.code}
Status: ${project.status}
Progress: ${progress}%

EXECUTIVE SUMMARY
The project is currently ${project.status.toLowerCase()} with ${progress}% completion. 
${completedTasks} out of ${totalTasks} tasks have been completed.

KEY METRICS
- Budget: $${project.budget.toLocaleString()}
- Timeline: ${project.startDate} to ${project.endDate}
- Tasks Completed: ${completedTasks}/${totalTasks}

RISKS & ISSUES
- Monitor budget utilization closely
- Ensure dependencies are managed effectively

NEXT STEPS
- Continue with current task execution
- Review and update project timeline as needed
`;
}

export async function analyzeCRImpact(changeDescription: string, context: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `RISK ANALYSIS SUMMARY

Based on the change request and current project context, here are the key considerations:

IMPACT ASSESSMENT
- The proposed change appears to have moderate impact on project timeline
- Resource allocation may need adjustment
- Additional testing and validation may be required

RECOMMENDATIONS
1. Review dependencies to ensure no conflicts
2. Update project timeline accordingly
3. Communicate changes to all stakeholders
4. Consider phased implementation if possible

RISK LEVEL: MEDIUM
The change is feasible but requires careful planning and coordination.`;
}


