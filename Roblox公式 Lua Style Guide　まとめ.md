# Roblox公式 Lua Style Guide まとめ

## 🎯 学習の目的
Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/) には、Robloxのエンジニアチームが実際に使っているコーディングルールがまとめられています。この記事では、その内容を全11回のシリーズで分かりやすく解説します。

RobloxでLuauを使ったゲーム開発をしたことがある方が、次のステップとして「正しいコードの書き方」を身につけるための内容です。

学び終えると、こんな力が身につきます。
- 誰が読んでも意味がすぐ分かる、読みやすいコードが書ける
- バグが起きにくい、安全なコードの書き方が分かる
- チーム開発でも迷わない、統一されたコーディングスタイルが身につく
- 「なんとなく」ではなく「理由のある」書き方ができるようになる
## はじめに：4つの基本原則

個別のルールを学ぶ前に、スタイルガイドの「そもそもの考え方」を押さえておきましょう。すべてのルールは、この4つの原則から生まれています。
### 原則1：書き方を統一して、議論を減らす
コードの書き方に「唯一の正解」はありません。タブでもスペースでも動きます。でも、チームの中で人によって書き方がバラバラだと、「自分のやり方が正しい」と議論になり、コードを書く時間が減ってしまいます。スタイルガイドは「この1つに決めたから、もう悩まないでコードを書こう」という約束です。
### 原則2：コードは「読む人」のために書く
コードを書くのは1回だけ。でも読むのは何度もです。レビューする人、後から修正する人、そして数ヶ月後の自分自身。だから「書きやすさ」より「読みやすさ」を常に優先します。差分（diff）がきれいに出るかどうかも大事なポイントです。
### 原則3：「魔法」を避ける
Luaには**メタテーブル**のような強力な機能がありますが、これは「魔法」のようなものです。うまく動いているときは便利ですが、壊れたときに原因が誰にも分かりません。強力な機能は、本当に必要な場面だけで使いましょう（レッスン9で詳しく学びます）。
### 原則4：Luaの慣習と一貫性を保つ
Luaコミュニティで広く使われている書き方があるなら、それに合わせます。Roblox独自のルールを無理に作るのではなく、Luaらしいコードを書くことで、他のLuaプログラマーにも読みやすいコードになります。

## レッスン1：命名規則
命名規則はコードの「読みやすさ」に最も直結するルールです。スタイルガイドの中でも最初に覚えるべき基本なので、ここからスタートします。
### なぜ命名規則が大切？
変数や関数の名前は、コードを読む人への「メッセージ」です。良い名前をつければ、コメントがなくても何をしているか分かります。逆に悪い名前は、書いた本人でさえ数ヶ月後には意味が分からなくなります。
### 4つの命名スタイル
Robloxのスタイルガイドでは、**用途に応じて4つの書き方**を使い分けます。

**1. camelCase（キャメルケース）**

**用途：** ローカル変数、関数、メンバー値

**ルール**：最初の単語は小文字、2番目以降の単語の先頭を大文字にする。
```lua
✅ 良い例
local playerScore = 0
local isGameOver = false

local function calculateDamage()
    -- ...
end
```
**2. PascalCase（パスカルケース）**

**用途：** クラス、Enum的なオブジェクト、Roblox API

**ルール**：すべての単語の先頭を大文字にする。
```lua
✅ 良い例
local MyClass = {}
local WeaponType = { Sword = "Sword", Bow = "Bow" }

-- Roblox APIも PascalCase
local Players = game:GetService("Players")
```
**3. LOUD_SNAKE_CASE（大文字スネークケース）**

**用途：** ローカル定数（変わらない値）

**ルール**：すべて大文字で、単語の間をアンダースコア **_** で区切る。
```lua
✅ 良い例
local MAX_HEALTH = 100
local DEFAULT_SPEED = 16
local RESPAWN_TIME = 5
```
**4. _camelCase（アンダースコア付きキャメルケース）**

**用途：** プライベートメンバー（外部から触ってほしくない値）

**ルール**：キャメルケースの先頭にアンダースコア **_** をつける。
```lua
✅ 良い例
function MyClass.new()
    local self = {
        _health = 100,      -- 外から直接触らないでほしい
        _isAlive = true,
    }
    return self
end
```
### その他の重要なルール
**省略しない**

単語は**完全にスペルアウト**します。省略は書くときは楽ですが、読むときに苦労します。
```lua
✅ 良い例
local playerHealth = 100
local characterModel = workspace.Character

❌ 悪い例
local plrHp = 100
local charMdl = workspace.Character
```
**頭字語（アクロニム）の扱い**

頭字語は全部大文字にしません。普通の単語と同じように扱います。

```lua
✅ 良い例
local JsonVariable = {}
local function makeHttpCall()
end

❌ 悪い例
local JSONVariable = {}
local function makeHTTPCall()
end
```
**例外：** RGB、XYZのように「セット（集合）」を表す場合は全部大文字OK。
```lua
-- これはOK（RGBは Red, Green, Blue のセット）
local anRGBValue = Color3.new(1, 0, 0)
```
**ファイル名 = エクスポートする名前**

ファイルが返すオブジェクトと、ファイル名を一致させる。

**PlayerManager.lua** → **return PlayerManager**

**calculateScore.lua** → **return calculateScore**（関数1つだけ返す場合）
### 練習問題
以下の変数名を、スタイルガイドに沿った正しい名前に直してみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```javascript
1. local PLAYERNAME = "Taro"           -- プレイヤーの名前を入れる変数
2. local max_players = 10              -- ゲームの最大人数（定数）
3. local function GetScore()           -- スコアを取得する関数
4. local dmg = 25                      -- ダメージ量を入れる変数
5. local myHTTPService = game:GetService("HttpService")  -- サービス取得
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Naming](https://roblox.github.io/lua-style-guide/#naming)」を参照してください。
次のレッスンは「レッスン2：空白・インデント・改行のルール」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの2回目です。

## レッスン2：空白・インデント・改行のルール
コードの「中身」が正しくても、空白やインデントがバラバラだと読みにくくなります。このレッスンでは、コードの「見た目」を整えるルールを学びます。
### インデント（字下げ）
**タブを使う**
Robloxのスタイルガイドでは、インデントには**タブ**を使います（スペースではありません）。ブロックが1段深くなるたびにタブを1つ追加します。
```lua
✅ 良い例：タブでインデント
local function checkPlayer(player)
	local health = player.Health
	if health > 0 then
		print(player.Name .. " is alive")
	end
end
```
Roblox Studioはデフォルトでタブを使う設定になっているので、特に設定を変えなければOKです。
**1行の長さは100文字以内**
コードの1行は**100文字以内**に収めます（タブは4文字幅として計算）。長すぎる行は横スクロールが必要になり、読みにくくなります。
### スペースのルール
**演算子の前後にスペースを入れる**
**=**、**+**、**-**、**==**、**~=**、**and**、**or** などの演算子の前後には**必ずスペース**を入れます。
```lua
✅ 良い例
local health = 100
local damage = health - 30
local isAlive = health > 0

if score >= 10 and isPlaying == true then
	print("Good job!")
end
```
```lua
❌ 悪い例
local health=100
local damage=health-30
local isAlive=health>0
```
**カンマの後にスペースを入れる**
関数の引数やテーブルの要素を区切るカンマの**後**にはスペースを入れます。カンマの**前**にはスペースを入れません。
```lua
✅ 良い例
local position = Vector3.new(10, 20, 30)
local colors = {"Red", "Blue", "Green"}
print("Hello", playerName)
```
```lua
❌ 悪い例
local position = Vector3.new(10,20,30)     -- カンマの後にスペースがない
local colors = {"Red" , "Blue" , "Green"}  -- カンマの前にスペースがある
```
**行末にスペースを残さない**
行の最後に見えないスペースが残っていることがあります。これは削除しましょう。エディタの「末尾の空白を自動削除」機能をオンにするのがおすすめです。
### 改行・空行のルール
**空行でグループを作る**
コードの意味のまとまりごとに**1行の空行**を入れて区切ると読みやすくなります。
```lua
✅ 良い例：空行でグループ分け
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local CombatModule = require(ReplicatedStorage.CombatModule)

