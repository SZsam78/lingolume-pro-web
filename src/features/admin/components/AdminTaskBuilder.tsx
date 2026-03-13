import { useState } from 'react';
import { default as toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { AdminTaskFormSwitcher } from './forms/AdminTaskFormSwitcher';

interface AdminTaskBuilderProps {
    moduleId: string;
    lessonNumber: number;
    taskNumber: number;
    onSave: () => void;
    onCancel: () => void;
}

export interface TaskData {
    exerciseType: string;
    mediaUrl: string;
    instruction: string;
    flashcard: string;
    content: any; // The specific form will mutate this
}

export function AdminTaskBuilder({ moduleId, lessonNumber, taskNumber, onSave, onCancel }: AdminTaskBuilderProps) {
    const [taskData, setTaskData] = useState<TaskData>({
        exerciseType: 'info_screen',
        mediaUrl: '',
        instruction: '',
        flashcard: '',
        content: {}
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!taskData.exerciseType) {
            toast.error("Bitte Aufgabentyp wählen");
            return;
        }

        setIsSaving(true);

        try {
            const lessonStr = lessonNumber.toString().padStart(2, '0');
            const taskStr = taskNumber.toString().padStart(2, '0');
            const lessonId = `${moduleId}-L${lessonStr}`;
            const docPath = `modules/${moduleId}/lessons/${lessonId}/tasks/Task_${taskStr}`;

            const payload = {
                moduleId,
                lessonId: lessonNumber,
                taskId: taskNumber,
                mediaUrl: taskData.mediaUrl,
                instruction: taskData.instruction,
                exerciseType: taskData.exerciseType,
                content: taskData.content,
                flashcard: taskData.flashcard,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(firestore, docPath), payload, { merge: true });

            toast.success(`Aufgabe ${taskNumber} gespeichert!`);
            onSave(); // Triggers the return routing to the task list
        } catch (error) {
            console.error("Fehler beim Speichern der Aufgabe:", error);
            toast.error("Fehler beim Speichern der Aufgabe.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header / Breadcrumbs */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Abbrechen
                </button>
                <div className="font-bold text-slate-900">
                    Modul {moduleId} • Lektion {lessonNumber} • Aufgabe {taskNumber}
                </div>
                <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            {/* 4-Zone Layout */}
            <div className="flex-1 overflow-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full pb-32">

                    {/* Left Column: Zones 1 & 2 */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Zone 1: Media (Links Oben) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[250px]">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zone 1: Medien</h3>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Medien-URL (Bild/Video)</label>
                                    <input
                                        type="url"
                                        value={taskData.mediaUrl}
                                        onChange={(e) => setTaskData({ ...taskData, mediaUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Videos max. 10 Sekunden. Bleibt leer, wenn nicht benötigt.</p>
                                </div>
                                {taskData.mediaUrl && (
                                    <div className="flex-1 relative bg-slate-100 rounded-xl overflow-hidden min-h-[150px]">
                                        {/* Simple preview logic based on extension */}
                                        {taskData.mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                            <video src={taskData.mediaUrl} controls className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                            <img src={taskData.mediaUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Zone 2: Context (Links Unten) */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[200px]">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zone 2: Kontext</h3>
                            <div className="flex-1 flex flex-col">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Instruktion / Hilfetext</label>
                                <textarea
                                    value={taskData.instruction}
                                    onChange={(e) => setTaskData({ ...taskData, instruction: e.target.value })}
                                    placeholder="Z.B.: Achte auf die Endungen. Markiere das richtige Verb."
                                    className="w-full flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none min-h-[120px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Zone 3 Stage */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[600px]">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl shrink-0">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Zone 3: Die Bühne (Task Builder)</h3>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Aufgabentyp auswählen</label>
                                <select
                                    value={taskData.exerciseType}
                                    onChange={(e) => setTaskData({ ...taskData, exerciseType: e.target.value, content: {} })} // Reset content on type switch
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-sm transition-all font-medium"
                                >
                                    <option value="info_screen">Info-Screen (Theorie/Regeln)</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="matching">Paare finden (Matching)</option>
                                    <option value="fill_in_blank">Lückentext (Drag & Drop)</option>
                                    <option value="listening">Hörverstehen (Diktat / Quiz)</option>
                                    <option value="pronunciation">Aussprache (Voice Input)</option>
                                    <option value="word_order">Schüttelsatz</option>
                                    <option value="dialog">Dialog (Rollenspiel)</option>
                                </select>
                            </div>
                        </div>

                        {/* The Dynamic Form Provider Area */}
                        <div className="p-6 flex-1 overflow-auto bg-slate-50/20">
                            <AdminTaskFormSwitcher
                                type={taskData.exerciseType}
                                content={taskData.content}
                                onChange={(newContent) => setTaskData({ ...taskData, content: newContent })}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Zone 4: Footer (Fixed at bottom) */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Zone 4: Abschluss</h3>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Flashcard / Merksatz (Nach Lösung)</label>
                        <input
                            type="text"
                            value={taskData.flashcard}
                            onChange={(e) => setTaskData({ ...taskData, flashcard: e.target.value })}
                            placeholder="Z.B.: Das war super! 'der Baum' ist maskulin."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed shrink-0"
                    >
                        {isSaving ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        Aufgabe Speichern
                    </button>
                </div>
            </div>
        </div>
    );
}
