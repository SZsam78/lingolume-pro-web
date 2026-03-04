import { LayoutGrid, Settings, HelpCircle, LogOut, GraduationCap, PlaySquare, ShieldCheck, Image, Wrench, BookOpen, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SidebarProps {
    activeView: string;
    onNavigate: (id: string) => void;
    user: any;
}

export function Sidebar({ activeView, onNavigate, user }: SidebarProps) {
    const { t } = useTranslation();
    const userRole = user?.role || 'user';
    const permissions = user?.permissions || {};

    const items = [
        { id: 'modules', label: t('lernplan'), icon: LayoutGrid, alwaysVisible: true },
        { id: 'artikel', label: t('artikeltrainer'), icon: GraduationCap },
        { id: 'vokabeltrainer', label: t('vokabeltrainer'), icon: BookOpen },
        { id: 'story', label: t('story_modus'), icon: PlaySquare },
        { id: 'media', label: t('medien'), icon: Image, alwaysVisible: true },
        { id: 'tools', label: t('werkzeuge'), icon: Wrench, alwaysVisible: true },
        ...(userRole === 'admin' ? [{ id: 'admin', label: t('admin_bereich'), icon: ShieldCheck, alwaysVisible: true }] : []),
        { id: 'settings', label: t('einstellungen'), icon: Settings, alwaysVisible: true },
    ];

    return (
        <aside className="w-full bg-[#F9F7F2] border-r border-[#EFEBE0] flex flex-col h-full shadow-lg lg:shadow-none">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-[#1A1A1A]">
                        Lingo<span className="text-primary font-black">Lume</span>
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-3 overflow-y-auto">
                <div className="px-4 mb-2">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60">Hauptmenü</span>
                </div>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeView === item.id || (activeView === 'lessons' && item.id === 'modules');
                    const isLocked = userRole !== 'admin' && !item.alwaysVisible && !permissions[item.id];

                    return (
                        <button
                            key={item.id}
                            disabled={isLocked}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-extrabold text-sm",
                                active
                                    ? "bg-primary text-white shadow-xl shadow-primary/25 translate-x-1"
                                    : "text-[#1A1A1A]/60 hover:bg-[#F0EEE6] hover:text-[#1A1A1A]",
                                isLocked && "opacity-40 grayscale cursor-not-allowed"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <Icon className={cn("h-5 w-5", active ? "text-white" : "text-primary/70")} />
                                {item.label}
                            </div>
                            {isLocked && <Lock className="h-3 w-3 opacity-50" />}
                        </button>
                    );
                })}
            </nav>

            <div className="p-6 space-y-4">
                <div className="bg-[#F0EEE6] p-5 rounded-[2rem] border border-[#E6E2D6] relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mb-3">Community</div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md">
                                <span className="text-lg">👋</span>
                            </div>
                            <div>
                                <div className="text-xs font-black text-[#1A1A1A]">Helfe anderen!</div>
                                <div className="text-[10px] text-muted-foreground font-bold">Werde Mentor</div>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-[#F0EEE6] transition-all font-bold text-sm">
                    <LogOut className="h-5 w-5" />
                    {t('abmelden')}
                </button>
            </div>
        </aside>
    );
}