local MAX_HEALTH = 100

local function onPlayerJoined(player)
	print(player.Name .. " joined!")
end

Players.PlayerAdded:Connect(onPlayerJoined)
```
**ブロックの先頭に空行を入れない**
**if**、**for**、**function** などのブロックを開いた直後に空行を入れるのはNGです。
```lua
✅ 良い例
local function greet(name)
	print("Hello, " .. name)
end
```
```lua
❌ 悪い例
local function greet(name)

	print("Hello, " .. name)
end
```
**1行に1つの文だけ書く**
1行に複数の文をまとめて書くのはNGです。
```lua
✅ 良い例
local x = 1
local y = 2
local z = 3
```
```lua
❌ 悪い例
local x = 1; local y = 2; local z = 3
```
### 縦揃え（垂直整列）をしない
変数の **=** を縦に揃えたくなることがありますが、スタイルガイドではこれを**禁止**しています。後から変数を追加・削除したときにすべて揃え直す必要があり、メンテナンスが大変になるからです。
```lua
✅ 良い例
local playerName = "Taro"
local score = 100
local isAlive = true
```
```lua
❌ 悪い例（縦揃え）
local playerName = "Taro"
local score      = 100
local isAlive    = true
```
### ファイルの最後に空行を入れる
ファイルの一番最後には、必ず空の改行を1行入れます。これは多くのツールやバージョン管理システムが想定している形式で、差分（diff）がきれいになります。
```lua
✅ 良い例：ファイル末尾に空行あり
return MyModule
-- ← ここに空行が1行ある
```
### 関数の本体は新しい行に書く
関数を引数として渡すとき、関数の本体を同じ行にまとめてはいけません。別の行に展開します。
```lua
✅ 良い例：関数の本体を展開
table.sort(items, function(a, b)
	local totalA = a.price + a.tax
	local totalB = b.price + b.tax
	return totalA > totalB
end)
```
```lua
❌ 悪い例：1行にまとめている
table.sort(items, function(a, b) return a.price + a.tax > b.price + b.tax end)
```
1行にまとめると、複数の **return** があるときに間違いを見落としやすくなります。展開しておけば、ミスを見つけやすく、後から処理を追加するのも簡単です。
### まとめ：9つのルール
1. インデントはタブを使う
2. 1行は100文字以内
3. 演算子の前後にスペースを入れる
4. カンマの後にスペース、前にはスペースなし
5. 空行でグループを区切る（ブロック先頭には入れない）
6. 1行に1つの文だけ
7. 縦揃えをしない
8. ファイルの最後に空行を入れる
9. 関数の本体は新しい行に展開する
### 練習問題
以下のコードにはスタイルの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local Players = game:GetService("Players")
local MAX_HEALTH=100
local MAX_SPEED  = 16
local MAX_DAMAGE = 50

local function takeDamage(player,amount)

	local newHealth = MAX_HEALTH - amount
	if newHealth > 0 then
		print(player.Name .. " survived!"); print("Health: " .. newHealth)
	end
end
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[General Punctuation](https://roblox.github.io/lua-style-guide/#general-punctuation)」「[General Whitespace](https://roblox.github.io/lua-style-guide/#general-whitespace)」を参照してください。
次のレッスンは「レッスン3：コメントの書き方」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの3回目です。

## レッスン3：コメントの書き方
コメントは「未来の自分」や「他の人」に向けたメモです。ただし、書きすぎるとかえってコードが読みにくくなります。このレッスンでは、「何を」「どこに」「どう」書くかのルールを学びます。
### 2種類のコメント
Luaには2種類のコメントがあります。用途に応じて使い分けます。
**シングルラインコメント（**--**）**
「インラインノート」（コードの中に添える短いメモ）に使います。複数行にわたる場合も、**--** を行ごとに繰り返します。
```lua
✅ 良い例：シングルラインコメント
-- この条件がないと、プレイヤーがリスポーンせずに
-- ゲームが止まってしまう。
if player.Health <= 0 then
	respawnPlayer(player)
end
```
**ブロックコメント（**--[[ ]]**）**
「ドキュメント」（ファイルや関数の説明）に使います。ファイルの先頭や、関数の前に置きます。
```lua
✅ 良い例：ファイル先頭のブロックコメント
--[[
	プレイヤーの戦闘を管理するモジュール。
	攻撃、防御、リスポーンの処理を担当する。
]]

✅ 良い例：関数前のブロックコメント
--[[
	宇宙ムーンレイをただちに停止する。

	山岳標準時の真夜中15分以内にのみ呼び出すこと。
	それ以外の時間に呼ぶと、レイが損傷する可能性がある。
]]
local function stopCosmicMoonRay()
	-- ...
end
```
### ルール1：コメントは80文字以内で折り返す
コードは100文字以内ですが、コメントは**80文字以内**で折り返します。短い行のほうが文章は読みやすいからです。
```lua
✅ 良い例：80文字で折り返し
-- この条件がないと、プレイヤーがリスポーンせずに
-- ゲームが止まってしまう。
if player.Health <= 0 then
	respawnPlayer(player)
end

❌ 悪い例：1行が長すぎる
-- この条件がないと、プレイヤーがリスポーンせずにゲームが止まってしまうので、このチェックは非常に重要です。必ず入れてください。
if player.Health <= 0 then
	respawnPlayer(player)
end
```
**ルール2：「なぜ」を書く、「何」は書かない**
コメントで最も大切なルールです。コードが「何をしているか」はコード自体を読めば分かります。コメントには「なぜそう書いたのか」を書きます。
```lua
✅ 良い例：「なぜ」を説明している
-- この条件がないと、格納庫が水浸しになってしまう。
if waterLevelTooHigh() then
	drainHangar()
end
```
```lua
❌ 悪い例：「何」を説明している（コードを読めば分かる）
-- 水位が高すぎるかチェックする
if waterLevelTooHigh() then
	-- 格納庫の水を抜く
	drainHangar()
end
```
「水位が高すぎるかチェックする」は **waterLevelTooHigh()** を読めば分かります。「格納庫が水浸しになる」という**理由**があるからこそ、このチェックが必要だと分かります。
**ルール3：ファイルの先頭にファイル名・作者・日付を書かない**
ファイル先頭のブロックコメントには、そのファイルが「なぜ存在するか」を書きます。ファイル名、作者名、日付は書きません。これらはバージョン管理システム（Gitなど）が自動的に記録してくれるからです。
```lua
✅ 良い例
--[[
	プレイヤーの戦闘を管理するモジュール。
	攻撃、防御、リスポーンの処理を担当する。
]]
```
```lua
❌ 悪い例：ファイル名・作者・日付を書いている
--[[
	CombatManager.lua
	作者：Taro
	作成日：2025-01-15
	プレイヤーの戦闘を管理するモジュール。
]]
```
**ルール4：セクションコメントを使わない**
ファイルを区切るためだけのコメント（セクションコメント）は使いません。ファイルが大きすぎて区切りが必要なら、ファイルを分割することを検討しましょう。
```lua
❌ 悪い例：セクションコメント
 VARIABLES 
local MAX_HEALTH = 100
local MAX_SPEED = 16

 FUNCTIONS 
local function takeDamage()
	-- ...
end

