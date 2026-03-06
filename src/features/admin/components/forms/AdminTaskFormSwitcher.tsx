interface FormProps {
    content: any;
    onChange: (content: any) => void;
}

export function AdminTaskFormSwitcher({ type, content, onChange }: { type: string, content: any, onChange: (content: any) => void }) {

    // Switch between the different form components based on the selected type
    switch (type) {
        case 'info_screen':
            return <InfoScreenForm content={content} onChange={onChange} />;
        case 'multiple_choice':
            return <MultipleChoiceForm content={content} onChange={onChange} />;
        // Add other cases here as they are built
        case 'fill_in_blank':
            return <FillInBlankForm content={content} onChange={onChange} />;
        default:
            return (
                <div className="p-12 text-center text-slate-500 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                    Spezifisches Formular für <span className="font-bold text-slate-700">{type}</span> befindet sich noch im Aufbau.
                </div>
            );
    }
}

// === TEMPLATE COMPONENTS (Placeholders for now, will abstract later if large) ===

function InfoScreenForm({ content, onChange }: FormProps) {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Wissens-Text (Markdown unterstützt)</label>
            <textarea
                value={content.text || ''}
                onChange={(e) => onChange({ ...content, text: e.target.value })}
                placeholder="Schreibe hier die Lerntheorie oder Vokabel-Erklärungen..."
                className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-y"
            />
        </div>
    );
}

function MultipleChoiceForm({ content, onChange }: FormProps) {
    // Ensure we have an array for options
    const options = content.options || ['', '', '', ''];
    const correctAnswer = content.correctAnswer || '';

    const handleOptionChange = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        onChange({ ...content, options: newOpts });
    };

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Die Frage oder der Lückensatz</label>
                <input
                    type="text"
                    value={content.question || ''}
                    onChange={(e) => onChange({ ...content, question: e.target.value })}
                    placeholder="Was heißt 'Apple' auf Deutsch?"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 mb-1">Antwortmöglichkeiten & Korrekte Lösung</label>
                {options.map((opt: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                        <input
                            type="radio"
                            name="correctAnswer"
                            checked={correctAnswer === opt && opt !== ''}
                            onChange={() => onChange({ ...content, correctAnswer: opt })}
                            title="Als korrekte Antwort markieren"
                            className="w-5 h-5 text-primary border-slate-300 focus:ring-primary"
                        />
                        <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function FillInBlankForm({ content, onChange }: FormProps) {
    return (
        <div className="space-y-4">
            <div className="bg-primary/10 text-primary p-4 rounded-xl text-sm font-medium">
                <strong>Anleitung:</strong> Schreibe den ganzen Satz und markiere die Lücken mit eckigen Klammern.
                <br />Beispiel: <em>Ich gehe in [den] Supermarkt.</em> Die App generiert automatisch die Kacheln für "den", "dem", "das" (Dummies können später ergänzt werden).
            </div>

            <label className="block text-sm font-bold text-slate-700">Lückensatz</label>
            <textarea
                value={content.sentence || ''}
                onChange={(e) => onChange({ ...content, sentence: e.target.value })}
                placeholder="Er wohnt in [der] Schweiz."
                className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-y text-lg"
            />
        </div>
    );
}
