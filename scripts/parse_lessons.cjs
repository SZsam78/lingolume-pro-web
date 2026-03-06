const fs = require('fs');

const rawData = fs.readFileSync('./src/content/A1.1/raw_doc.txt', 'utf8');

// Split safely before each new module/lesson header
const parts = rawData.split(/(?=A[1-2]\.[1-2]\s+Lektion\s+\d+)/);

const finalLessons = {};
let successCount = 0;
let failCount = 0;

for (const chunk of parts) {
    const headerMatch = chunk.match(/^(A[1-2]\.[1-2])\s+Lektion\s+(\d+)/);
    if (!headerMatch) continue;

    const moduleId = headerMatch[1];
    const lessonNumStr = headerMatch[2];
    const lessonNum = parseInt(lessonNumStr, 10);

    const startIdx = chunk.indexOf('[');
    const endIdx = chunk.lastIndexOf(']');

    if (startIdx === -1 || endIdx === -1) {
        console.error(`Missing array brackets in ${moduleId} Lektion ${lessonNum}`);
        failCount++;
        continue;
    }

    const jsonStr = chunk.substring(startIdx, endIdx + 1);

    let parsedArray;
    try {
        parsedArray = JSON.parse(jsonStr);
    } catch (e) {
        console.error(`Failed to parse JSON for ${moduleId} Lektion ${lessonNum}:`, e.message);
        // Special case for Lektion 1 which has an open bracket but incomplete array
        if (moduleId === 'A1.1' && lessonNum === 1) {
            console.log("Skipping A1.1 Lektion 1 (incomplete raw string in document)");
        }
        failCount++;
        continue;
    }

    const transformedItems = parsedArray.map(item => {
        // 1. Remove solution
        delete item.solution;

        const type = item.exerciseType;
        const content = item.content || {};

        // 2. Info-Texte -> info_screen
        if (type === 'richtext') {
            item.exerciseType = 'info_screen';
        }
        // 3. Dialoge -> dialog
        else if (type === 'dialog') {
            if (content.text) {
                const turns = content.text.split('\n').map(line => {
                    const splitIdx = line.indexOf(':');
                    if (splitIdx !== -1) {
                        return {
                            speaker: line.substring(0, splitIdx).trim(),
                            text: line.substring(splitIdx + 1).trim(),
                            audioUrl: ""
                        };
                    }
                    return { speaker: '', text: line.trim(), audioUrl: "" };
                }).filter(t => t.text);

                item.content = { mediaUrl: "", turns };
            }
        }
        // 4. Multiple Choice -> multiple_choice
        else if (type === 'multiple_choice' || type === 'mini_test') {
            item.exerciseType = 'multiple_choice';
            if (content.questions) {
                item.content = {
                    questions: content.questions.map(q => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        feedbackError: `Schau dir die Information zu "${q.correctAnswer}" noch einmal an.`
                    }))
                };
            }
            if (content.text) {
                // Keep the text field just in case
                item.content.text = content.text;
            }
            if (content.description) delete content.description; // Not strictly needed
        }
        // 5. Matching -> matching
        else if (type === 'matching') {
            item.exerciseType = 'matching';
            if (content.pairs) {
                item.content = { pairs: content.pairs };
            }
        }
        // 6. Lückentext -> fill_in_blank
        else if (type === 'fill_in_blank') {
            item.exerciseType = 'fill_in_blank';
            if (content.blanks) {
                let textChunks = [];
                let wordBank = [];

                content.blanks.forEach(b => {
                    let newSent = b.sentence.replace('___', `[${b.correctAnswer}]`);
                    textChunks.push(newSent);
                    if (b.correctAnswer && !wordBank.includes(b.correctAnswer)) {
                        wordBank.push(b.correctAnswer);
                    }
                });

                item.content = {
                    text: textChunks.join('\n'),
                    wordBank: wordBank
                };
            }
        }

        return item;
    });

    const docId = `${moduleId}-L${String(lessonNum).padStart(2, '0')}`;
    finalLessons[docId] = {
        id: docId,
        moduleId: moduleId,
        title: parsedArray[0]?.title || `Lektion ${lessonNum}`,
        content_json: JSON.stringify(transformedItems),
        version: "1.0.0",
        isPublished: true
    };
    successCount++;
}

fs.writeFileSync('/Users/samyzouari/.gemini/antigravity/brain/4d531249-5109-4b0e-a566-7ddd7143b31e/A1.1_lessons_export.json', JSON.stringify(finalLessons, null, 2));
console.log(`Saved transformed lessons successfully! Success: ${successCount}. Failed: ${failCount}.`);