-
-- EVENTS
-
Players.PlayerAdded:Connect(onPlayerJoined)
```
上の例の ** VARIABLES ** や ** FUNCTIONS ** は、コードを読めば明らかなグループ分けをわざわざコメントで書いているだけです。レッスン2で学んだ「空行でグループを作る」ルールだけで十分です。
もしセクションコメントが必要に感じるほどファイルが大きいなら、以下の方法でファイルを小さくしましょう。
- 内部クラスやユーティリティ関数を別ファイルに切り出す
- 既存のライブラリで簡素化できないか検討する
### まとめ：4つのルール
1. コメントは80文字以内で折り返す
2. 「なぜ」を書く、「何」は書かない
3. ファイル先頭にファイル名・作者・日付を書かない
4. セクションコメントを使わない
### 練習問題
以下のコードにはコメントのスタイル間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
--[[
	ShopManager.lua
	作者：Taro
	作成日：2025-02-01
	ショップの購入処理を管理するモジュール。
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ShopData = require(ReplicatedStorage.ShopData)

local MAX_ITEMS = 50

 FUNCTIONS 

local ShopManager = {}

-- プレイヤーがアイテムを買う関数
function ShopManager.buyItem(player, itemId)
	-- プレイヤーが十分なコインを持っているかチェックする
	local price = ShopData.getPrice(itemId)
	local coins = player.leaderstats.Coins.Value

	-- コインが不足していないかチェックして、不足していれば購入を中止する。不足のまま処理を進めると、コインがマイナスになりデータが壊れる。
	if coins < price then
		return false
	end

	player.leaderstats.Coins.Value = coins - price
	return true
end

return ShopManager
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Comments](https://roblox.github.io/lua-style-guide/#comments)」を参照してください。
次のレッスンは「レッスン4：ファイル構造とrequire」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの4回目です。

## レッスン4：ファイル構造とrequire
Robloxのスクリプトとrequireの違い
初心者が混乱しやすいポイントなので整理します。
**game:GetService("Players")** → Robloxが最初から用意している「サービス」を取得する。Players, ReplicatedStorage, Workspace など。
**require(path.ModuleName)** → 自分や他の人が作った「モジュールスクリプト」を読み込む。
どちらもファイルの先頭に書きますが、**まずサービス、次にrequire**の順番です。なぜなら **require** のパス指定にサービス（**ReplicatedStorage** など）が必要なことが多いからです。
**ファイル構造：6つのブロック**
スタイルガイドでは、ファイルの中身を以下の**6つのブロック**に分けて、**この順番**で書くルールがあります。なぜなら、どのファイルを開いても同じ構造なら「サービスはここ」「定数はここ」とすぐ見つけられるからです。

1. ファイルの説明コメント
2. サービス（GetService）
3. モジュール（require）
4. 定数
5. 変数と関数
6. モジュールを返す（return）

### 完成形のテンプレート
実際にスクリプトを書くときは、このテンプレートを基本にします。必要なブロックだけ使えばOKです。
```lua
--[[
	プレイヤーの戦闘を管理するモジュール。
]]

-- サービス
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- モジュール
local DamageCalculator = require(ReplicatedStorage.DamageCalculator)
local EffectsModule = require(ReplicatedStorage.EffectsModule)

-- 定数
local MAX_HEALTH = 100

-- 変数と関数
local CombatManager = {}

function CombatManager.attack(attacker, target)
	local damage = DamageCalculator.calculate(attacker)
	EffectsModule.playHitEffect(target)
end

-- モジュールを返す
return CombatManager
```
### requireの並び順とグループ分け
テンプレートの基本が分かったところで、もう少し詳しいルールを見てみましょう。
### requireはアルファベット順に並べる
**require** の行が複数あるときは、モジュール名のアルファベット順（A→B→C…）に並べます。探したいモジュールがすぐ見つかるようにするためです。
```lua
✅ 良い例：アルファベット順
local CombatModule = require(ReplicatedStorage.CombatModule)
local DamageCalculator = require(ReplicatedStorage.DamageCalculator)
local EffectsModule = require(ReplicatedStorage.EffectsModule)
```
```lua
❌ 悪い例：順番がバラバラ
local EffectsModule = require(ReplicatedStorage.EffectsModule)
local CombatModule = require(ReplicatedStorage.CombatModule)
local DamageCalculator = require(ReplicatedStorage.DamageCalculator)
```
**GetService** の行も同様にアルファベット順で並べます。
### 多くのモジュールがあるときはブロック分けする
プロジェクトが大きくなると、requireが10行以上並ぶこともあります。そのときは、空行でブロック分けします。ブロックの順番は：
1. 共通の親パスの定義
2. 外部パッケージ（ライブラリ）
3. パッケージから取り出したメンバー
4. 同じプロジェクト内のモジュール
```lua
✅ 良い例：ブロック分けされた require

-- 1. 共通の親パス
local MyProject = script.Parent

-- 2. 外部パッケージ
local Roact = require(MyProject.Packages.Roact)
local Rodux = require(MyProject.Packages.Rodux)

-- 3. パッケージのメンバー
local createElement = Roact.createElement
local connect = Rodux.connect

-- 4. 同じプロジェクトのモジュール
local UI = MyProject.UI
local HealthBar = require(UI.HealthBar)
local ScoreBoard = require(UI.ScoreBoard)
```
ブロックの中でもアルファベット順を守ります。このルールはプロジェクトが小さいうちはそこまで気にしなくてOKですが、規模が大きくなったときに役立ちます。
### 練習問題
以下のコードにはファイル構造の間違いが **3つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local MAX_DAMAGE = 50
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local WeaponModule = require(ReplicatedStorage.WeaponModule)
local Players = game:GetService("Players")

local function dealDamage(target)
	local ShieldModule = require(ReplicatedStorage.ShieldModule)
	local shield = ShieldModule.getShield(target)
	local finalDamage = MAX_DAMAGE - shield
end

return dealDamage
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[File Structure](https://roblox.github.io/lua-style-guide/#file-structure)」「[Requires](https://roblox.github.io/lua-style-guide/#requires)」を参照してください。
次のレッスンは「レッスン5：関数の書き方」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの5回目です。

## レッスン5：関数の書き方
関数はコードの「部品」です。正しく宣言して正しく呼び出すことで、読みやすく安全なコードになります。このレッスンでは、関数の宣言と呼び出しに関するスタイルルールを学びます。
### セミコロンを使わない
関数の話に入る前に、1つ大事なルールを押さえましょう。Luaではセミコロン **;** を使いません。セミコロンは「1行に複数の文を書く」ためのものですが、レッスン2で学んだ通り、1行に1つの文だけ書くルールなので、そもそも不要です。
```lua
✅ 良い例
local x = 1
local y = 2
```
```lua
❌ 悪い例
local x = 1;
local y = 2;
```
### ルール1：引数は少なくする
関数の引数は**できるだけ1〜2個**に抑えます。引数が多い関数は、何を渡せばいいか分かりにくく、間違いの原因になります。
### ルール2：関数呼び出しには必ず括弧を使う
Luaでは引数が文字列1つやテーブル1つのとき、括弧を省略できます。しかしスタイルガイドでは**常に括弧を使う**と定められています。
### ルール3：名前付き関数はfunction-prefix構文で宣言する
関数を宣言する方法はいくつかありますが、スタイルガイドでは**function-prefix構文**を使います。また、メンバー関数でない場合は必ず **local** をつけます。
```lua
-- ✅ これはOK（例外パターン）
local doSomething

if IS_SERVER then
	function doSomething()
		-- サーバー版の処理
	end
else
	function doSomething()
		-- クライアント版の処理
	end
end
```
### ルール4：テーブル内の関数も function-prefix構文で宣言する
テーブル（クラス）に関数を追加するときも、変数に代入するスタイルではなく、function-prefix構文を使います。
```lua
✅ 良い例
function Frobulator.new()
	return {}
end

function Frobulator:frob()
	print("Frobbing", self)
end
```
```lua
❌ 悪い例
Frobulator.jarp = function()
	return {}
