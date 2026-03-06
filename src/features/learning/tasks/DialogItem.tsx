import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DialogItemProps {
    item: {
        content: {
            turns: Array<{ speaker: string; text: string; audioUrl?: string }>;
        };
    };
    onAnswer?: (val: any) => void;
}

export function DialogItem({ item, onAnswer }: DialogItemProps) {
    const { turns } = item.content;

    React.useEffect(() => {
        if (onAnswer) {
            onAnswer(true);
        }
    }, [onAnswer]);

    return (
        <div className="w-full flex flex-col gap-6 max-w-2xl mx-auto">
            {turns.map((turn, idx) => {
                const isA = turn.speaker === 'A' || turn.speaker === '1' || idx % 2 === 0;

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: isA ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                            "flex flex-col gap-1 max-w-[85%]",
                            isA ? "self-start items-start" : "self-end items-end"
                        )}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">
                            {turn.speaker}
                        </span>
                        <div className={cn(
                            "p-5 rounded-[2rem] text-lg font-bold leading-relaxed shadow-sm",
                            isA
                                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700"
                                : "bg-primary text-white rounded-br-none shadow-orange-500/10"
                        )}>
                            {turn.text}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
