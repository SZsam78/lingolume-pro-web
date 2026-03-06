import React from 'react';
import { Section } from '@/content/schema';
import { InfoScreenItem } from './tasks/InfoScreenItem';
import { MCQItem } from './tasks/MCQItem';
import { MatchingItem } from './tasks/MatchingItem';
import { FillBlankItem } from './tasks/FillBlankItem';
import { ListeningItem } from './tasks/ListeningItem';
import { SpeakingItem } from './tasks/SpeakingItem';
import { SentenceBuilderItem } from './tasks/SentenceBuilderItem';
import { DialogItem } from './tasks/DialogItem';

interface TaskRendererProps {
    section: Section;
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
    isCorrect?: boolean;
}

export function TaskRenderer({ section, answers, onAnswer, showResults, isCorrect }: TaskRendererProps) {
    return (
        <div className="w-full flex flex-col gap-8">
            {section.items.map((item: any) => {
                const props = {
                    key: item.id,
                    item,
                    answer: answers[item.id],
                    onAnswer: (val: any) => onAnswer(item.id, val),
                    showResults,
                    isCorrect
                };

                switch (item.type) {
                    case 'info_screen':
                        return <InfoScreenItem {...props} />;
                    case 'multiple_choice':
                        return <MCQItem {...props} />;
                    case 'matching':
                        return <MatchingItem {...props} />;
                    case 'fill_in_blank':
                        return <FillBlankItem {...props} />;
                    case 'listening':
                        return <ListeningItem {...props} />;
                    case 'speaking':
                        return <SpeakingItem {...props} />;
                    case 'sentence_builder':
                        return <SentenceBuilderItem {...props} />;
                    case 'dialog':
                        return <DialogItem {...props} />;
                    default:
                        return (
                            <div className="p-4 bg-red-50 text-red-500 rounded border border-red-200">
                                Unbekannter Aufgabentyp: {item.type}
                            </div>
                        );
                }
            })}
        </div>
    );
}