end
```
### ドット . とコロン : の使い分け
テーブル内の関数では、**.**（ドット）と **:**（コロン）を正しく使い分けます。
**ドット **. → 通常の関数。**self** は自動で渡されない。コンストラクタ（**.new()**）などに使う。
**コロン **: → メソッド。呼び出し時に **self** が自動で渡される。インスタンスの操作に使う。
```lua
local Enemy = {}

-- ドット：新しいインスタンスを作る（selfは不要）
function Enemy.new(name)
	local self = {
		name = name,
		health = 100,
	}
	return self
end

-- コロン：インスタンスを操作する（selfが自動で渡される）
function Enemy:takeDamage(amount)
	self.health = self.health - amount
	print(self.name .. " took " .. amount .. " damage!")
end

-- 使い方
local goblin = Enemy.new("Goblin")  -- ドットで呼ぶ
goblin:takeDamage(30)                -- コロンで呼ぶ
```
### まとめ：5つのルール
1. セミコロン **;** を使わない
2. 引数はできるだけ1〜2個に抑える
3. 関数呼び出しには必ず括弧を使う
4. 名前付き関数は **local function 名前()** で宣言する
5. テーブル内の関数も function-prefix構文で宣言し、**.** と **:** を使い分ける
### 練習問題
以下のコードにはスタイルの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local MathHelper = {}

MathHelper.add = function(a, b)
	return a + b;
end

function multiply(a, b)
	return a * b
end

function MathHelper:getMax(a, b, c, d, e)
	local result = math.max(a, b, c, d, e)
	return result
end

local message = print "Hello World"

return MathHelper
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Functions](https://roblox.github.io/lua-style-guide/#functions)」を参照してください。
次のレッスンは「レッスン6：テーブルの書き方」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの6回目です。

## レッスン6：テーブルの書き方
Luaのテーブルは、他の言語でいう「配列」と「辞書」の両方の役割を持つ万能なデータ構造です。このレッスンでは、テーブルを「読みやすく」「安全に」書くためのスタイルルールを学びます。
### 2種類のテーブル
Luaのテーブルには大きく分けて2種類あります。
#### リスト的テーブル（配列のようなもの）
番号付きの要素が並んだテーブルです。
```lua
local fruits = {"Apple", "Banana", "Cherry"}
local scores = {100, 85, 92, 78}
```
#### 辞書的テーブル（キーと値のペア）
名前付きのキーで値を管理するテーブルです。
```lua
local player = {
	name = "Taro",
	health = 100,
	isAlive = true,
}
```
### ルール1：リスト的と辞書的を混ぜない
1つのテーブルにリスト的な要素と辞書的なキーを混ぜてはいけません。混在テーブルはループ処理が難しくなり、バグの原因になります。
```lua
✅ 良い例：リスト的テーブル
local colors = {"Red", "Blue", "Green"}

✅ 良い例：辞書的テーブル
local config = {
	difficulty = "Hard",
	maxPlayers = 10,
}
```
```lua
❌ 悪い例：リストと辞書が混在
local mixed = {
	"Apple",
	"Banana",
	color = "Red",
	count = 5,
}
```
### ルール2：ipairsとpairsを使い分ける
テーブルをループするとき、種類に応じて正しい関数を使います。
ipairs → リスト的テーブル用（番号順に処理）
pairs → 辞書的テーブル用（キーと値のペアを処理）
```lua
✅ 良い例：リストにはipairs
local weapons = {"Sword", "Bow", "Staff"}
for index, weapon in ipairs(weapons) do
	print(index, weapon)
end

✅ 良い例：辞書にはpairs
local stats = {
	health = 100,
	speed = 16,
}
for key, value in pairs(stats) do
	print(key, value)
end
```
使い分けることで、コードを読んだときに「このテーブルはリストだ」「これは辞書だ」とすぐに分かります。
### ルール3：複数行テーブルでは末尾カンマを付ける
テーブルを複数行に展開したとき、最後の要素の後にもカンマを付けます。これを「末尾カンマ（トレイリングカンマ）」と呼びます。
```lua
✅ 良い例：末尾カンマあり
local settings = {
	difficulty = "Hard",
	maxPlayers = 10,
	allowPvp = true,  -- ← 最後の要素にもカンマ
}
```
```lua
❌ 悪い例：末尾カンマなし
local settings = {
	difficulty = "Hard",
	maxPlayers = 10,
	allowPvp = true  -- ← カンマがない
}
```
末尾カンマを付ける理由は2つあります。新しい要素を追加するとき、前の行にカンマを付け忘れる心配がない。そして、要素を並べ替えたときの差分（diff）がきれいになります。
**注意：** 1行に収まる短いテーブルでは、末尾カンマは省略できます。
```lua
-- これはOK（1行なので末尾カンマなしでも良い）
local position = {x = 10, y = 20}
```
### ルール4：辞書的テーブルは要素が多ければ複数行に展開する
キーが2、3個を超える辞書的テーブルは、複数行に展開します。短いテーブルは1行でOKです。
```lua
✅ 良い例：キーが少ないので1行でOK
local point = {x = 10, y = 20}

✅ 良い例：キーが多いので複数行に展開
local player = {
	name = "Taro",
	health = 100,
	speed = 16,
	isAlive = true,
}
```
```lua
❌ 悪い例：キーが多いのに1行に詰め込んでいる
local player = {name = "Taro", health = 100, speed = 16, isAlive = true}
```
### ルール5：波括弧は開始行と同じ行に置く
テーブルの **{** を次の行に置いてはいけません。必ず **=** や関数呼び出しと同じ行に書きます。
```lua
✅ 良い例：同じ行に波括弧
local config = {
	difficulty = "Hard",
	maxPlayers = 10,
}

spawn({
	name = "Goblin",
	health = 50,
})
```
```lua
❌ 悪い例：波括弧を次の行に置いている
local config =
{
	difficulty = "Hard",
	maxPlayers = 10,
}

spawn(
{
	name = "Goblin",
	health = 50,
})
```
### ルール6：文字列にはダブルクォートを使う
テーブル内の文字列に限らず、文字列は常にダブルクォート **"** を使います。シングルクォート **'** だと、英語のアポストロフィ（**'**）をエスケープする必要があります。また、空文字列が **""** のほうが **''** より見分けやすいという理由もあります。
```lua
✅ 良い例
local name = "Taro"
local message = "Here's a message!"
```
```lua
❌ 悪い例
local name = 'Taro'
local message = 'Here\'s a message!'
```
**例外：** 文字列の中にダブルクォートが含まれる場合は、シングルクォートを使ってOKです。
```lua
-- これはOK（例外）
local quote = 'He said "Hello!"'
```
### まとめ：6つのルール
1. リスト的と辞書的を混ぜない
2. リストには **ipairs**、辞書には **pairs** を使う
3. 複数行テーブルでは末尾カンマを付ける
4. 辞書的テーブルは要素が多ければ複数行に展開する
5. 波括弧 **{** は開始行と同じ行に置く
6. 文字列にはダブルクォート **"** を使う
### 練習問題
以下のコードにはスタイルの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local enemies = {"Goblin", "Slime", type = "monster", count = 3}

local shopItems =
{
	{name = 'Sword', price = 100, damage = 25},
	{name = 'Shield', price = 80, defense = 15}
}

for index, item in pairs(shopItems) do
	print(index, item.name)
end
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Literals](https://roblox.github.io/lua-style-guide/#literals)」「[Tables](https://roblox.github.io/lua-style-guide/#tables)」を参照してください。
次のレッスンは「レッスン7：if文と条件式」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの7回目です。

## レッスン7：if文と条件式
if文はLuaで最もよく使う構文の1つです。このレッスンでは、if文と条件式（if-then-else式）の正しい書き方を学びます。
### ルール1：条件に括弧を付けない
C言語やJavaなどの言語では条件に **()** が必要ですが、Luaでは不要です。これは **if**、**while**、**repeat** すべてに当てはまります。
```lua
✅ 良い例
if health <= 0 then
	respawnPlayer()
