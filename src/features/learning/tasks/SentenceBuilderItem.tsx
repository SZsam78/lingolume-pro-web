import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SentenceBuilderItemProps {
    item: {
        content: {
            targetSentence?: string;
            sentence?: string; // Fallback for old data
            dummies?: string[];
        };
    };
    answer?: string[];
    onAnswer: (val: string[]) => void;
    showResults: boolean;
}

export function SentenceBuilderItem({ item, answer = [], onAnswer, showResults }: SentenceBuilderItemProps) {
    const rawTargetSentence = item.content.targetSentence || item.content.sentence || "";
    const dummies = item.content.dummies || [];

    // Extract punctuation at the end
    const match = rawTargetSentence.match(/([.?!]+)$/);
    const punctuation = match ? match[1] : "";
    const cleanSentence = rawTargetSentence.replace(/([.?!]+)$/, "").trim();

    // The correct words in order
    const correctWords = cleanSentence.split(/\s+/).filter(Boolean);

    // State
    const [selectedWords, setSelectedWords] = useState<string[]>(answer);
    const [availableWords, setAvailableWords] = useState<string[]>([]);
    const [isError, setIsError] = useState(false);

    // Initial setup
    useEffect(() => {
        const allTokens = [...correctWords, ...dummies];

        // If we have an initial answer (e.g. going back/forward), we need to reconstruct availableWords
        const initialAvailable = [...allTokens];
        if (answer && answer.length > 0) {
            answer.forEach(w => {
                const idx = initialAvailable.indexOf(w);
                if (idx !== -1) initialAvailable.splice(idx, 1);
            });
        }

        // Only shuffle available words that aren't selected
        setAvailableWords(initialAvailable.sort(() => Math.random() - 0.5));
    }, [rawTargetSentence, dummies]); // Try to run only once or when data changes

    // Validation observer
    useEffect(() => {
        if (showResults) {
            const userStr = selectedWords.join(' ');
            if (userStr !== cleanSentence) {
                // Shake and Reset
                setIsError(true);
                setTimeout(() => {
                    const returnWords = [...availableWords, ...selectedWords];
                    setIsError(false);
                    setSelectedWords([]);
                    onAnswer([]);
                    setAvailableWords(returnWords.sort(() => Math.random() - 0.5));
                }, 600);
            }
        }
    }, [showResults]);

    const addWord = (word: string, index: number) => {
        if (showResults) return;
        const newSelection = [...selectedWords, word];
        setSelectedWords(newSelection);
        onAnswer(newSelection);

        const newAvailable = [...availableWords];
        newAvailable.splice(index, 1);
        setAvailableWords(newAvailable);
    };

    const removeWord = (word: string, index: number) => {
        if (showResults) return;
        const newSelection = [...selectedWords];
        newSelection.splice(index, 1);
        setSelectedWords(newSelection);
        onAnswer(newSelection);

        setAvailableWords([...availableWords, word]);
    };

    const isCorrect = showResults && selectedWords.join(' ') === cleanSentence;

    return (
        <div className="w-full flex flex-col gap-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center leading-tight">
                Bauen Sie den Satz korrekt zusammen
            </h2>

            {/* Target Area */}
            <div className={cn(
                "min-h-[140px] p-8 rounded-[2.5rem] border-2 flex flex-wrap gap-3 items-center justify-center content-center transition-all relative overflow-hidden",
                !isError && !isCorrect && "bg-slate-50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800",
                isError && "bg-red-50 border-red-500 animate-shake border-solid shadow-inner",
                isCorrect && "bg-green-50 border-green-500 border-solid shadow-inner"
            )}>
                <AnimatePresence>
                    {selectedWords.map((word, i) => (
                        <motion.button
                            key={`sel-${word}-${i}`}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            onClick={() => removeWord(word, i)}
                            disabled={showResults}
                            className={cn(
                                "px-6 py-3 rounded-2xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95",
                                isCorrect ? "bg-green-500 border-2 border-green-600 text-white" : "bg-white dark:bg-slate-800 border-2 border-primary text-primary shadow-primary/10"
                            )}
                        >
                            {word}
                        </motion.button>
                    ))}
                </AnimatePresence>

                {selectedWords.length > 0 && punctuation && (
                    <span className={cn(
                        "text-5xl font-black ml-2 -mt-2",
                        isCorrect ? "text-green-500" : "text-slate-400"
                    )}>
                        {punctuation}
                    </span>
                )}

                {selectedWords.length === 0 && (
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300">touch_app</span>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                            Wörter antippen zum Einfügen {punctuation && `(... ${punctuation})`}
                        </p>
                    </div>
                )}

                {isCorrect && (
                    <Check className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-2 h-12 w-12 shadow-xl m-8" strokeWidth={3} />
                )}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center min-h-[120px]">
                <AnimatePresence>
                    {availableWords.map((word, idx) => (
                        <motion.button
                            key={`avail-${word}-${idx}`}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            whileHover={!showResults ? { y: -5, scale: 1.05 } : {}}
                            whileTap={!showResults ? { scale: 0.95 } : {}}
                            onClick={() => addWord(word, idx)}
                            disabled={showResults}
                            className={cn(
                                "px-6 py-3 rounded-2xl border-2 font-bold text-lg shadow-sm transition-all",
                                showResults
                                    ? "bg-slate-100 border-transparent text-slate-300 cursor-default opacity-50"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:shadow-md hover:border-primary/30"
                            )}
                        >
                            {word}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
