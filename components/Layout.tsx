import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BarChart3, Search, Github, Star } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const [starCount, setStarCount] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/sanjay7178/lfx-insights')
            .then(res => res.json())
            .then(data => {
                if (typeof data.stargazers_count === 'number') {
                    setStarCount(data.stargazers_count);
                }
            })
            .catch(err => console.error('Failed to fetch GitHub stars', err));
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path ? "text-blue-400 bg-slate-800" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800";
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            L
                        </div>
                        <span className="text-xl font-bold text-slate-100 tracking-tight">LFX <span className="text-slate-500">Insights</span></span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <Link to="/" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/')}`}>
                            <LayoutGrid size={16} />
                            Dashboard
                        </Link>
                        <Link to="/projects" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/projects')}`}>
                            <Search size={16} />
                            Browse Projects
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                         <a 
                            href="https://github.com/sanjay7178/lfx-insights" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full px-4 py-1.5 text-sm font-medium group"
                         >
                            <Github size={18} />
                            {starCount !== null && (
                                <>
                                    <span className="w-px h-4 bg-slate-700 mx-1"></span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-mono font-semibold text-slate-200 group-hover:text-white transition-colors">{starCount}</span>
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                    </span>
                                </>
                            )}
                         </a>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
                <div className="flex justify-around p-2">
                    <Link to="/" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/')}`}>
                        <BarChart3 size={20} />
                        <span className="text-xs mt-1">Stats</span>
                    </Link>
                    <Link to="/projects" className={`flex flex-col items-center p-2 rounded-lg ${isActive('/projects')}`}>
                        <Search size={20} />
                        <span className="text-xs mt-1">Search</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 mb-16 md:mb-0">
                {children}
            </main>

            <footer className="border-t border-slate-900 py-8 mt-auto hidden md:block">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>Data source: CNCF Mentoring Repository</p>
                    <p className="mt-2">Built with React, Tailwind, and Recharts.</p>
                </div>
            </footer>
        </div>
    );
};