import React from 'react';
import { Zone1Audio } from './Zone1_Audio';
import { Zone2Info } from './Zone2_Info';
import { Zone3Stage } from './Zone3_Stage';
import { Zone4Footer } from './Zone4_Footer';
import { MotionConfig, motion, AnimatePresence } from 'framer-motion';

interface LearningLayoutProps {
    // Data
    audioUrl?: string;
    infoText?: string;
    media?: {
        type: 'image' | 'video';
        url: string;
        caption?: string;
    };
    flashcard?: {
        text: string;
        translation?: string;
        rule?: string;
    };

    // State
    canCheck: boolean;
    showNext: boolean;
    isCorrect?: boolean;

    // Callbacks
    onBack: () => void;
    onCheck: () => void;
    onNext: () => void;

    children: React.ReactNode;
}

export function LearningLayout({
    audioUrl,
    infoText,
    media,
    flashcard,
    canCheck,
    showNext,
    isCorrect,
    onBack,
    onCheck,
    onNext,
    children
}: LearningLayoutProps) {
    return (
        <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-background-dark overflow-hidden font-display">
            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Left Side: Resources (Zone 1 & 2) */}
                <aside className="w-[320px] shrink-0 flex flex-col gap-6">
                    <div className="h-[180px]">
                        <Zone1Audio audioUrl={audioUrl} />
                    </div>
                    <div className="flex-1 min-h-0">
                        <Zone2Info infoText={infoText} />
                    </div>
                </aside>

                {/* Center: The Stage (Zone 3) */}
                <section className="flex-1 flex flex-col items-center justify-start bg-white dark:bg-surface-dark rounded-[2.5rem] border border-slate-200 dark:border-surface-darker shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
                    <div className="w-full h-full overflow-y-auto custom-scrollbar p-12">
                        <Zone3Stage media={media}>
                            {children}
                        </Zone3Stage>
                    </div>

                    {/* Flashcard Overlay (Post-task) */}
                    <AnimatePresence>
                        {showNext && isCorrect && flashcard && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-6"
                            >
                                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-t-8 border-green-500 p-8 pointer-events-auto max-w-2xl mx-auto flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined !text-4xl text-green-600">auto_awesome</span>
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-green-600 mb-2">Merksatz</h4>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">
                                        {flashcard.text}
                                    </p>
                                    {flashcard.translation && (
                                        <p className="text-lg text-slate-500 dark:text-slate-400 italic font-medium">
                                            "{flashcard.translation}"
                                        </p>
                                    )}
                                    {flashcard.rule && (
                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">Regel</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{flashcard.rule}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* Zone 4: Navigation */}
            <Zone4Footer
                onBack={onBack}
                onCheck={onCheck}
                onNext={onNext}
                canCheck={canCheck}
                showNext={showNext}
            />
        </div>
    );
}