end

while isGameRunning do
	update()
end
```
```lua
❌ 悪い例：括弧が不要
if (health <= 0) then
	respawnPlayer()
end

while (isGameRunning) do
	update()
end
```
### ルール2：if文の本体を別の行に書く
if文の本体が **return** と1つだけでも、必ず別の行に書きます。後からログを追加したり、条件を変更したりするときに便利です。
```lua
✅ 良い例
if valueIsInvalid then
	return
end
```
```lua
❌ 悪い例：1行にまとめている
if valueIsInvalid then return end
```
### ルール3：and/or の代わりに if-then-else 式を使う
Luauには値を選ぶための **if-then-else** 式があります。古い書き方の **x and y or z** パターンより安全で読みやすいです。
```lua
✅ 良い例：if-then-else 式
local scale = if someFlag() then 1 else 2
```
```lua
❌ 悪い例：and/or パターン
local scale = someFlag() and 1 or 2
```
**なぜ危険？** **and/or** パターンでは、中間の値が **false** や **nil** のときに予想外の結果になります。
```lua
-- and/or の危険な例
local value = true and false or "default"
-- 期待: false（条件がtrueなので）
-- 実際: "default"（falseが偽と判定される）

-- if-then-else 式なら安全
local value = if true then false else "default"
-- 結果: false（正しい）
```
### ルール4：長い条件は専用のブロックで書く
条件が長くなる場合、条件をインデントした専用ブロックに書き、**then** を別の行に置きます。これにより、条件と本体が明確に分かれます。
```lua
✅ 良い例：条件とthenを分ける
if
	someReallyLongCondition
	and someOtherReallyLongCondition
	and somethingElse
then
	doSomething()
	doSomethingElse()
end
```
```lua
❌ 悪い例：条件と本体の境界が曖昧
if someReallyLongCondition and someOtherReallyLongCondition
	and somethingElse then
	doSomething()
	doSomethingElse()
end
```
悪い例では **then** が条件の行にくっついていて、条件がどこまでで本体がどこからかが分かりにくいです。
### ルール5：複数行の if-then-else 式の詳細
ルール3で学んだ **if-then-else** 式は、1行に収まるときが一番読みやすいです。でも長くなったときはどうすればよいでしょうか？
#### 複数行になる場合は then と else を行頭に置く
```lua
✅ 良い例：thenとelseが行頭
local scale = if someReallyLongFlagName() or someOtherFlag()
	then 1
	else 2
```
```lua
❌ 悪い例：thenが条件と同じ行
local scale = if someReallyLongFlagName() or someOtherFlag() then 1
	else 2
```
#### 3行に収まらないなら普通の if 文にする
**if** 式が3行（条件 + then + else）を超えるほど複雑なら、無理に1つの式にしないで、普通の **if** 文に切り替えます。
```lua
✅ 良い例：複雑な場合は普通のif文
local scale
if someReallyLongFlagName() or someOtherReallyLongFlagName() then
	scale = Vector2.new(1, 1) + someOffset
else
	scale = Vector2.new(1, 1) + otherOffset
end
```
#### 長い条件はヘルパー変数にする
**if** 式の条件部分が長すぎる場合は、先に変数に入れておくと読みやすくなります。
```lua
✅ 良い例：ヘルパー変数を使う
local useNewScale = someReallyReallyLongFunctionName()
	and someOtherReallyLongFunctionName()
local scale = if useNewScale then 1 else 2
```
```lua
❌ 悪い例：条件が長すぎる
local scale = if someReallyReallyLongFunctionName()
	and someOtherReallyLongFunctionName()
	then 1
	else 2
```
### ルール6：do ブロックでスコープを限定する
Luaには **do ... end** というブロックがあります。これを使うと、変数の「見える範囲」（スコープ）を制限できます。変数を外から触れないようにしたいときに便利です。
```lua
✅ 良い例：doブロックでlastIdを隠す
local getId
do
	local lastId = 0
	getId = function()
		lastId = lastId + 1
		return lastId
	end
end

-- getId() は使えるが、lastId は外から見えない
print(getId())  -- 1
print(getId())  -- 2
print(lastId)   -- エラー！ lastId はスコープ外
```
**do** ブロックの中で宣言した **lastId** は、ブロックの外からはアクセスできません。これにより、他のコードが誤って **lastId** を変更してしまうのを防げます。初心者のうちはあまり使う機会はありませんが、「こういう書き方がある」と知っておくと、他の人のコードを読むときに役立ちます。
### まとめ：6つのルール
1. 条件に括弧 **()** を付けない
2. if文の本体は別の行に書く（**return** だけでも）
3. **and/or** の代わりに **if-then-else** 式を使う
4. 長い条件は専用ブロックに書き、**then** を別の行に置く
5. 複数行 **if-then-else** 式は3行以内。超えたら普通の **if** 文にする
6. **do** ブロックで変数のスコープを制限できる
### 練習問題
以下のコードにはスタイル間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local function processPlayer(player)
	if (not player) then return end

	local isVIP = player:IsInGroup(123)
	local hasPass = player:HasGamePass(456)

	local bonus = isVIP and 2 or 1

	if player.leaderstats and player.leaderstats.Level
		and player.leaderstats.Level.Value >= 10
		and isVIP then
		giveSpecialReward(player)
	end

	while (bonus > 0) do
		applyBonus(player)
		bonus = bonus - 1
	end
end
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[if-then-else expressions](https://roblox.github.io/lua-style-guide/#if-then-else-expressions)」「[Blocks](https://roblox.github.io/lua-style-guide/#blocks)」を参照してください。
次のレッスンは「レッスン8：長い式の改行ルール」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの8回目です。

## レッスン8：長い式の改行ルール
コードが長くなると、どこで改行するかが重要になります。適当に改行するとかえって読みにくくなります。このレッスンでは、長い式をきれいに改行するルールを学びます。
### なぜ改行のルールが大切？
基本原則の「コードは読む人のために書く」を思い出してください。長い行は横スクロールが必要で読みにくいですし、「差分（diff）がきれいに出るか」も大事なポイントです。要素を行間で移動しない改行のほうが、レビュー時に変更点がひと目で分かります。
### ルール1：まず式を分割できないか考える
長い式に出会ったら、最初に「式を小さく分けられないか？」を考えます。一時変数に分けるだけで、改行が不要になることも多いです。
```lua
❌ 悪い例：1行が長すぎる
local finalDamage = baseDamage * criticalMultiplier + bonusDamage - targetDefense * defenseMultiplier
```
```lua
✅ 良い例：一時変数で分割
local attackPower = baseDamage * criticalMultiplier + bonusDamage
local defensePower = targetDefense * defenseMultiplier
local finalDamage = attackPower - defensePower
```
### ルール2：演算子は新しい行の先頭に置く
式を改行するときは、**and**、**or**、**+** などの演算子を**新しい行の先頭**に置きます。こうすると、行頭を見るだけで「あ、前の行の続きだ」とすぐに分かります。
```lua
✅ 良い例：演算子が行頭
local totalScore = baseScore
	+ bonusScore
	+ comboScore
	- penaltyScore
```
```lua
❌ 悪い例：演算子が行末
local totalScore = baseScore +
	bonusScore +
	comboScore -
	penaltyScore
```
行末に演算子があると、その行だけ見たときに「完結した式」なのか「まだ続きがあるのか」が分かりません。行頭に演算子があれば、「続きだ」ということが明白です。
これは条件式でも同じです。レッスン7で学んだ長い条件の書き方を思い出してください。
```lua
✅ 良い例：and/or も行頭
if
	player.IsAlive
	and player.Health > 0
	and not player.IsInSafeZone
then
	applyDamage(player)
