import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface MCQItemProps {
    item: {
        content: {
            question: string;
            options: string[];
            correctAnswer: string;
            feedbackError?: string;
        };
    };
    answer?: string;
    onAnswer: (val: string) => void;
    showResults: boolean;
}

export function MCQItem({ item, answer, onAnswer, showResults }: MCQItemProps) {
    const { question, options, correctAnswer, feedbackError } = item.content;

    return (
        <div className="w-full flex flex-col gap-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center leading-tight">
                {question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {options.map((option, idx) => {
                    const isSelected = answer === option;
                    const isCorrect = option === correctAnswer;
                    const shouldHighlightCorrect = isCorrect && showResults;
                    const isPreviouslyWrong = isSelected && showResults && !isCorrect;

                    return (
                        <button
                            key={idx}
                            onClick={() => onAnswer(option)}
                            className={cn(
                                "flex items-center justify-between p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 relative overflow-hidden group w-full",
                                // Default state
                                "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                                // Selected state
                                isSelected && !showResults && "border-primary bg-primary/5 ring-4 ring-primary/10",
                                // Correct outcome (only if globally checked)
                                shouldHighlightCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20 ring-4 ring-green-500/10",
                                // Wrong outcome
                                isPreviouslyWrong && "border-red-500 bg-red-50 dark:bg-red-900/20 ring-4 ring-red-500/10 animate-shake",
                                // Disabled state (dim other options if we show results and this isn't correct)
                                showResults && !shouldHighlightCorrect && "opacity-40 grayscale-[0.5]"
                            )}
                            disabled={shouldHighlightCorrect} // Disable only when correct answer is revealed
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors shrink-0",
                                    isSelected && !shouldHighlightCorrect && !isPreviouslyWrong ? "bg-primary text-white" :
                                        shouldHighlightCorrect ? "bg-green-500 text-white" :
                                            isPreviouslyWrong ? "bg-red-500 text-white" :
                                                "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary"
                                )}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                    {option}
                                </span>
                            </div>

                            {showResults && (
                                <div className="flex items-center shrink-0">
                                    {isCorrect && <Check className="text-green-500 h-6 w-6" strokeWidth={3} />}
                                    {isPreviouslyWrong && <X className="text-red-500 h-6 w-6" strokeWidth={3} />}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {showResults && answer !== correctAnswer && feedbackError && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-start gap-3"
                >
                    <span className="material-symbols-outlined text-red-500 mt-0.5">info</span>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 leading-relaxed italic">
                        {feedbackError}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
