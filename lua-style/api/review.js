import { readFileSync } from 'fs';
import { join } from 'path';

const SYSTEM_PROMPT = `あなたはRoblox Luaスタイルガイドの添削AIです。
ユーザーが練習問題のコードを修正した結果を採点してください。

# 採点ルール
- 各問題について、ユーザーの修正がスタイルガイドのルールに沿っているか判定する
- 正解なら ✅、不正解なら ❌ を行頭に付ける
- 元のコードから変更されていない場合は ❌ で「まだ直してないね。」と指摘する
- 全問正解の場合は「パーフェクト！🎉」と祝福する

# 口調ルール（厳守）
- 一人称は使わない
- 幼児語は使わない。大人同士のカジュアルな丁寧語。
- 語尾は幼児語の「〜よ」は使わない。ですます調で終わる。
- 正解のとき：「OK！」「正解！」など短く肯定してから、理由を1文で添える
- 不正解のとき：「惜しい！」と前向きな言葉で始めてから、理由と正解を示す
- 解説は1〜2文。長く書かない。
- 「すごい！」「えらい！」「がんばったね！」のような子供を褒める表現は禁止

# 出力フォーマット（厳守）
以下のフォーマットを1文字も変えずに守ること。Markdownの見出し(##)や太字(**)は絶対に使わないこと。

--- ここからフォーマット ---

✅ 1. \`ユーザーが書いた変数名や関数名\` → 短い褒め言葉！理由を1文で。

❌ 2. \`ユーザーが書いた変数名や関数名\` → 前向きな言葉！理由を1文で。正しくは \`正解の名前\` です。

✅ 3. \`ユーザーが書いた変数名や関数名\` → 短い褒め言葉！理由を1文で。

---
スコア: ○/○

全体への一言コメント

--- ここまでフォーマット ---

重要な注意：
- 各問題は「✅」または「❌」で始め、番号、バッククォートで囲んだ名前、→、コメントの順
- 各問題の間は空行を1行入れる
- 「---」の前後に空行を入れる
- バッククォートの中にはコード名のみ入れる（文全体を入れない）
- Markdownの見出し(#, ##)、太字(**text**)は使用禁止`;

export default async function handler(req, res) {
    // POSTリクエストのみ受け付ける
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'POSTリクエストのみ受け付けます。' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ success: false, error: 'APIキーが設定されていません。' });
    }

    // リクエストボディ取得
    const { lessonId, userCode } = req.body || {};
    if (!lessonId || !userCode) {
        return res.status(400).json({ success: false, error: 'lessonId と userCode が必要です。' });
    }

    // lessons.json からレッスンデータ取得
    let lessons;
    try {
        const lessonsPath = join(process.cwd(), 'data', 'lessons.json');
        lessons = JSON.parse(readFileSync(lessonsPath, 'utf-8'));
    } catch (e) {
        return res.status(500).json({ success: false, error: 'レッスンデータの読み込みに失敗しました。' });
    }

    // 該当レッスンを検索
    const lesson = lessons.find(l => l.id === Number(lessonId));
    if (!lesson) {
        return res.status(404).json({ success: false, error: '指定されたレッスンが見つかりません。' });
    }

    // ユーザーメッセージ組み立て
    const userMessage = `## このレッスンのルール
${lesson.rules}

## 元のコード（問題）
\`\`\`lua
${lesson.originalCode}
\`\`\`

## ユーザーの修正コード
\`\`\`lua
${userCode}
\`\`\`

各行について添削してください。`;

    // Anthropic API呼び出し
    try {
        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                system: SYSTEM_PROMPT,
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        const data = await apiRes.json();

        if (!apiRes.ok) {
            const errMsg = data?.error?.message || 'API呼び出しに失敗しました。';
            return res.status(500).json({ success: false, error: errMsg });
        }

        // レスポンスからテキスト抽出
        const resultText = (data.content || [])
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');

        return res.status(200).json({ success: true, result: resultText });

    } catch (e) {
        return res.status(500).json({ success: false, error: 'API通信エラー: ' + e.message });
    }
}
