import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { ChevronLeft, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Zone4FooterProps {
    onBack: () => void;
    onCheck: () => void;
    onNext: () => void;
    canCheck: boolean;
    showNext: boolean;
    isChecking?: boolean;
}

export function Zone4Footer({ onBack, onCheck, onNext, canCheck, showNext, isChecking }: Zone4FooterProps) {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-slate-200 dark:border-surface-darker bg-white dark:bg-surface-dark py-4 px-8 shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-6">
                <button
                    onClick={onBack}
                    className="flex items-center justify-center rounded-2xl h-14 px-8 bg-slate-100 dark:bg-surface-darker text-slate-600 dark:text-slate-300 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs border-b-4 border-b-slate-200 dark:border-b-black/20"
                >
                    <ChevronLeft className="mr-2" size={18} />
                    {t('zurueck')}
                </button>

                <div className="flex items-center gap-4">
                    {!showNext ? (
                        <button
                            onClick={onCheck}
                            disabled={!canCheck || isChecking}
                            className={cn(
                                "flex items-center justify-center rounded-2xl h-14 px-12 text-lg font-black transition-all uppercase tracking-widest border-b-4",
                                canCheck
                                    ? "bg-primary text-white shadow-xl shadow-orange-500/20 hover:bg-orange-600 border-b-orange-700/30 active:translate-y-1"
                                    : "bg-slate-200 text-slate-400 border-b-slate-300 cursor-not-allowed"
                            )}
                        >
                            <CheckCircle className="mr-3" size={24} />
                            {isChecking ? '...' : t('pruefen')}
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            className="flex items-center justify-center rounded-2xl h-14 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-black shadow-xl hover:scale-105 active:translate-y-1 transition-all uppercase tracking-widest border-b-4 border-b-black/20 dark:border-b-slate-200/50"
                        >
                            <span className="mr-3">Weiter</span>
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            </div>
        </footer>
    );
}
