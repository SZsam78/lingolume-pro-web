import { z } from 'zod';

// --- Global UX Features ---

export const MediaSchema = z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    caption: z.string().optional(),
});

export const FlashcardSchema = z.object({
    text: z.string(),
    translation: z.string().optional(),
    rule: z.string().optional(),
});

// --- Base Types ---

export const SectionTypeSchema = z.enum([
    'info_screen',
    'multiple_choice',
    'matching',
    'fill_in_blank',
    'listening',
    'speaking',
    'sentence_builder',
    'dialog',
]);

export type SectionType = z.infer<typeof SectionTypeSchema>;

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

// --- Item Metadata ---

export const ItemMetaSchema = z.object({
    difficulty: DifficultySchema.optional(),
    tags: z.array(z.string()).optional(),
    points: z.number().optional(),
    isMandatory: z.boolean().default(false),
    canShowSolution: z.boolean().default(true),
    timeEstimate: z.number().optional(), // In minutes
    audioUrl: z.string().optional(), // Zone 1 Audio
    infoText: z.string().optional(), // Zone 2 Info Box
    media: MediaSchema.optional(), // Zone 3 Top
    flashcard: FlashcardSchema.optional(), // Post-task state
});

// --- Item Content Schemas ---

export const InfoScreenItemSchema = z.object({
    id: z.string(),
    type: z.literal('info_screen'),
    text: z.string(),
    meta: ItemMetaSchema.optional(),
});

export const MCQItemSchema = z.object({
    id: z.string(),
    type: z.literal('multiple_choice'),
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
    meta: ItemMetaSchema.optional(),
});

export const MatchingPairSchema = z.object({
    left: z.string(),
    right: z.string(),
});

export const MatchingItemSchema = z.object({
    id: z.string(),
    type: z.literal('matching'),
    pairs: z.array(MatchingPairSchema),
    meta: ItemMetaSchema.optional(),
});

export const FillBlankItemSchema = z.object({
    id: z.string(),
    type: z.literal('fill_in_blank'),
    text: z.string(), // "Hallo, ich [bin] Lukas."
    wordBank: z.array(z.string()).optional(),
    meta: ItemMetaSchema.optional(),
});

export const ListeningItemSchema = z.object({
    id: z.string(),
    type: z.literal('listening'),
    audioUrl: z.string(),
    variant: z.enum(['mcq', 'sentence_builder']),
    mcq: z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
    }).optional(),
    sentenceBuilder: z.object({
        tokens: z.array(z.string()),
        solution: z.array(z.string()),
    }).optional(),
    meta: ItemMetaSchema.optional(),
});

export const SpeakingItemSchema = z.object({
    id: z.string(),
    type: z.literal('speaking'),
    targetText: z.string(),
    meta: ItemMetaSchema.optional(),
});

export const SentenceBuilderItemSchema = z.object({
    id: z.string(),
    type: z.literal('sentence_builder'),
    tokens: z.array(z.string()),
    solution: z.array(z.string()),
    meta: ItemMetaSchema.optional(),
});

export const DialogTurnSchema = z.object({
    speaker: z.string(),
    text: z.string(),
    audioUrl: z.string().optional(),
});

export const DialogItemSchema = z.object({
    id: z.string(),
    type: z.literal('dialog'),
    turns: z.array(DialogTurnSchema),
    meta: ItemMetaSchema.optional(),
});

export const AnyItemSchema = z.union([
    InfoScreenItemSchema,
    MCQItemSchema,
    MatchingItemSchema,
    FillBlankItemSchema,
    ListeningItemSchema,
    SpeakingItemSchema,
    SentenceBuilderItemSchema,
    DialogItemSchema,
]);

export type AnyItem = z.infer<typeof AnyItemSchema>;

// --- Section Schema ---

export const SectionSchema = z.object({
    id: z.string(),
    type: SectionTypeSchema,
    title: z.string(),
    instruction: z.string().optional(),
    items: z.array(AnyItemSchema),
    meta: z.record(z.any()).optional(),
});

export type Section = z.infer<typeof SectionSchema>;

// --- Lesson Schema ---

export const LessonSchema = z.object({
    id: z.string(),
    moduleId: z.string(),
    title: z.string(),
    sections: z.array(SectionSchema),
    version: z.string().default('1.0.0'),
    isPublished: z.boolean().default(false),
});

export type Lesson = z.infer<typeof LessonSchema>;

// --- Module Schema ---

export const ModuleIdSchema = z.enum(['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2']);
export type ModuleId = z.infer<typeof ModuleIdSchema>;

export const ModuleSchema = z.object({
    id: ModuleIdSchema,
    title: z.string(),
    lessons: z.array(z.string()),
});

export type Module = z.infer<typeof ModuleSchema>;

// --- Progress Schema ---

export const ItemProgressSchema = z.object({
    itemId: z.string(),
    status: z.enum(['pending', 'completed', 'failed']),
    attempts: z.number().default(0),
    lastAnswer: z.any().optional(),
    lastResult: z.any().optional(),
    updatedAt: z.string(),
});

export type ItemProgress = z.infer<typeof ItemProgressSchema>;
