import { useState, useEffect, useMemo } from 'react';
import { Lesson, AnyItem } from '@/content/schema';
import { DB } from '@/lib/db';
import { AuthService } from '@/lib/auth';
import { SoundService } from '@/lib/audio';
import { LearningLayout } from './layout/LearningLayout';
import { TaskRenderer } from './TaskRenderer';

interface LessonPlayerProps {
    lessonId: string;
    onBack: () => void;
    onNextLesson?: (lessonId: string, moduleId?: string) => void;
    initialMode?: 'learn' | 'edit';
}

export function LessonPlayer({ lessonId, onBack, onNextLesson, initialMode }: LessonPlayerProps) {
    const user = AuthService.getCurrentUser();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    // Answers state: { [itemId]: answer }
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [showNext, setShowNext] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | undefined>(undefined);

    // Helper to adapt legacy or inconsistent data structures
    const adaptLessonData = (data: any): Lesson => {
        console.log("Adapting lesson data:", JSON.stringify(data).substring(0, 200) + "...");
        if (!data) throw new Error("Keine Daten vorhanden");

        // If it's already a modern Lesson object with sections
        if (data.sections && Array.isArray(data.sections)) {
            console.log("Data already has sections, returning as is.");
            return data as Lesson;
        }

        // If it's a legacy flat array of items (content_json)
        let rawItems = Array.isArray(data) ? data : (data.items || data.tasks || []);
        console.log("Initial rawItems count:", rawItems.length);

        // Handle case where data itself is the legacy flat content
        if (rawItems.length === 0 && data.content_json) {
            try {
                const parsed = typeof data.content_json === 'string' ? JSON.parse(data.content_json) : data.content_json;
                rawItems = Array.isArray(parsed) ? parsed : (parsed.items || parsed.tasks || []);
                console.log("Parsed content_json rawItems count:", rawItems.length);
            } catch (e) {
                console.error("Failed to parse content_json in adaptLessonData", e);
            }
        }

        if (rawItems.length > 0) {
            const result: Lesson = {
                id: lessonId,
                moduleId: data.moduleId || "Unknown",
                title: data.title || rawItems[0]?.title || "Lektion",
                sections: rawItems.map((item: any, idx: number) => {
                    // 1. Map legacy types to modern types
                    const exerciseFromList = item.exercises && item.exercises.length > 0 ? item.exercises[0] : null;
                    const legacyType = item.exerciseType || exerciseFromList?.type || item.type || 'info_screen';
                    
                    let modernType: any = legacyType;
                    if (legacyType === 'richtext' || legacyType === 'rich_text') modernType = 'info_screen';
                    if (legacyType === 'word_order' || legacyType === 'reorder_sentence') modernType = 'sentence_builder';
                    if (legacyType === 'free_text' || legacyType === 'short_write') modernType = 'info_screen';
                    if (legacyType === 'roleplay') modernType = 'info_screen';
                    if (legacyType === 'singlechoice') modernType = 'multiple_choice';
                    if (legacyType === 'fill_blank') modernType = 'fill_in_blank';

                    // 2. Extract content and normalize it
                    // Support new 'exercises' array schema
                    let content = item.content || exerciseFromList?.content || item;

                    // Normalize Dialog: Convert legacy text block to turns
                    if (modernType === 'dialog' && content.text && !content.turns) {
                        const turns = content.text.split('\n').map((line: string) => {
                            const [speaker, ...rest] = line.split(':');
                            return {
                                speaker: speaker?.trim() || "A",
                                text: rest.join(':')?.trim() || "",
                                audioUrl: ""
                            };
                        }).filter((t: any) => t.text);
                        content = { ...content, turns };
                    }

                    // Normalize MCQ: Convert legacy choices to options, solution to correctAnswer
                    if (modernType === 'multiple_choice') {
                        if (!content.options && content.choices) {
                            content.options = content.choices.map((c: any) => typeof c === 'string' ? c : (c.text || c.label));
                        }
                        if (!content.correctAnswer && content.solution) {
                            content.correctAnswer = content.solution;
                        }

                        if (!content.options && content.questions) {
                            // If it's a multi-question list, keep it but ensure each question is valid
                            content.questions = content.questions.map((q: any) => ({
                                ...q,
                                options: q.options || q.choices?.map((c: any) => typeof c === 'string' ? c : (c.text || c.label)) || [],
                                correctAnswer: q.correctAnswer || q.solution
                            }));
                            // Set the first question as top-level for convenience if needed by simpler MCQItem
                            if (!content.question && content.questions.length > 0) {
                                content.question = content.questions[0].question;
                                content.options = content.questions[0].options;
                                content.correctAnswer = content.questions[0].correctAnswer;
                            }
                        }
                    }

                    // Normalize Fill-in-Blank
                    const isLegacyFillBlank = modernType === 'fill_in_blank' && (content.blanks || content.solutions);
                    if (isLegacyFillBlank && !content.sentence) {
                        if (content.blanks) {
                            content.sentence = content.blanks.map((b: any) => b.sentence.replace('___', `[${b.correctAnswer || b.solution}]`)).join('\n');
                        } else if (content.text && content.solutions) {
                            // Case where text has placeholders and solutions is a map
                            content.sentence = content.text;
                            Object.keys(content.solutions).forEach(key => {
                                content.sentence = content.sentence.replace(key, `[${content.solutions[key]}]`);
                            });
                        }
                    }

                    // Normalize Sentence Builder (Word Order)
                    if (modernType === 'sentence_builder' && !content.tokens && (content.text || content.sentence)) {
                        // Extract tokens from a list of examples or shared text
                        const rawText = content.sentence || content.text || "";
                        const firstSentence = rawText.split('\n')[0].replace(/^\d+\.\s*/, '');
                        content = {
                            ...content,
                            tokens: firstSentence.split(' ').sort(() => Math.random() - 0.5),
                            solution: firstSentence.split(' ')
                        };
                    }

                    return {
                        id: `sec-${idx}`,
                        type: modernType,
                        title: item.title || "",
                        instruction: item.instruction || "",
                        items: [{
                            ...item,
                            id: item.id || `item-${idx}`,
                            type: modernType,
                            content: content
                        }]
                    };
                }).filter((s: any) => s.items && s.items.length > 0),
                version: "1.0.0",
                isPublished: true
            };
            console.log("Adapted lesson result success. Count:", result.sections.length);
            return result;
        }

        throw new Error("Ungültiges Lektionsformat");
    };

    useEffect(() => {
        const loadLesson = async () => {
            try {
                const data = await DB.getLesson(lessonId);
                console.log("DB.getLesson result for", lessonId, data ? "YES" : "NO");
                if (data) {
                    const parsed = typeof data.content_json === 'string' ? JSON.parse(data.content_json) : (data.sections ? data : data.content_json);

                    // If parsed is null/undefined but data has fields, use data
                    const source = parsed || data;

                    // CRITICAL: Filter empty sections if they exist in the source JSON (common in draft A1.1-L01)
                    if (source.sections && Array.isArray(source.sections)) {
                        source.sections = source.sections.filter((s: any) => s.items && s.items.length > 0);
                    }

                    setLesson(adaptLessonData(source));
                }
            } catch (error) {
                console.error("Failed to load lesson:", error);
            } finally {
                setLoading(false);
            }
        };
        loadLesson();
    }, [lessonId]);

    // Debug logging
    useEffect(() => {
        if (lesson) console.log("Lesson loaded & adapted:", lesson);
    }, [lesson]);

    const currentSection = lesson?.sections?.[currentSectionIndex];
    const currentItem: AnyItem | undefined = currentSection?.items?.[0];


    const handleAnswer = (itemId: string, answer: any) => {
        setAnswers(prev => ({ ...prev, [itemId]: answer }));
    };

    const handleCheck = async () => {
        if (!currentItem || isChecking) return;
        setIsChecking(true);

        let correct = false;
        const answer = answers[currentItem.id];

        // Basic validation logic
        if (currentItem.type === 'multiple_choice') {
            correct = answer === (currentItem as any).content?.correctAnswer || answer === (currentItem as any).correctAnswer;
        } else if (currentItem.type === 'info_screen' || currentItem.type === 'dialog') {
            correct = true;
        } else if (currentItem.type === 'matching' && answer?.complete) {
            correct = true; // Matching handles its own validation and passes complete: true
        } else {
            correct = true; // Temporary fallback for unverified types
        }

        setIsCorrect(correct);
        setShowNext(true);

        if (correct) SoundService.playSuccess();
        else SoundService.playError();

        // Save progress
        if (user) {
            try {
                await (DB as any).updateProgress(user.id, lessonId, currentItem.id, correct ? 'completed' : 'failed', answer);
            } catch (e) {
                console.warn("Progress update failed", e);
            }
        }

        setIsChecking(false);
    };

    // Auto-check for components that self-validate (like matching)
    useEffect(() => {
        if (currentItem && answers[currentItem.id]?.complete && !showNext && !isChecking) {
            handleCheck();
        }
    }, [answers, currentItem, showNext, isChecking]);

    const handleNext = () => {
        if (!lesson) return;
        if (currentSectionIndex < lesson.sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            setShowNext(false);
            setIsCorrect(undefined);
            setAnswers({}); // Reset for new task
        } else {
            onNextLesson ? onNextLesson(lessonId) : onBack();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            <div className="text-muted-foreground font-medium">Lektion am Starten...</div>
        </div>
    );

    if (!lesson || lesson.sections.length === 0) return (
        <div className="p-12 text-center space-y-4">
            <div className="text-destructive font-bold text-xl">Lektion ist leer oder im Entwurf-Modus.</div>
            <p className="text-muted-foreground">Stellen Sie sicher, dass Aufgaben im Editor hinzugefügt wurden.</p>
            <button onClick={onBack} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Zurück</button>
        </div>
    );

    if (!currentSection || !currentItem) return (
        <div className="p-12 text-center space-y-4">
            <div className="text-destructive font-bold text-xl">Aufgabe nicht gefunden.</div>
            <button onClick={onBack} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Zurück</button>
        </div>
    );

    return (
        <LearningLayout
            audioUrl={currentItem.meta?.audioUrl || (currentItem as any).content?.audioUrl}
            infoText={currentItem.meta?.infoText || (currentItem as any).content?.info}
            media={currentItem.meta?.media || (currentItem as any).content?.media}
            flashcard={currentItem.meta?.flashcard}
            canCheck={currentItem.type === 'info_screen' || currentItem.type === 'dialog' || Object.keys(answers).length > 0}
            showNext={showNext}
            isCorrect={isCorrect}
            onBack={onBack}
            onCheck={handleCheck}
            onNext={handleNext}
        >
            <TaskRenderer
                section={currentSection}
                answers={answers}
                onAnswer={handleAnswer}
                showResults={showNext}
                isCorrect={isCorrect}
            />
        </LearningLayout>
    );
}
