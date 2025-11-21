import React from 'react';
import { Users, FolderGit2, Calendar, GraduationCap } from 'lucide-react';

interface StatsCardsProps {
    totalProjects: number;
    totalOrgs: number;
    totalMentors: number;
    totalMentees: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ totalProjects, totalOrgs, totalMentors, totalMentees }) => {
    const cards = [
        { label: 'Total Projects', value: totalProjects, icon: FolderGit2, color: 'text-blue-400' },
        { label: 'Organizations', value: totalOrgs, icon: Calendar, color: 'text-emerald-400' },
        { label: 'Mentors Involved', value: totalMentors, icon: GraduationCap, color: 'text-purple-400' },
        { label: 'Mentees Accepted', value: totalMentees, icon: Users, color: 'text-pink-400' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 bg-slate-800/50 rounded-lg ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1">{card.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
