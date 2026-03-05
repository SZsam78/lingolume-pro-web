import React from 'react';
import { Section } from '@/content/schema';
import { cn } from '@/lib/utils';
import { MCQView } from './tasks/MCQView';
import { FillBlankView } from './tasks/FillBlankView';
import { ReorderView } from './tasks/ReorderView';
import { AudioPlayer } from './AudioPlayer';

const DialogView = ({ items }: any) => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {items.map((item: any, i: number) => {
            const lines = item.lines || (item.speaker && item.text ? [{ id: i, speaker: item.speaker, text: item.text }] : []);
            return (
                <div key={i} className="flex flex-col gap-6">
                    {item.meta?.audioUrl && (
                        <div className="mb-2">
                            <AudioPlayer url={item.meta.audioUrl} />
                        </div>
                    )}
                    <div className="flex flex-col gap-4">
                        {(lines || []).map((line: any, idx: number) => (
                            <div key={line.id || idx} className={cn(
                                "flex flex-col sm:flex-row sm:gap-6 p-6 rounded-3xl border-2 transition-all hover:shadow-md",
                                idx % 2 === 0
                                    ? "bg-white dark:bg-surface-dark border-slate-100 dark:border-surface-darker"
                                    : "bg-slate-50 dark:bg-slate-900/50 border-transparent sm:ml-8"
                            )}>
                                <span className="font-black text-xs uppercase tracking-[0.2em] text-primary mb-2 sm:mb-0 sm:min-w-[120px] sm:pt-1">
                                    {line.speaker}
                                </span>
                                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {line.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
    </div>
);

// Renders a single item by its type — used in mini_test sections that contain mixed items
function ItemByType({ item, answers, onAnswer, showResults }: any) {
    switch (item.type) {
        case 'multiple_choice':
            return <MCQView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'fill_blank':
            return <FillBlankView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'reorder_sentence':
            return <ReorderView items={[item]} answers={answers} onAnswer={onAnswer} showResults={showResults} />;
        case 'short_write':
            return (
                <div className="flex flex-col gap-6 p-8 bg-white dark:bg-surface-dark rounded-[2rem] border-2 border-slate-100 dark:border-surface-darker shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{item.prompt}</h3>
                    <textarea
                        className="w-full h-40 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none text-lg font-medium"
                        placeholder="Schreibe deine Antwort hier..."
                        value={answers[item.id] || ""}
                        onChange={(e) => onAnswer(item.id, e.target.value)}
                        disabled={showResults}
                    />
                    {showResults && item.sampleSolution && (
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border-2 border-green-100 dark:border-green-900/30">
                            <h5 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-3">Musterlösung</h5>
                            <p className="text-green-800 dark:text-green-300 font-bold leading-relaxed">{item.sampleSolution}</p>
                        </div>
                    )}
                </div>
            );
        case 'matching':
            return (
                <div className="flex flex-col gap-6 p-8 bg-white dark:bg-surface-dark rounded-[2rem] border-2 border-slate-100 dark:border-surface-darker shadow-sm">
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary">link</span>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Zuordnungsaufgabe</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {(item.pairs || []).map((pair: any, j: number) => (
                            <div key={j} className="flex items-center gap-4 group">
                                <span className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent font-bold text-slate-700 dark:text-slate-200 group-hover:border-slate-200 transition-all">
                                    {pair.left}
                                </span>
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700">arrow_forward</span>
                                <span className="flex-1 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border-2 border-primary/20 font-bold text-primary shadow-sm">
                                    {pair.right}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'roleplay':
            return (
                <div className="flex flex-col gap-6 p-8 bg-gradient-to-br from-orange-50 to-white dark:from-primary/10 dark:to-surface-dark rounded-[2rem] border-2 border-primary/20 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined !text-[120px]">forum</span>
                    </div>
                    {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                    <div className="relative z-10 flex flex-col gap-4">
                        <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-primary">Rollenspiel</h4>
                        <p className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed">{item.prompt}</p>

                        {item.usefulPhrases && (
                            <div className="mt-4">
                                <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">Nützliche Redemittel</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.usefulPhrases.map((phrase: string, j: number) => (
                                        <span key={j} className="px-4 py-2 bg-white dark:bg-surface-darker rounded-xl border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:border-primary transition-all cursor-default">
                                            {phrase}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showResults && item.sampleSolution && (
                            <div className="mt-6 p-6 bg-green-50/80 dark:bg-green-900/20 rounded-2xl border-2 border-green-200/50 backdrop-blur-sm">
                                <h5 className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-3">Beispieldialog</h5>
                                <p className="text-green-800 dark:text-green-300 font-bold leading-relaxed">{item.sampleSolution}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'dialog':
            return <DialogView items={[item]} />;
        default:
            return null;
    }
}


interface TaskRendererProps {
    section: Section;
    answers: Record<string, any>;
    onAnswer: (itemId: string, answer: any) => void;
    showResults: boolean;
}

export function TaskRenderer({ section, answers, onAnswer, showResults }: TaskRendererProps) {
    switch (section.type) {
        case 'dialog':
            return <DialogView items={section.items} />;

        case 'multiple_choice':
            return (
                <MCQView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                />
            );

        case 'fill_blank':
        case 'wortschatz':
        case 'grammatik':
            return (
                <FillBlankView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                />
            );

        case 'reorder_sentence':
            return (
                <ReorderView
                    items={section.items}
                    answers={answers}
                    onAnswer={onAnswer}
                    showResults={showResults}
                />
            );

        case 'rich_text':
        case 'reading':
            return (
                <div className="space-y-6">
                    {section.items.map((item: any, i: number) => (
                        <div key={i} className="prose dark:prose-invert max-w-none">
                            {item.meta?.audioUrl && <AudioPlayer url={item.meta.audioUrl} />}
                            {item.image && (
                                <div className="mb-4 aspect-video bg-slate-100 rounded-xl overflow-hidden border">
                                    <img
                                        src={`asset://${item.image}`}
                                        alt="Lektionsinhalt"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="whitespace-pre-wrap">{item.content}</div>
                        </div>
                    ))}
                </div>
            );

        // Sections where items can be mixed types — render each item by its own type
        case 'short_write':
        case 'matching':
        case 'roleplay':
        case 'mini_test':
        default:
            return (
                <div className="space-y-8">
                    {section.items.map((item: any, i: number) => (
                        <div key={item.id || i}>
                            <ItemByType item={item} answers={answers} onAnswer={onAnswer} showResults={showResults} />
                        </div>
                    ))}
                    {section.items.length === 0 && (
                        <div className="italic text-muted-foreground p-12 border border-dashed rounded-xl text-center">
                            Diese Sektion hat noch keine Aufgaben.
                        </div>
                    )}
                </div>
            );
    }
}
