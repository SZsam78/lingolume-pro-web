import React from 'react';
import { MCQItem } from './MCQItem';
import { SentenceBuilderItem } from './SentenceBuilderItem';

interface ListeningItemProps {
    item: {
        content: {
            variant: 'multiple_choice' | 'sentence_builder';
            // Rest of content matches either MCQ or SentenceBuilder
        };
    };
    answer: any;
    onAnswer: (val: any) => void;
    showResults: boolean;
}

export function ListeningItem({ item, answer, onAnswer, showResults }: ListeningItemProps) {
    // ListeningItem is a wrapper that uses MCQ or SentenceBuilder logic depending on the variant
    if (item.content.variant === 'multiple_choice') {
        return <MCQItem item={item as any} answer={answer} onAnswer={onAnswer} showResults={showResults} />;
    } else {
        return <SentenceBuilderItem item={item as any} answer={answer} onAnswer={onAnswer} showResults={showResults} />;
    }
}
