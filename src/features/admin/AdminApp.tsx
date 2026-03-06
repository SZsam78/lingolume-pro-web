import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, Package, BookOpen, Layers, LogOut } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { AdminModuleSelect } from './components/AdminModuleSelect';
import { AdminLessonList } from './components/AdminLessonList';
import { AdminTaskList } from './components/AdminTaskList';
import { AdminTaskBuilder } from './components/AdminTaskBuilder';

export type AdminRoute =
    | { type: 'modules' }
    | { type: 'lessons', moduleId: string }
    | { type: 'tasks', moduleId: string, lessonNumber: number }
    | { type: 'builder', moduleId: string, lessonNumber: number, taskNumber: number };

export function AdminApp() {
    const [route, setRoute] = useState<AdminRoute>({ type: 'modules' });

    const handleNavigate = (newRoute: AdminRoute) => {
        setRoute(newRoute);
    };

    return (
        <div className="flex h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden font-sans">
            {/* Minimal Admin Sidebar */}
            <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-black text-white text-lg leading-tight">Admin CMS</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tabula Rasa</p>
                    </div>
                </div>

                <div className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => handleNavigate({ type: 'modules' })}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                            route.type === 'modules' ? "bg-primary text-white" : "hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Package className="h-4 w-4" /> Module & Kurse
                    </button>
                    {/* Placeholder for future admin sections like Users, Media Library */}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => AuthService.logout()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                        <LogOut className="h-4 w-4" /> Abmelden
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto bg-white flex flex-col">
                <main className="flex-1 relative">
                    {route.type === 'modules' && (
                        <AdminModuleSelect onSelect={(moduleId) => handleNavigate({ type: 'lessons', moduleId })} />
                    )}

                    {route.type === 'lessons' && (
                        <AdminLessonList
                            moduleId={route.moduleId}
                            onSelect={(lessonNumber) => handleNavigate({ type: 'tasks', moduleId: route.moduleId, lessonNumber })}
                            onBack={() => handleNavigate({ type: 'modules' })}
                        />
                    )}

                    {route.type === 'tasks' && (
                        <AdminTaskList
                            moduleId={route.moduleId}
                            lessonNumber={route.lessonNumber}
                            onSelect={(taskNumber) => handleNavigate({ type: 'builder', moduleId: route.moduleId, lessonNumber: route.lessonNumber, taskNumber })}
                            onBack={() => handleNavigate({ type: 'lessons', moduleId: route.moduleId })}
                        />
                    )}

                    {route.type === 'builder' && (
                        <AdminTaskBuilder
                            moduleId={route.moduleId}
                            lessonNumber={route.lessonNumber}
                            taskNumber={route.taskNumber}
                            onSave={() => handleNavigate({ type: 'tasks', moduleId: route.moduleId, lessonNumber: route.lessonNumber })}
                            onCancel={() => handleNavigate({ type: 'tasks', moduleId: route.moduleId, lessonNumber: route.lessonNumber })}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
