import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { StreamLanguage } from '@codemirror/language';
import { lua } from '@codemirror/legacy-modes/mode/lua';

// ===== State =====
let lessons = [];
let currentLesson = null;
let editorView = null;

// ===== DOM =====
const lessonSelect = document.getElementById('lessonSelect');
const descriptionEl = document.getElementById('description');
const rulesEl = document.getElementById('rules');
const editorEl = document.getElementById('editor');
const reviewBtn = document.getElementById('reviewBtn');
const resultArea = document.getElementById('resultArea');
const resultContent = document.getElementById('resultContent');

// ===== CodeMirror Setup =====
function createEditor(initialCode) {
    if (editorView) {
        editorView.destroy();
    }

    editorView = new EditorView({
        state: EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                StreamLanguage.define(lua),
                oneDark,
                EditorView.lineWrapping,
                keymap.of(defaultKeymap),
            ]
        }),
        parent: editorEl
    });
}

// ===== Load Lessons =====
async function loadLessons() {
    try {
        const res = await fetch('data/lessons.json');
        if (!res.ok) throw new Error('レッスンデータの取得に失敗しました。');
        lessons = await res.json();
        populateLessonSelect();
        if (lessons.length > 0) {
            selectLesson(lessons[0].id);
        }
    } catch (err) {
        console.error(err);
        descriptionEl.textContent = 'エラー: レッスンデータを読み込めませんでした。';
    }
}

function populateLessonSelect() {
    lessonSelect.innerHTML = '';
    lessons.forEach(lesson => {
        const opt = document.createElement('option');
        opt.value = lesson.id;
        opt.textContent = lesson.title;
        lessonSelect.appendChild(opt);
    });
}

function selectLesson(id) {
    currentLesson = lessons.find(l => l.id === id);
    if (!currentLesson) return;

    descriptionEl.textContent = currentLesson.description;
    rulesEl.textContent = currentLesson.rules;
    createEditor(currentLesson.originalCode);

    // ヒントを閉じる
    document.querySelector('.hint-accordion').removeAttribute('open');

    // 添削結果を隠す
    resultArea.classList.remove('visible');
    resultContent.textContent = '';
}

// ===== Event: Lesson Change =====
lessonSelect.addEventListener('change', () => {
    selectLesson(Number(lessonSelect.value));
});

// ===== Event: Review Button =====
reviewBtn.addEventListener('click', async () => {
    if (!currentLesson || !editorView) return;

    const userCode = editorView.state.doc.toString();

    // UI: loading state
    reviewBtn.disabled = true;
    reviewBtn.classList.add('loading');
    resultArea.classList.remove('visible');
    resultContent.textContent = '';

    try {
        const res = await fetch('api/review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lessonId: currentLesson.id,
                userCode: userCode
            })
        });

        const data = await res.json();

        if (data.success) {
            displayResult(data.result);
        } else {
            displayError(data.error || '添削に失敗しました。');
        }
    } catch (err) {
        console.error(err);
        displayError('通信エラーが発生しました。しばらくしてから再試行してください。');
    } finally {
        reviewBtn.disabled = false;
        reviewBtn.classList.remove('loading');
    }
});

// ===== Display Result =====
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// HTMLエスケープ済みの文字列に対して、簡易Markdown→HTML変換
function renderInlineMarkdown(escaped) {
    return escaped
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')   // **bold**
        .replace(/`(.+?)`/g, '<code>$1</code>');             // `code`
}

function displayResult(text) {
    resultContent.innerHTML = '';

    const lines = text.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();

        // --- を水平線に変換
        if (trimmed === '---' || trimmed === '---\r') {
            const hr = document.createElement('hr');
            hr.className = 'result-divider';
            resultContent.appendChild(hr);
            return;
        }

        const div = document.createElement('div');
        const escaped = escapeHtml(line);
        const rendered = renderInlineMarkdown(escaped);

        if (line.includes('✅')) {
            div.className = 'line-ok';
        } else if (line.includes('❌')) {
            div.className = 'line-ng';
        } else if (trimmed.startsWith('スコア:') || trimmed.startsWith('スコア：')) {
            div.className = 'line-score';
        }

        div.innerHTML = rendered;
        resultContent.appendChild(div);
    });

    resultArea.classList.add('visible');
    resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayError(msg) {
    resultContent.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'line-ng';
    div.textContent = 'エラー: ' + msg;
    resultContent.appendChild(div);
    resultArea.classList.add('visible');
}

// ===== Init =====
loadLessons();
