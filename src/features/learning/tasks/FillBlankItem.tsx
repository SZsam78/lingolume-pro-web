import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FillBlankItemProps {
    item: {
        content: {
            sentence: string;
            dummies?: string[];
        };
    };
    answer?: string[];
    onAnswer: (val: string[]) => void;
    showResults: boolean;
}

export function FillBlankItem({ item, answer = [], onAnswer, showResults }: FillBlankItemProps) {
    const { sentence, dummies = [] } = item.content;

    // Parse sentence to identify blanks and correct answers
    const parts = sentence.split(/\[.*?\]/);
    const correctAnswers = (sentence.match(/\[(.*?)\]/g) || []).map(m => m.slice(1, -1));
    const blanksCount = correctAnswers.length;

    // Initialize randomized word bank
    const [wordBank, setWordBank] = useState<string[]>([]);

    // State for current answers (empty string = unfilled slot)
    const [currentAnswers, setCurrentAnswers] = useState<string[]>(answer);

    // Which slot is currently "active" waiting to receive a word
    const [activeSlot, setActiveSlot] = useState<number>(0);

    // Track which slots are currently showing an error (shaking)
    const [errorSlots, setErrorSlots] = useState<number[]>([]);

    // Initialize arrays
    useEffect(() => {
        const allWords = [...correctAnswers, ...dummies];
        setWordBank(allWords.sort(() => Math.random() - 0.5));

        if (!answer || answer.length !== blanksCount) {
            const initial = new Array(blanksCount).fill('');
            setCurrentAnswers(initial);
            onAnswer(initial); // Though initially incomplete, it's just setting length
        } else {
            setCurrentAnswers(answer);
        }
    }, [sentence, dummies]);

    // Validation observer: when showResults is triggered globally
    useEffect(() => {
        if (showResults) {
            const wrongIndices: number[] = [];
            currentAnswers.forEach((ans, idx) => {
                if (ans !== correctAnswers[idx]) wrongIndices.push(idx);
            });

            if (wrongIndices.length > 0) {
                // Trigger shake
                setErrorSlots(wrongIndices);

                // After 500ms, bounce them back to the word bank
                setTimeout(() => {
                    const newAnswers = [...currentAnswers];
                    wrongIndices.forEach(idx => { newAnswers[idx] = ''; });
                    setCurrentAnswers(newAnswers);
                    setErrorSlots([]);
                    setActiveSlot(wrongIndices[0]); // Focus first empty

                    // Update global state so validation button resets
                    onAnswer(newAnswers);
                }, 600);
            }
        }
    }, [showResults]);

    const handleWordClick = (word: string) => {
        if (showResults) return; // Locked during validation

        // Find the slot to put it in
        let targetSlot = activeSlot;
        if (currentAnswers[targetSlot] !== '') {
            // Find first empty slot if active is filled
            const firstEmpty = currentAnswers.findIndex(a => !a);
            if (firstEmpty === -1) return; // All full
            targetSlot = firstEmpty;
        }

        const newAnswers = [...currentAnswers];
        newAnswers[targetSlot] = word;
        setCurrentAnswers(newAnswers);
        onAnswer(newAnswers);

        // Auto-advance active slot
        const nextEmpty = newAnswers.findIndex(a => !a);
        if (nextEmpty !== -1) {
            setActiveSlot(nextEmpty);
        }
    };

    const handleSlotClick = (index: number) => {
        if (showResults) return;

        if (currentAnswers[index] !== '') {
            // Remove word, return to bank
            const newAnswers = [...currentAnswers];
            newAnswers[index] = '';
            setCurrentAnswers(newAnswers);
            onAnswer(newAnswers);
        }
        setActiveSlot(index);
    };

    // Calculate which wordbank words are currently used in the slots
    // We map by index or occurrence to allow multiple identical words
    const usedIndicesInBank = new Set<number>();
    const tempAnswers = [...currentAnswers];
    wordBank.forEach((wbWord, idx) => {
        const foundIdx = tempAnswers.indexOf(wbWord);
        if (foundIdx !== -1) {
            usedIndicesInBank.add(idx);
            tempAnswers[foundIdx] = null as any; // consume it so duplicates map correctly
        }
    });

    return (
        <div className="w-full flex flex-col gap-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center">
                Vervollständigen Sie den Satz
            </h2>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                <div className="text-2xl font-bold leading-[4rem] text-slate-700 dark:text-slate-200 flex flex-wrap gap-x-2 gap-y-6 items-center justify-center">
                    {parts.map((part, i) => (
                        <React.Fragment key={i}>
                            <span className="whitespace-pre-wrap">{part.replace(/_/g, '')}</span> {/* Clean up legacy underscores */}
                            {i < blanksCount && (
                                <button
                                    onClick={() => handleSlotClick(i)}
                                    className={cn(
                                        "min-w-[120px] h-14 border-b-4 border-dashed mx-2 transition-all flex items-center justify-center px-4 relative cursor-pointer",
                                        // Empty states (inactive vs active)
                                        !currentAnswers[i] && i !== activeSlot && "border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-transparent",
                                        !currentAnswers[i] && i === activeSlot && "border-primary bg-primary/5 ring-4 ring-primary/10 rounded-xl",
                                        // Filled state
                                        currentAnswers[i] && !showResults && "border-primary bg-white dark:bg-slate-800 rounded-xl border-2 border-b-4 shadow-sm text-primary font-black scale-105",
                                        // Checked state: Correct
                                        showResults && currentAnswers[i] === correctAnswers[i] && "border-green-500 bg-green-50 text-green-700 rounded-xl border-2 border-b-4 shadow-sm scale-110 cursor-default",
                                        // Checked state: Error
                                        errorSlots.includes(i) && "border-red-500 bg-red-50 text-red-700 rounded-xl border-2 border-b-4 animate-shake z-10"
                                    )}
                                >
                                    {currentAnswers[i] && <span>{currentAnswers[i]}</span>}
                                    {showResults && currentAnswers[i] === correctAnswers[i] && (
                                        <Check className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-1 h-6 w-6 shadow-md" />
                                    )}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center min-h-[100px]">
                {wordBank.map((word, idx) => {
                    const isUsed = usedIndicesInBank.has(idx);
                    return (
                        <button
                            key={`wb-${idx}`}
                            onClick={() => !isUsed && handleWordClick(word)}
                            className={cn(
                                "px-6 py-3 rounded-2xl border-2 font-black text-lg shadow-sm transition-all",
                                isUsed
                                    ? "bg-slate-100 dark:bg-slate-800 border-transparent text-slate-300 dark:text-slate-600 scale-95 opacity-50 cursor-default"
                                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            )}
                        >
                            {word}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
