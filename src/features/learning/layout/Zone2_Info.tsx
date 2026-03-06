import React from 'react';
import { Lightbulb } from 'lucide-react';

interface Zone2InfoProps {
    infoText?: string;
}

export function Zone2Info({ infoText }: Zone2InfoProps) {
    if (!infoText) return (
        <div className="h-full w-full bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-6 italic text-slate-400 text-center">
            <p className="text-sm">Zusätzliche Informationen erscheinen hier, falls für die Aufgabe relevant.</p>
        </div>
    );

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-surface-darker p-6 overflow-y-auto custom-scrollbar shadow-inner">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Lightbulb className="text-amber-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Kontext & Hilfen</h3>
            </div>

            <div className="prose prose-sm dark:prose-invert">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {infoText}
                </p>
            </div>
        </div>
    );
}
