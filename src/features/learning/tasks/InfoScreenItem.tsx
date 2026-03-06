import React from 'react';
import { motion } from 'framer-motion';

interface InfoScreenItemProps {
    item: {
        content: {
            text: string;
        };
    };
}

export function InfoScreenItem({ item }: InfoScreenItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto"
        >
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined !text-4xl text-primary">auto_stories</span>
            </div>

            <div className="prose prose-xl dark:prose-invert">
                <p className="text-2xl font-medium leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {item.content.text}
                </p>
            </div>
        </motion.div>
    );
}
