import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { Search, ExternalLink, Users, User, TrendingUp } from 'lucide-react';
import {
    LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface ProjectListProps {
    projects: Project[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [orgFilter, setOrgFilter] = useState('All');
    const [termFilter, setTermFilter] = useState('All');

    // Extract unique years and orgs for filters
    const years = useMemo(() => Array.from(new Set(projects.map(p => p.year))).sort((a, b) => b - a), [projects]);
    const orgs = useMemo(() => Array.from(new Set(projects.map(p => p.organization))).sort(), [projects]);
    const terms = useMemo(() => Array.from(new Set(projects.map(p => p.term))).sort(), [projects]);

    // Filter Logic
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch = 
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.mentors.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
                project.mentee.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesYear = yearFilter === 'All' || project.year.toString() === yearFilter;
            const matchesOrg = orgFilter === 'All' || project.organization === orgFilter;
            const matchesTerm = termFilter === 'All' || project.term === termFilter;

            return matchesSearch && matchesYear && matchesOrg && matchesTerm;
        });
    }, [projects, searchTerm, yearFilter, orgFilter, termFilter]);

    // Org Trend Data Calculation
    const orgTrendData = useMemo(() => {
        if (orgFilter === 'All') return [];
        
        const orgProjects = projects.filter(p => p.organization === orgFilter);
        const yearMap: Record<number, number> = {};
        
        // Determine min and max year from all projects to set chart bounds properly
        const allYears = projects.map(p => p.year);
        const minYear = Math.min(...allYears);
        const maxYear = Math.max(...allYears);
        
        // Initialize all years with 0
        for(let y = minYear; y <= maxYear; y++) {
            yearMap[y] = 0;
        }

        // Count projects per year for the selected org
        orgProjects.forEach(p => {
            yearMap[p.year] = (yearMap[p.year] || 0) + 1;
        });

        return Object.entries(yearMap)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);
    }, [orgFilter, projects]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-xs">
                    <p className="text-slate-200 font-bold">{label}</p>
                    <p className="text-blue-400">{`Projects: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Browse Projects</h1>
                <p className="text-slate-400">Search through {projects.length} mentorship projects.</p>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex flex-col md:flex-row gap-4 sticky top-16 z-30 shadow-lg">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search projects, mentors, mentees..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-4 flex-wrap">
                    <select 
                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                    >
                        <option value="All">All Years</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <select 
                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={termFilter}
                        onChange={(e) => setTermFilter(e.target.value)}
                    >
                        <option value="All">All Terms</option>
                        {terms.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <select 
                        className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer max-w-[200px]"
                        value={orgFilter}
                        onChange={(e) => setOrgFilter(e.target.value)}
                    >
                        <option value="All">All Orgs</option>
                        {orgs.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* Org Trend Chart */}
            {orgFilter !== 'All' && orgTrendData.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-200">{orgFilter} Participation Trend</h3>
                            <p className="text-xs text-slate-500">Project count over years</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orgTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                                    activeDot={{ r: 6, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p>No projects found matching your criteria.</p>
                    </div>
                ) : (
                    filteredProjects.map((project) => (
                        <div key={project.id} className="bg-slate-900/50 border border-slate-800/60 hover:border-blue-500/30 rounded-xl p-5 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                            {project.organization}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {project.year} • {project.term}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            {project.title}
                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    </h3>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row gap-4 md:gap-8 text-sm">
                                <div className="flex items-start gap-2 min-w-[200px]">
                                    <Users size={16} className="text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-slate-500 text-xs mb-0.5">Mentors</p>
                                        <p className="text-slate-300">{project.mentors.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <User size={16} className="text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="text-slate-500 text-xs mb-0.5">Mentee</p>
                                        <p className="text-slate-300">{project.mentee || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};