end
```
### ルール3：テーブルの複数行展開
レッスン6で学んだテーブルのルールに加えて、関数の引数にテーブルを渡す場合の改行ルールを見てみましょう。
#### ネストが深いテーブルはすべて展開する
関数に複数のテーブルを渡すときは、すべてのテーブルを展開します。これが一番差分がきれいになります。
```lua
✅ 良い例：すべてのテーブルを展開
local enemies = {
	{
		name = "Goblin",
		health = 50,
		damage = 10,
	},
	{
		name = "Dragon",
		health = 500,
		damage = 100,
	},
}
```
#### 関数にテーブルを渡すとき
関数引数にテーブルが混ざるときは、それぞれを展開します。
```lua
✅ 良い例：引数がテーブルと非テーブルの混合
spawnEnemy(
	{
		name = "Goblin",
		health = 50,
	},
	Vector3.new(10, 0, 20),
	{
		name = "Dragon",
		health = 500,
	}
)
```
```lua
❌ 悪い例：展開が中途半端
spawnEnemy({
	name = "Goblin",
	health = 50,
}, Vector3.new(10, 0, 20), {
	name = "Dragon",
	health = 500,
})
```
悪い例では、引数の境界がどこなのかが分かりにくくなっています。
#### リスト的テーブルの改行
リスト的テーブルは、意味のあるまとまりでグループ化してもOKです。もちろん、1行に収まるならそのままで大丈夫です。
```lua
✅ 良い例：短いリストは1行でOK
local fruits = {"Apple", "Banana", "Cherry"}

✅ 良い例：改行で展開（diffがきれい）
local weapons = {
	"Sword",
	"Bow",
	"Staff",
	"Wand",
}

✅ 良い例：意味あるグループ分け
local inputs = {
	"W", "A", "S", "D",
	"Space", "Shift",
}
```
### まとめ：3つのルール
1. まず式を分割（一時変数）できないか考える
2. 演算子は新しい行の先頭に置く
3. 関数引数のテーブルはすべて展開する
### 練習問題
以下のコードにはスタイルの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local totalDamage = baseDamage +
	criticalBonus +
	elementalBonus -
	targetDefense

local result = calculateReward(player, {difficulty = "Hard",
	multiplier = 2, bonus = 100}, Vector3.new(0, 10, 0))

local dropTable = name = "Sword", chance = 0.5, damage = 25, element = "Fire"}, {name = "Shield", chance = 0.3, defense = 15, element = "Ice"

if player.IsAlive and player.Health > 0 and
	not player.IsInSafeZone and player.Level >= 10 then
	startBattle(player)
end
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Newlines in Long Expressions](https://roblox.github.io/lua-style-guide/#newlines-in-long-expressions)」を参照してください。
次のレッスンは「レッスン9：メタテーブルとクラス」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの9回目です。

## レッスン9：メタテーブルとクラス
メタテーブルはLuaの強力な機能ですが、スタイルガイドでは「魔法のようなコード」として注意が必要とされています。このレッスンでは、メタテーブルの「使っていい場面」と「正しい書き方」を学びます。
### なぜ注意が必要？
スタイルガイドの基本原則に「**魔法を避けよ**」というものがあります。メタテーブルはまさにその代表例です。うまく動いているときは便利ですが、何か問題が起きたとき、原因が分かりにくくなります。
だからこそ、Robloxでは**メタテーブルの使い方を2つに限定**しています。
1. **プロトタイプベースのクラス**を作る
2. **タイプミスを防ぐガード**をかける
この2つ以外の用途では、メタテーブルを使わないのが原則です。
### 使い方1：クラスを作る
Robloxのスタイルガイドが推奨するクラスの書き方を、ステップごとに見ていきましょう。
#### ステップ1：空のテーブルを作る
クラスの本体となるテーブルを用意します。
```lua
local Enemy = {}
```
#### ステップ2：__index を自分自身に設定する
これがメタテーブルの「おまじない」です。インスタンス（後で作る）に存在しないキーが呼ばれたとき、**Enemy** テーブルを探しに行くようになります。
```lua
Enemy.__index = Enemy
```
#### ステップ3：型を定義する（Luau型注釈）
Luauの型システムを活用して、クラスの形を定義します。これにより、エディタが間違いを警告してくれます。
```lua
export type EnemyType = typeof(setmetatable(
	{} :: {
		name: string,
		health: number,
		_isAlive: boolean,
	},
	Enemy
))
```
#### ステップ4：コンストラクタ .new() を作る
インスタンスを生成する関数を作ります。コンストラクタは慣習で **.new()** という名前にします。ドット **.** を使います（コロン **:** ではない）。
```lua
function Enemy.new(name: string): EnemyType
	local self = {
		name = name,
		health = 100,
		_isAlive = true,
	}

	setmetatable(self, Enemy)

	return self
end
```
#### ステップ5：メソッドを追加する
スタイルガイドでは、型チェッカーが **self** の型を理解できるように、**ドット **.** 構文 + 明示的な **self** 引数**でメソッドを定義することを推奨しています。呼び出し側はコロン **:** で呼べます。
```lua
✅ 良い例：ドット + 明示的 self（型安全）
function Enemy.takeDamage(self: EnemyType, amount: number)
	self.health = self.health - amount
	if self.health <= 0 then
		self._isAlive = false
	end
end
```
```lua
❌ 悪い例：コロン構文（型チェッカーが self の型を推論できない）
function Enemy:takeDamage(amount: number)
	self.health = self.health - amount
end
```
**補足：** 将来のLuauでは、コロン構文でも **self** の型を自動推論できるようになる予定です。現時点ではドット構文が推奨されています。
#### ステップ6：使う
```lua
local goblin = Enemy.new("Goblin")
print(goblin.name)       -- "Goblin"
print(goblin.health)     -- 100

goblin:takeDamage(30)
print(goblin.health)     -- 70
```
#### 完成形のテンプレート
以下がクラスの全体像です。新しいクラスを作るときはこのテンプレートを基本にしましょう。
```lua
local Enemy = {}
Enemy.__index = Enemy

export type EnemyType = typeof(setmetatable(
	{} :: {
		name: string,
		health: number,
		_isAlive: boolean,
	},
	Enemy
))

function Enemy.new(name: string): EnemyType
	local self = {
		name = name,
		health = 100,
		_isAlive = true,
	}

	setmetatable(self, Enemy)

	return self
end

function Enemy.takeDamage(self: EnemyType, amount: number)
	self.health = self.health - amount
	if self.health <= 0 then
		self._isAlive = false
	end
end

function Enemy.isAlive(self: EnemyType): boolean
	return self._isAlive
end

return Enemy
```
### 使い方2：タイプミスを防ぐガード
Luaのテーブルは、存在しないキーにアクセスしても **nil** を返すだけでエラーになりません。これが原因で見つけにくいバグが発生します。
**__index** メタメソッドを使って、存在しないキーにアクセスしたときにエラーを投げるようにできます。Enum（列挙型）のようなテーブルに特に有効です。
```lua
✅ 良い例：タイプミスガード付きEnum
local WeaponType = {
	Sword = "Sword",
	Bow = "Bow",
	Staff = "Staff",
}

setmetatable(WeaponType, {
	__index = function(self, key)
		error(string.format("%q is not a valid member of WeaponType",
			tostring(key)), 2)
	end,
})

print(WeaponType.Sword)   -- "Sword"（正常動作）
print(WeaponType.Sward)   -- エラー！ タイプミスを即座に検出
```
**__index** はキーが**見つからないとき**だけ呼ばれるので、**Sword** や **Bow** は通常どおり返されます。しかし **Sward**（タイプミス）にアクセスするとエラーで教えてくれます。
### やってはいけないこと
上記2つ以外のメタテーブルの使い方は、スタイルガイドでは推奨されていません。たとえば以下のような使い方は避けましょう。
```lua
-- ❌ 避けるべき：演算子オーバーロード
local Vector = {}
Vector.__index = Vector

