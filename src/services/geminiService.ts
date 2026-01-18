import OpenAI from 'openai';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new OpenAI({
    apiKey: groqApiKey,
    dangerouslyAllowBrowser: true,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function generateProjectWBS(projectDescription: string): Promise<string> {
    if (!groqApiKey) {
        throw new Error('GROQ API key is not configured. Please set VITE_GROQ_API_KEY in your environment variables.');
    }

    if (!projectDescription || projectDescription.trim().length === 0) {
        throw new Error('Project description is required to generate tasks.');
    }

    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a project management expert. Generate a Work Breakdown Structure (WBS) for the given project description. Return ONLY a JSON array of objects with 'name' and 'dependencies' (array of strings) fields. The dependencies should refer to other task names generated. Example format: [{\"name\": \"Task 1\", \"dependencies\": []}, {\"name\": \"Task 2\", \"dependencies\": [\"Task 1\"]}]"
                },
                {
                    role: "user",
                    content: projectDescription
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
            throw new Error('No response from AI. Please try again.');
        }

        const content = response.choices[0].message.content;
        
        // Handle cases where the model might wrap the array in an object
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (parseError) {
            throw new Error('Invalid JSON response from AI. Please try again.');
        }

        // Extract the array from the response
        let tasks = [];
        if (Array.isArray(parsed)) {
            tasks = parsed;
        } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
            tasks = parsed.tasks;
        } else if (parsed.wbs && Array.isArray(parsed.wbs)) {
            tasks = parsed.wbs;
        } else if (parsed.items && Array.isArray(parsed.items)) {
            tasks = parsed.items;
        } else {
            // Try to find any array in the object
            const keys = Object.keys(parsed);
            for (const key of keys) {
                if (Array.isArray(parsed[key])) {
                    tasks = parsed[key];
                    break;
                }
            }
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
            throw new Error('No tasks were generated. Please try again with a more detailed description.');
        }

        return JSON.stringify(tasks);
    } catch (error: any) {
        if (error?.message) {
            throw error;
        }
        // Handle API errors
        if (error?.status === 401 || error?.message?.includes('api key') || error?.message?.includes('authentication')) {
            throw new Error('Invalid API key. Please check your VITE_GROQ_API_KEY environment variable.');
        }
        if (error?.status === 429 || error?.message?.includes('rate limit')) {
            throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        throw new Error(`Failed to generate tasks: ${error?.message || 'Unknown error'}`);
    }
}

export async function generateStatusReport(data: { project: any; tasks: any[] }): Promise<string> {
    const { project, tasks } = data;
    const projectContext = `
        Project Name: ${project.name}
        Code: ${project.code}
        Description: ${project.description}
        Budget: ${project.budget}
        Status: ${project.status}
        Tasks: ${JSON.stringify(tasks.map(t => ({ name: t.name, status: t.status, progress: t.progress })))}
    `;

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a professional project manager. Generate a high-level executive status report for the project based on the provided data. Use markdowns for formatting."
            },
            {
                role: "user",
                content: projectContext
            },
        ],
        model: "llama-3.3-70b-versatile",
    });

    return response.choices[0].message.content || 'No report generated.';
}

export async function analyzeCRImpact(changeDescription: string, context: string): Promise<string> {
    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a Change Advisory Board (CAB) expert. Analyze the impact of the following change request within the given project context. Focus on risks, resources, and timeline impact."
            },
            {
                role: "user",
                content: `Change Description: ${changeDescription}\n\nProject Context: ${context}`
            },
        ],
        model: "llama-3.3-70b-versatile",
    });

    return response.choices[0].message.content || 'No analysis generated.';
}

export async function chatAssistant(messages: any[]): Promise<string> {
    const response = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful project management assistant for the Nexus ERP. Help the user with writing project descriptions, planning, or any project-related questions. If you provide a draft for a project description, please wrap the actual description text in [CONTENT] ... [/CONTENT] tags so the system can extract it cleanly without your conversational talk."
            },
            ...messages
        ],
        model: "llama-3.3-70b-versatile",
    });

    return response.choices[0].message.content || 'I am sorry, I could not process that.';
}

