import React, { useMemo, useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid 
} from 'recharts';
import { Project } from '../types';
import { StatsCards } from './StatsCards';
import { TrendingUp, Sparkles, ChevronDown, Calendar } from 'lucide-react';

interface DashboardProps {
    projects: Project[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899', '#6366f1'];

export const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
    const [selectedOrg, setSelectedOrg] = useState<string>('');
    const [selectedNewOrgYear, setSelectedNewOrgYear] = useState<number>(0);
    
    const stats = useMemo(() => {
        const orgCounts: Record<string, number> = {};
        const yearCounts: Record<number, number> = {};
        const uniqueMentors = new Set<string>();
        const uniqueMentees = new Set<string>();
        
        projects.forEach(p => {
            // General Stats
            orgCounts[p.organization] = (orgCounts[p.organization] || 0) + 1;
            yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
            p.mentors.forEach(m => uniqueMentors.add(m));
            
            // Only count actual mentees, ignore empty strings for open slots
            if (p.mentee && p.mentee.trim() !== '') {
                uniqueMentees.add(p.mentee);
            }
        });

        // Year-wise new organizations calculation
        const uniqueYears = Array.from(new Set(projects.map(p => p.year))).sort((a, b) => a - b);
        const newOrgsByYear: Record<number, string[]> = {};
        const seenOrgs = new Set<string>();

        uniqueYears.forEach(year => {
             const orgsInYear = new Set(projects.filter(p => p.year === year).map(p => p.organization));
             const newInYear: string[] = [];
             orgsInYear.forEach(org => {
                 if (!seenOrgs.has(org)) {
                     newInYear.push(org);
                     seenOrgs.add(org);
                 }
             });
             newOrgsByYear[year] = newInYear.sort();
        });

        const orgStats = Object.entries(orgCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        const yearStats = Object.entries(yearCounts)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);

        const maxYear = uniqueYears[uniqueYears.length - 1];

        return {
            orgStats,
            yearStats,
            totalMentors: uniqueMentors.size,
            totalMentees: uniqueMentees.size,
            totalOrgs: Object.keys(orgCounts).length,
            newOrgsByYear,
            uniqueYears,
            currentYear: maxYear,
            allOrgsList: Object.keys(orgCounts).sort()
        };
    }, [projects]);

    // Set default selections
    useEffect(() => {
        if (stats.orgStats.length > 0 && !selectedOrg) {
            setSelectedOrg(stats.orgStats[0].name);
        }
        if (stats.uniqueYears.length > 0 && selectedNewOrgYear === 0) {
            setSelectedNewOrgYear(stats.currentYear);
        }
    }, [stats, selectedOrg, selectedNewOrgYear]);

    const topOrgs = stats.orgStats.slice(0, 8);

    // Data for the specific org trend chart
    const orgTrendData = useMemo(() => {
        if (!selectedOrg) return [];
        
        const orgProjects = projects.filter(p => p.organization === selectedOrg);
        const yearMap: Record<number, number> = {};
        
        // Get range of years from global stats to ensure timeline continuity
        stats.yearStats.forEach(y => {
            yearMap[y.year] = 0;
        });

        orgProjects.forEach(p => {
            yearMap[p.year] = (yearMap[p.year] || 0) + 1;
        });

        return Object.entries(yearMap)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);
    }, [selectedOrg, projects, stats.yearStats]);

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
                <h1 className="text-3xl font-bold text-white mb-2">Program Overview</h1>
                <p className="text-slate-400">Insights into the LFX Mentorship program growth and participation.</p>
            </div>

            <StatsCards 
                totalProjects={projects.length}
                totalOrgs={stats.totalOrgs}
                totalMentors={stats.totalMentors}
                totalMentees={stats.totalMentees}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bar Chart: Projects per Year */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
                        <Calendar size={18} /> Projects per Year
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.yearStats}>
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#1e293b'}} content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Top Organizations */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-200 mb-6">Top Organizations</h3>
                    <div className="h-72 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topOrgs}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {topOrgs.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: '12px', color: '#94a3b8'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* New Organizations */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-1">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-200">New Organizations</h3>
                            </div>
                        </div>
                        
                        <div className="relative min-w-[80px]">
                            <select 
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 pr-6 appearance-none cursor-pointer"
                                value={selectedNewOrgYear}
                                onChange={(e) => setSelectedNewOrgYear(parseInt(e.target.value))}
                            >
                                {stats.uniqueYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-1 top-2 text-slate-500 pointer-events-none" size={12} />
                        </div>
                    </div>
                    
                    <div className="mb-3 text-xs text-slate-400 border-b border-slate-800 pb-2">
                        {stats.newOrgsByYear[selectedNewOrgYear]?.length || 0} organizations joined in {selectedNewOrgYear}
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {stats.newOrgsByYear[selectedNewOrgYear]?.length > 0 ? (
                            stats.newOrgsByYear[selectedNewOrgYear].map(org => (
                                <div key={org} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                    <span className="text-sm text-slate-300 font-medium">{org}</span>
                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">New</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">No new organizations in {selectedNewOrgYear}.</p>
                        )}
                    </div>
                </div>

                {/* Organization Trends */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                         <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-200">Organization Trends</h3>
                                <p className="text-xs text-slate-500">Project growth over time</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <select 
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 appearance-none cursor-pointer"
                                value={selectedOrg}
                                onChange={(e) => setSelectedOrg(e.target.value)}
                            >
                                {stats.allOrgsList.map(org => (
                                    <option key={org} value={org}>{org}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-3 text-slate-500 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orgTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
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
            </div>
        </div>
    );
};