function Vector.__add(a, b)
	return Vector.new(a.x + b.x, a.y + b.y)
end
```
演算子オーバーロードは一見便利ですが、コードを読む人が「**+** が何をしているのか」を追いかけにくくなります。Roblox APIが提供する **Vector3** などはすでにこれをサポートしているので、自分で作る必要はほとんどありません。
### まとめ：4つのルール
1. メタテーブルは「クラス」と「タイプミスガード」にだけ使う
2. クラスは **MyClass.__index = MyClass** パターンで作る
3. メソッドはドット **.** + 明示的 **self** で定義する（型安全のため）
4. Enum的テーブルには **__index** でタイプミスガードをかける
### 練習問題
以下のコードにはスタイルの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local Pet = {}

function Pet.new(name, species)
	local self = {
		name = name,
		species = species,
		hunger = 0,
	}

	setmetatable(self, Pet)

	return self
end

function Pet:feed(amount)
	self.hunger = self.hunger - amount
	if self.hunger < 0 then
		self.hunger = 0
	end
end

function Pet.__tostring(self)
	return self.name .. " the " .. self.species
end

local PetType = {
	Dog = "Dog",
	Cat = "Cat",
}

local myPet = Pet.new("Pochi", PetType.Dgo)

return Pet
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Metatables](https://roblox.github.io/lua-style-guide/#metatables)」「[Prototype-based classes](https://roblox.github.io/lua-style-guide/#prototype-based-classes)」「[Guarding against typos](https://roblox.github.io/lua-style-guide/#guarding-against-typos)」を参照してください。
次のレッスンは「レッスン10：エラーハンドリング」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの10回目です。

## レッスン10：エラーハンドリング
ゲームの中では「データが読み込めない」「サーバーに接続できない」など、予想外のことが起こります。エラーハンドリングとは、そうしたトラブルが起きたときにゲームが止まらないようにする技術です。このレッスンでは、エラーの「正しい扱い方」を学びます。
### なぜエラーハンドリングが大切？
Robloxのゲームはネットワーク越しに動いています。プレイヤーのデータを保存するとき、外部APIを呼ぶとき、いつでも失敗する可能性があります。エラーハンドリングがないと、1人のプレイヤーのエラーでサーバー全体が止まることもあります。
スタイルガイドでは、エラーの扱い方について3つの明確なルールを定めています。
### ルール1：失敗する可能性がある関数は success, result を返す
関数が失敗する可能性があるとき、エラーを投げる（**error()**）のではなく、**成功したかどうか**と**結果**の2つの値を返します。
```lua
✅ 良い例：success, result パターン
local function loadPlayerData(player)
	local data = DataStore:GetAsync(player.UserId)
	if data then
		return true, data
	else
		return false, "データが見つかりませんでした"
	end
end

-- 使う側
local success, result = loadPlayerData(player)
if success then
	applyData(player, result)
else
	warn("データ読み込み失敗: " .. result)
end
```
```lua
❌ 悪い例：エラーを投げる
local function loadPlayerData(player)
	local data = DataStore:GetAsync(player.UserId)
	if not data then
		error("データが見つかりませんでした")
	end
	return data
end
```
悪い例では、呼び出し側が **error()** を予想していないと、ゲームがクラッシュします。**success, result** パターンなら、呼び出し側が安全に失敗を処理できます。
### ルール2：error() は「使い方の間違い」を知らせるときだけ使う
**error()** を使っていいのは、**関数の呼び出し方が間違っている**ときだけです。プログラマーのミス（引数の型が違う、必須の引数がないなど）を早めに発見するために使います。**assert** も同じ目的で使えます。
```lua
✅ 良い例：引数のバリデーションに error/assert を使う
local function setHealth(player, amount)
	assert(typeof(player) == "Instance", "playerはInstanceでなければなりません")
	assert(type(amount) == "number", "amountは数値でなければなりません")

	player.Health = amount
end
```
```lua
❌ 悪い例：通常の失敗に error を使う
local function findItem(inventory, itemName)
	for _, item in ipairs(inventory) do
		if item.name == itemName then
			return item
		end
	end
	error("アイテムが見つかりませんでした") -- これは「使い方の間違い」ではない
end
```
「アイテムが見つからない」のは通常起こりうることなので、**error()** ではなく **nil** や **false** を返すべきです。
### ルール3：エラーを投げる関数を呼ぶときは pcall で囲む
Roblox APIの中には **error()** を投げる関数があります（**DataStore:GetAsync()** など）。そうした関数を呼ぶときは、**pcall**（protected call）で囲んで、エラーをキャッチします。
**pcall** は関数を安全に実行し、成功したかどうかと結果を返します。形はルール1の **success, result** パターンと同じです。
```lua
✅ 良い例：pcall でエラーをキャッチ
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

local playerDataStore = DataStoreService:GetDataStore("PlayerData")

local function savePlayerData(player, data)
	-- GetAsync/SetAsync はネットワークエラーで error() を投げることがある
	local success, errorMessage = pcall(function()
		playerDataStore:SetAsync(player.UserId, data)
	end)

	if not success then
		warn("データ保存に失敗: " .. errorMessage)
	end

	return success
end
```
```lua
❌ 悪い例：pcall なしで直接呼ぶ
local function savePlayerData(player, data)
	playerDataStore:SetAsync(player.UserId, data)  -- ネットワークエラーでクラッシュ！
