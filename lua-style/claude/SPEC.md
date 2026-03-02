# Luaスタイルガイド添削Webアプリ 設計仕様書

## 概要
Roblox公式Luaスタイルガイドの練習問題をAIが添削するWebアプリ。
ユーザーがコードを編集し「添削する」ボタンを押すと、Anthropic APIがスタイルガイドのルールに基づいて添削結果を返す。

## デプロイ先
- URL: `study.robgym.jp/lua-style/`
- サーバー: Xserver（共用レンタルサーバー）
- 使える技術: PHP 8.x, HTML, CSS, JavaScript（静的ファイル + PHP）
- Node.js/Docker/Python は使えない
- `study.robgym.jp` のルートには置かない。将来的に他の学習ツールも追加するため、ツールごとにサブディレクトリを切る。

## ファイル構成
```
study.robgym.jp/
├── index.html                  ← 将来：ツール一覧ページ（今回は作らなくてよい）
└── lua-style/                  ← 今回の添削アプリ
    ├── index.html              ← メイン画面
    ├── css/
    │   └── style.css           ← スタイル
    ├── js/
    │   └── app.js              ← フロントロジック
    ├── api/
    │   ├── review.php          ← Anthropic API中継エンドポイント
    │   └── config.php          ← APIキー設定（.gitignore対象）
    └── data/
        └── lessons.json        ← レッスンデータ（問題コード・ルール情報）
```

## 技術スタック

### フロントエンド
- **HTML5 + CSS3 + Vanilla JavaScript**（フレームワーク不使用）
- **CodeMirror 6**（CDN読み込み）— Luaシンタックスハイライト付きコードエディタ
  - CDN: https://cdnjs.cloudflare.com から読み込む
- レスポンシブ対応（スマホでも最低限使える程度）

### バックエンド
- **PHP**（Xserver標準のPHP 8.x）
- `api/review.php` が唯一のエンドポイント
- PHPの `curl` でAnthropic APIを呼び出す
- APIキーは `api/config.php` に記述し、フロントには露出しない

### 外部API
- **Anthropic Messages API**
  - エンドポイント: `https://api.anthropic.com/v1/messages`
  - モデル: `claude-sonnet-4-20250514`
  - APIキーはサーバーサイド（PHP）に保持

## 画面構成（1ページ完結）

### ① ヘッダー
- タイトル: 「Luaスタイルガイド 練習問題」
- サブタイトル: 「ロブジム・ゲームクリエイタースクール」

### ② レッスン選択
- ドロップダウン（`<select>`）
- 選択するとコードエディタに問題コードがロードされる
- 最初はレッスン1のみ。後で追加していく。

### ③ 問題文エリア
- レッスンの説明テキスト（「以下の変数名を、スタイルガイドに沿った正しい名前に直してみましょう。」など）

### ④ コードエディタ
- CodeMirror 6（Luaモード）
- 問題コードが初期表示される
- ユーザーが自由に編集できる
- 行番号表示あり

### ⑤ 「添削する」ボタン
- 押すとローディング表示 → api/review.php に POST → 結果表示
- 通信中はボタンを無効化

### ⑥ 添削結果エリア
- ボタン押下前は非表示
- 行ごと（または項目ごと）に ✅ 正解 / ❌ 不正解 + 解説を表示
- 全問正解の場合は祝福メッセージ
- Markdownをパースする必要はない。プレーンテキスト＋簡単なHTML装飾で十分。

## API仕様

### POST /api/review.php

#### リクエスト（JSON）
```json
{
  "lessonId": 1,
  "userCode": "local playerName = \"Taro\"\nlocal MAX_PLAYERS = 10\n..."
}
```

#### レスポンス（JSON）
```json
{
  "success": true,
  "result": "（AIの添削結果テキスト）"
}
```

#### エラー時
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### review.php の処理フロー
1. POSTデータ（lessonId, userCode）を受け取る
2. lessons.json から該当レッスンのデータ（ルール、元コード、解説）を読み込む
3. 添削用プロンプトを組み立てる
4. curl で Anthropic API を呼び出す
5. レスポンスを整形して返す

## 添削プロンプト設計

### システムプロンプト
```
あなたはRoblox Luaスタイルガイドの添削AIです。
ユーザーが練習問題のコードを修正した結果を採点してください。

【ルール】
- 各問題について、ユーザーの修正がスタイルガイドのルールに沿っているか判定する
- 正解の場合は ✅ を付けて、なぜ正しいか簡潔に説明する
- 不正解の場合は ❌ を付けて、何が間違っているか説明し、正しい書き方を示す
- 元のコードから変更されていない場合は「未修正です」と指摘する
- 最後に正解数/全問数のスコアを表示する
- 全問正解の場合は「パーフェクト！🎉」と祝福する
- 敬語は使わず、先生が生徒に話すようなカジュアルな口調で書く
```

### ユーザーメッセージ（テンプレート）
```
## このレッスンのルール
{lessonRules}

## 元のコード（問題）
{originalCode}

## ユーザーの修正コード
{userCode}

各行について添削してください。
```

## lessons.json のデータ構造

```json
[
  {
    "id": 1,
    "title": "レッスン1：命名規則（Naming）",
    "description": "以下の変数名を、スタイルガイドに沿った正しい名前に直してみましょう。",
    "rules": "【このレッスンのルール】\n1. ローカル変数・関数 → camelCase（例: playerScore）\n2. クラス・Enum的オブジェクト → PascalCase（例: MyClass）\n3. ローカル定数 → LOUD_SNAKE_CASE（例: MAX_HEALTH）\n4. プライベートメンバー → _camelCase（例: _health）\n5. 省略しない。完全にスペルアウトする。\n6. 頭字語は普通の単語として扱う（HTTP → Http）。\n   例外: RGB, XYZ のようなセット（集合）は全大文字OK。",
    "originalCode": "local PLAYERNAME = \"Taro\"           -- プレイヤーの名前を入れる変数\nlocal max_players = 10              -- ゲームの最大人数（定数）\nlocal function GetScore()           -- スコアを取得する関数\n    -- ...\nend\nlocal dmg = 25                      -- ダメージ量を入れる変数\nlocal myHTTPService = game:GetService(\"HttpService\")  -- サービス取得"
  }
]
```

## デザイン方針
- 色: 黒背景のコードエディタ（CodeMirrorのダークテーマ）、白背景のUI
- フォント: コード部分は等幅フォント、UIはシステムフォント
- ロブジムのブランドカラーがあれば合わせる（なければ青系統）
- 派手な装飾は不要。シンプルで機能的なデザイン。

## まず実装するもの（MVP）
- レッスン1のみ
- 上記の全機能
- ローカルでPHP built-in serverで動作確認できる状態にする
  - `php -S localhost:8000` で起動して確認

## config.php のテンプレート
```php
<?php
// このファイルは .gitignore に含めること
define('ANTHROPIC_API_KEY', 'sk-ant-xxxxxxxxxxxxxxxx');
```

## 注意事項
- APIキーは絶対にフロントエンドに露出させない
- review.php はPOSTリクエストのみ受け付ける
- CORSヘッダーは同一オリジンなので不要
- XSS対策: ユーザー入力はHTMLエスケープして表示する
- レート制限: 現時点では不要