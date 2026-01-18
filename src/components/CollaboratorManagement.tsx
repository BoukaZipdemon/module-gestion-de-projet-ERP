import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { Search, UserPlus, Mail } from 'lucide-react';

interface CollaboratorManagementProps {
    projectId: string;
}

export default function CollaboratorManagement({ projectId }: CollaboratorManagementProps) {
    const [emailSearch, setEmailSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('MEMBER');

    useEffect(() => {
        loadMembers();
    }, [projectId]);

    const loadMembers = async () => {
        try {
            const data = await dbService.getProjectMembers(projectId);
            setMembers(data);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    const handleSearch = async () => {
        if (emailSearch.trim().length < 3) {
            alert('Please enter at least 3 characters to search');
            return;
        }
        
        setLoading(true);
        setSearchResults([]);
        
        try {
            const results = await dbService.searchUsersByEmail(emailSearch.trim());
            console.log('Search results:', results);
            
            if (results.length === 0) {
                alert('No users found. Make sure the user has an account in the system and RLS policies are configured.');
                return;
            }
            
            // Filter out users who are already members
            const existingMemberIds = members.map(m => m.user_id || m.profiles?.id).filter(Boolean);
            const filteredResults = results.filter(user => !existingMemberIds.includes(user.id));
            
            if (filteredResults.length === 0 && results.length > 0) {
                alert('All matching users are already members of this project.');
            } else {
                setSearchResults(filteredResults);
            }
        } catch (error: any) {
            console.error('Error searching users:', error);
            const errorMsg = error?.message || error?.code || 'Unknown error';
            alert(`Failed to search users: ${errorMsg}. Check console for details.`);
        } finally {
            setLoading(false);
        }
    };

    const addMember = async (userId: string) => {
        try {
            await dbService.addProjectMember(projectId, userId, selectedRole);
            
            // Remove the added user from search results
            setSearchResults(prev => prev.filter(u => u.id !== userId));
            setEmailSearch('');
            
            // Reload members list
            await loadMembers();
        } catch (error: any) {
            console.error('Error adding member:', error);
            
            if (error?.code === '23505' || error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
                alert('This user is already a member of the project.');
            } else {
                alert(`Failed to add member: ${error?.message || 'Unknown error'}`);
            }
        }
    };

    const updateRole = async (memberId: string, newRole: string) => {
        try {
            await dbService.updateProjectMemberRole(memberId, newRole);
            loadMembers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-blue-600" />
                    Add Collaborators
                </h3>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={emailSearch}
                            onChange={(e) => setEmailSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                        <option value="OWNER">Owner</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="mt-4 border rounded-lg divide-y bg-white shadow-sm">
                        {searchResults.map((user) => (
                            <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => addMember(user.id)}
                                    className="px-3 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100"
                                >
                                    Add as {selectedRole.toLowerCase()}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mail size={20} className="text-gray-600" />
                    Project Members ({members.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                        <div key={member.id} className="p-4 border rounded-xl flex flex-col gap-4 bg-white shadow-sm">
                            <div className="flex items-center gap-4">
                                <img
                                    src={member.profiles?.avatar || `https://ui-avatars.com/api/?name=${member.profiles?.name}`}
                                    className="w-10 h-10 rounded-full border border-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{member.profiles?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{member.profiles?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <select
                                    className="text-xs bg-gray-50 border-none rounded px-2 py-1 font-bold text-gray-600 uppercase tracking-wider outline-none focus:ring-1 focus:ring-blue-500"
                                    value={member.role}
                                    onChange={(e) => updateRole(member.id, e.target.value)}
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="VIEWER">Viewer</option>
                                    <option value="OWNER">Owner</option>
                                </select>
                                <span className="text-[10px] text-gray-400">
                                    Joined {new Date(member.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
