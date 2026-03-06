import { ArrowLeft, FileEdit } from 'lucide-react';

interface AdminTaskListProps {
    moduleId: string;
    lessonNumber: number;
    onSelect: (taskNumber: number) => void;
    onBack: () => void;
}

export function AdminTaskList({ moduleId, lessonNumber, onSelect, onBack }: AdminTaskListProps) {
    // Fixed hierarchy: Exactly 12 tasks per lesson
    const tasks = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="p-8 max-w-5xl mx-auto w-full">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Zurück zu Lektionen ({moduleId})
            </button>

            <div className="mb-8 flex items-end justify-between">
                <div>
                    <div className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">{moduleId}</div>
                    <h2 className="text-3xl font-black text-slate-900">
                        Lektion {lessonNumber}
                    </h2>
                    <p className="text-slate-500 mt-2">Verwalten Sie die 12 Aufgaben dieser Lektion.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((taskNum) => (
                    <button
                        key={taskNum}
                        onClick={() => onSelect(taskNum)}
                        className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-left group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                {taskNum}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">Aufgabe {taskNum}</h3>
                                <p className="text-sm text-slate-500 line-clamp-1 text-left">
                                    {/* Placeholder for task type/status - will be populated from DB later */}
                                    Noch nicht konfiguriert
                                </p>
                            </div>
                        </div>
                        <FileEdit className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                    </button>
                ))}
            </div>
        </div>
    );
}