end
```
#### pcall を使うときのポイント
**pcall** を使うときは、**なぜ **pcall** が必要なのか**をコメントで書きます。どの関数がエラーを投げる可能性があるのかが分かるようにするためです。
```lua
✅ 良い例：pcall の理由をコメントで説明
-- SetAsync はネットワークエラーで error() を投げる可能性がある
local success, errorMessage = pcall(function()
	playerDataStore:SetAsync(key, value)
end)
```
### 3つのルールの使い分け
どのルールを使うべきか迷ったときは、この判断フローで考えましょう。
1. **その関数は失敗する可能性がある？** → **success, result** パターンで返す（ルール1）
2. **引数の使い方が間違っている？** → **error()** / **assert** で知らせる（ルール2）
3. **エラーを投げる外部関数を呼ぶ？** → **pcall** で囲む（ルール3）
### まとめ：3つのルール
1. 失敗する関数は **success, result** を返す ── 自分が書く関数で失敗がありうるとき
2. **error()** / **assert** は使い方の検証だけに使う ── 引数の型チェック、必須パラメータの確認
3. エラーを投げる関数は **pcall** で囲む ── DataStore, HttpService など外部API呼び出し
### 練習問題
以下のコードにはエラーハンドリングの間違いが **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local DataStoreService = game:GetService("DataStoreService")
local coinStore = DataStoreService:GetDataStore("Coins")

local function getPlayerCoins(player)
	local coins = coinStore:GetAsync(player.UserId)
	if not coins then
		error("コインデータが見つかりません")
	end
	return coins
end

local function addCoins(player, amount)
	local currentCoins = getPlayerCoins(player)
	local newCoins = currentCoins + amount

	pcall(function()
		coinStore:SetAsync(player.UserId, newCoins)
	end)

	return newCoins
end

local function transferCoins(fromPlayer, toPlayer, amount)
	local fromCoins = getPlayerCoins(fromPlayer)

	if fromCoins < amount then
		error("コインが足りません")
	end

	addCoins(fromPlayer, -amount)
	addCoins(toPlayer, amount)
end
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Lua Gotchas, Footguns and Other Hazards](https://roblox.github.io/lua-style-guide/gotchas/)」を参照してください。
次のレッスンは「レッスン11：Roblox固有のベストプラクティス」です。


Robloxが公式に公開している [**Roblox Lua Style Guide**](https://roblox.github.io/lua-style-guide/)の内容を分かりやすく解説するシリーズの11回目です。

## レッスン11：Roblox固有のベストプラクティス
ここまでのレッスンで、Luaの書き方のルールを一通り学んできました。最後のレッスンでは、Robloxエンジン特有の「やるべきこと」と「やってはいけないこと」を学びます。
### なぜRoblox固有のルールがある？
Robloxには、サービスシステム、モジュールシステム、非同期処理（Yield）など、Lua一般にはない独自の仕組みがあります。これらを正しく扱わないと、見つけにくいバグやパフォーマンス問題の原因になります。スタイルガイドでは、Roblox開発に特化した3つのルールを定めています。
### ルール1：サービスは必ず game:GetService() で取得する
Robloxのサービス（Players、ReplicatedStorageなど）を使うとき、必ず **game:GetService()** を使います。**game.Players** のようにドットでアクセスする書き方は使いません。
```lua
✅ 良い例：GetService で取得
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
```
```lua
❌ 悪い例：ドットアクセス
local Players = game.Players
local ReplicatedStorage = game.ReplicatedStorage
```
**なぜドットアクセスがダメ？** 理由は2つあります。
1つ目は、すべてのサービスがスクリプト起動時にデフォルトで使えるとは限らないことです。**GetService** を使えば、サービスが確実に取得できます。
2つ目は、サービスの内部名が表示名と異なる場合があることです。たとえば **RunService** の内部名は **"Run Service"**（スペースあり）です。**game.RunService** は動きますが、**GetService** を使うほうが明示的で安全です。
### ルール2：モジュールの変数名はモジュール名と一致させる
**require** でモジュールを読み込むとき、変数名はモジュールの名前と同じにします。省略したり別の名前をつけたりしてはいけません。
```lua
✅ 良い例：変数名 = モジュール名
local DamageCalculator = require(ReplicatedStorage.DamageCalculator)
local EffectsModule = require(ReplicatedStorage.EffectsModule)
local WeaponSystem = require(ReplicatedStorage.WeaponSystem)
```
```lua
❌ 悪い例：変数名がモジュール名と違う
local dmgCalc = require(ReplicatedStorage.DamageCalculator)
local fx = require(ReplicatedStorage.EffectsModule)
local ws = require(ReplicatedStorage.WeaponSystem)
```
変数名とモジュール名が一致していると、「この変数はどこから来たのか」がすぐに分かります。省略名を使うと、コードを読む人が **dmgCalc** の正体を探すために時間を無駄にします。
このルールは、レッスン1で学んだ「省略しない」ルールとも一致しています。
### ルール3：Yieldする関数をメインタスクで直接呼ばない
#### Yield（イールド）とは？
Robloxには、呼び出すと処理が「一時停止」する関数があります。これを「Yieldする関数」と呼びます。代表的なものは以下の通りです。
- **HttpService:GetAsync()** — サーバーからの応答を待つ
- **:WaitForChild()** — オブジェクトが作られるのを待つ
- **task.wait()** — 指定した時間だけ待つ
- **DataStore:GetAsync()** / **DataStore:SetAsync()** — データの読み書きを待つ
これらの関数を「メインタスク」（スクリプトのトップレベルで直接実行されるコード）で呼ぶと、スクリプト全体が止まってしまいます。
#### なぜ危険？
スクリプトのトップレベルでYieldすると、その間にほかのコードが実行され、予期しないタイミングでデータが変わる「データ競合」が起きる可能性があります。また、Yieldした関数が失敗すると、それ以降の初期化コードがすべて実行されなくなります。
```lua
❌ 悪い例：メインタスク（トップレベル）でYield
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

-- ↓ ここでスクリプトが止まる。応答が返るまで下のコードは実行されない
local data = HttpService:GetAsync("https://api.example.com/config")

local MAX_PLAYERS = data.maxPlayers

Players.PlayerAdded:Connect(function(player)
	print(player.Name .. " joined!")
end)
-- ↑ GetAsyncが完了するまでPlayerAddedが接続されないので、
-- その間に入ってきたプレイヤーを見逃す！
```
#### 正しい書き方
Yieldする処理は **task.spawn** で別タスクに分離します。こうすれば、メインタスクはYieldに邪魔されず、残りのコードを実行できます。
```lua
✅ 良い例：task.spawn で別タスクに分離
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local serverConfig = nil

-- Yieldする処理を別タスクで実行
task.spawn(function()
	local success, result = pcall(function()
		return HttpService:GetAsync("https://api.example.com/config")
	end)

	if success then
		serverConfig = result
	end
end)

-- ↓ すぐに実行される（Yieldの完了を待たない）
Players.PlayerAdded:Connect(function(player)
	print(player.Name .. " joined!")
end)
```
#### task.spawn と task.defer の使い分け
task.spawn → 渡した関数を**すぐに**実行開始する。Yieldするまで同期的に進む。
task.defer → 渡した関数を**次のフレーム**に実行する。現在のコードをすべて実行してから動く。
```lua
-- task.spawn：すぐに実行開始
task.spawn(function()
	print("A")  -- すぐに出力される
	task.wait(1)
	print("B")  -- 1秒後に出力される
end)
print("C")  -- "A" の後、"B" の前に出力される
-- 出力順：A → C → B

-- task.defer：次のフレームで実行
task.defer(function()
	print("A")  -- 次のフレームで出力される
end)
print("C")  -- 先に出力される
-- 出力順：C → A
```
どちらを使うか迷ったときは **task.spawn** を選べばOKです。
#### 発展：Promise パターン
スタイルガイドでは、Yieldする処理に **Promise**（プロミス）という仕組みを使うことも推奨されています。Promiseは「将来結果が返ってくる約束」を表すオブジェクトで、非同期処理の成功・失敗をきれいに書ける利点があります。Robloxではコミュニティ製の「[Promise](https://eryn.io/roblox-lua-promise/)」ライブラリが広く使われています。初心者のうちは **task.spawn** で十分ですが、「こういうものがある」と覚えておくと、今後他の人のコードを読むときに役立ちます。
### まとめ：3つのルール
1. サービスは **game:GetService()** で取得する ── 確実にサービスを取得でき、内部名の違いにも対応できる
2. モジュールの変数名はモジュール名と一致させる ── コードを読む人がモジュールの出どころをすぐ把握できる
3. Yieldする関数をメインタスクで直接呼ばない ── スクリプトの初期化が止まり、データ競合やイベント見逃しが起きる
### 練習問題
以下のコードにはRoblox固有のベストプラクティス違反が **4つ** あります。それぞれ見つけて、なぜ悪いのか理由も考えてみましょう。

この練習問題は、ユーザーが入力した内容をAIが添削してくれるWebアプリで解けます。
Webアプリはこちら: [https://study.robgym.jp/lua-style/](https://study.robgym.jp/lua-style/)
```lua
local Players = game.Players
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

local ws = require(ReplicatedStorage.WeaponSystem)

local API_URL = "https://api.example.com/config"

-- サーバー起動時に設定データを取得する
local configData = HttpService:GetAsync(API_URL)

local MAX_WEAPONS = configData.maxWeapons

local function equipWeapon(player, weaponName)
	local weapon = ws.create(weaponName)
	weapon.Parent = player.Character
end

local shopGui = ReplicatedStorage:WaitForChild("ShopGui")

Players.PlayerAdded:Connect(function(player)
	local weapon = ws.getDefault(player)
	equipWeapon(player, weapon)
end)
```

### おわりに
このレッスンの内容詳細（英語）を知りたいときは「[Yielding](https://roblox.github.io/lua-style-guide/#yielding)」を参照してください。
次のレッスンはありません。ここまでで全11レッスン完了です。

🎉 **おつかれさまでした！** これで全11レッスンのカリキュラムが完了です。ここで学んだルールを実際のコードで使いながら、少しずつ体に染み込ませていきましょう。
