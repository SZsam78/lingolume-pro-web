import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface MatchingItemProps {
    item: {
        content: {
            pairs: Array<{ left: string; right: string }>;
            // Dummies could be supported later if needed by adding to rightItems
        };
    };
    answer?: any;
    onAnswer: (val: any) => void;
    showResults: boolean;
}

export function MatchingItem({ item, answer, onAnswer, showResults }: MatchingItemProps) {
    const { pairs } = item.content;
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [leftItems, setLeftItems] = useState<string[]>([]);
    const [rightItems, setRightItems] = useState<string[]>([]);

    const [matchedLefts, setMatchedLefts] = useState<Set<string>>(new Set());
    const [errorLeft, setErrorLeft] = useState<string | null>(null);
    const [errorRight, setErrorRight] = useState<string | null>(null);

    useEffect(() => {
        // Initialize randomized lists
        setLeftItems(pairs.map(p => p.left).sort(() => Math.random() - 0.5));
        setRightItems(pairs.map(p => p.right).sort(() => Math.random() - 0.5));
    }, [pairs]);

    const handleLeftClick = (left: string) => {
        if (showResults || matchedLefts.has(left)) return;
        // Toggle selection
        setSelectedLeft(left === selectedLeft ? null : left);
    };

    const handleRightClick = (right: string) => {
        if (!selectedLeft || showResults) return;

        const isCorrectMatch = pairs.some(p => p.left === selectedLeft && p.right === right);

        if (isCorrectMatch) {
            // Success
            const newMatched = new Set(matchedLefts);
            newMatched.add(selectedLeft);
            setMatchedLefts(newMatched);
            setSelectedLeft(null);

            // Check if all matched
            if (newMatched.size === pairs.length) {
                // Signal completion to trigger auto-check
                onAnswer({ complete: true });
            }
        } else {
            // Error! Trigger shake
            const failedLeft = selectedLeft;
            setErrorLeft(failedLeft);
            setErrorRight(right);
            setSelectedLeft(null);

            // Clear error state after animation (400ms)
            setTimeout(() => {
                setErrorLeft(null);
                setErrorRight(null);
            }, 500);
        }
    };

    return (
        <div className="w-full flex flex-col gap-10 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center">
                Verbinden Sie die passenden Paare
            </h2>

            {/* We hide the "Prüfen" button implicitly via the LessonPlayer auto-check logic, 
                but we could also add a note here if we wanted. */}

            <div className="grid grid-cols-2 gap-x-8 md:gap-x-20 gap-y-4 relative">
                {/* Left Column */}
                <div className="flex flex-col gap-4">
                    {leftItems.map((left, idx) => {
                        const isSelected = selectedLeft === left;
                        const isMatched = matchedLefts.has(left);
                        const isError = errorLeft === left;

                        return (
                            <button
                                key={`l-${idx}`}
                                onClick={() => handleLeftClick(left)}
                                disabled={isMatched || showResults}
                                className={cn(
                                    "p-5 rounded-2xl border-2 font-bold text-lg transition-all text-left relative",
                                    !isSelected && !isMatched && !isError && "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:scale-[1.02]",
                                    isSelected && "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.02] z-10",
                                    isMatched && "bg-slate-100 dark:bg-slate-700 border-transparent opacity-50 cursor-default",
                                    isMatched && showResults && "border-green-500 bg-green-50 opacity-100 text-green-800",
                                    isError && "border-red-500 bg-red-50 ring-4 ring-red-500/10 animate-shake text-red-800 z-10"
                                )}
                            >
                                {left}
                                {isMatched && !showResults && <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-4 text-primary" size={20} />}
                            </button>
                        );
                    })}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                    {rightItems.map((right, idx) => {
                        // A right item is matched if its corresponding left is in the matched set
                        const correspondingLeft = pairs.find(p => p.right === right)?.left;
                        const isMatched = correspondingLeft ? matchedLefts.has(correspondingLeft) : false;
                        const isError = errorRight === right;

                        return (
                            <button
                                key={`r-${idx}`}
                                onClick={() => handleRightClick(right)}
                                disabled={isMatched || showResults}
                                className={cn(
                                    "p-5 rounded-2xl border-2 font-bold text-lg transition-all text-left",
                                    !isMatched && !isError && "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700",
                                    selectedLeft && !isMatched && !isError && "border-primary/40 hover:border-primary hover:bg-primary/5 hover:scale-[1.02] cursor-pointer",
                                    isMatched && "bg-slate-100 dark:bg-slate-700 border-transparent opacity-50 cursor-default",
                                    isMatched && showResults && "bg-slate-100 dark:bg-slate-800 opacity-50",
                                    isError && "border-red-500 bg-red-50 ring-4 ring-red-500/10 animate-shake text-red-800 z-10"
                                )}
                            >
                                {right}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
