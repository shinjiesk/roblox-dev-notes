本ドキュメントは、Robloxゲームのサーバーサイドおよびサーバー・クライアント間通信におけるパフォーマンス最適化手法を、公式ドキュメント・DevForum・Luau公式サイトに基づいて事実ベースで整理したものである。マップ・プロップ制作によるクライアント側描画負荷の最適化は `client-performance.md` を参照のこと。

ドキュメント末尾にはアンチパターン集（セクション9）・作業チェックリスト（セクション10）・参考情報源（セクション11）をまとめている。

---

# 1. 負荷の種類（サーバー視点）

サーバー側の負荷は、大きく以下の4つに分類できる。各項目の詳しい確認方法・目標値・対策は後続セクションで解説する。

**サーバーCPU負荷（スクリプト・物理）** — Luauスクリプトの実行時間と物理演算の計算コスト。サーバーのフレームレート（Heartbeat）は上限60FPSであり、1フレームあたり約16.7msの予算がある。スクリプトや物理がこれを超えるとサーバーのフレームレートが低下し、全プレイヤーに影響する。

**サーバーメモリ** — Luaヒープ（スクリプトが確保するテーブル・文字列等）、インスタンスツリー（Part・Model・Script等）、物理データが消費する。プレイヤー数に応じて増加し、上限を超えるとサーバーがクラッシュする。

**ネットワーク帯域（レプリケーション・RemoteEvent）** — サーバーとクライアント間のデータ転送量。プロパティ変更のレプリケーション、物理オブジェクトの状態同期、RemoteEventのペイロードがすべて帯域を消費する。クライアントの受信帯域は50KB/sが上限であり、超過すると物理更新がスロットルされる。

**DataStoreスループット** — 永続データの読み書きにはリクエスト予算とスループット制限がある。制限を超えるとリクエストがキューイングされ、応答遅延やデータロスのリスクが生じる。

---

# 2. Luauスクリプティングの最適化

## 確認方法と目標値

**何を見るか:** MicroProfilerのサーバーダンプ（Developer Console → MicroProfiler → Server タブ）で、スクリプト関連のスコープを確認する。

| MicroProfilerスコープ | 意味 |
|---|---|
| `RunService.PostSimulation` / `RunService.Heartbeat` | Heartbeatイベント上のコード |
| `RunService.PreSimulation` | Steppedイベント上のコード |

**目標値:** サーバーのHeartbeatが60FPS（約16.7ms/フレーム）を維持していること。Developer Console の Server Jobs タブで Heartbeat 行の Steps Per Sec を確認し、60を大きく下回っている場合はスクリプトまたは物理の最適化が必要である。

## 2-1. ローカル変数とキャッシュの活用

グローバルテーブルやサービスへのアクセスは、ローカル変数にキャッシュすることでルックアップコストを削減できる。

```lua
-- BAD: ループ内で毎回グローバルアクセス
for i = 1, 1000 do
    local dist = (part.Position - game.Workspace.SpawnLocation.Position).Magnitude
end

-- GOOD: ループ外でキャッシュ
local spawnPos = workspace.SpawnLocation.Position
for i = 1, 1000 do
    local dist = (part.Position - spawnPos).Magnitude
end
```

`GetService` の結果もスクリプト冒頭でローカル変数に格納する。

```lua
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
```

## 2-2. RunServiceイベントの使い分け

サーバー側で使用するRunServiceイベントは以下の2つである。

| イベント | タイミング | 用途 |
|---|---|---|
| `Stepped` / `PreSimulation` | 物理ステップの前 | 物理に影響を与える処理（力の適用など） |
| `Heartbeat` / `PostSimulation` | 物理ステップの後 | 一般的なフレーム更新処理 |

**`RenderStepped` / `PreRender` はサーバーでは使用できない**（クライアント専用）。サーバースクリプトで接続するとエラーになる。

## 2-3. 処理のフレーム分割

大量のオブジェクトに対する処理を1フレームで行うと、そのフレームのサーバーHeartbeatが停止する。`task.wait()` を挟んで複数フレームに分散させる。

```lua
local items = CollectionService:GetTagged("ProcessMe")

local BATCH_SIZE = 50
for i = 1, #items, BATCH_SIZE do
    for j = i, math.min(i + BATCH_SIZE - 1, #items) do
        processItem(items[j])
    end
    task.wait()
end
```

## 2-4. スロットリング（更新頻度の間引き）

毎フレーム（60回/秒）実行する必要のない処理は、間隔を空けて実行する。

```lua
local UPDATE_INTERVAL = 0.2  -- 5回/秒
local elapsed = 0

RunService.Heartbeat:Connect(function(dt)
    elapsed += dt
    if elapsed < UPDATE_INTERVAL then return end
    elapsed -= UPDATE_INTERVAL

    -- 5回/秒で十分な処理をここに書く
end)
```

AIの意思決定、リーダーボード更新、範囲検索など、毎フレーム実行しても結果がほぼ変わらない処理はすべてスロットリングの候補である。

## 2-5. 数学の最適化

**Magnitude の二乗比較:** 距離を比較するだけであれば平方根計算を省略できる。

```lua
-- BAD: 平方根を計算してから比較
if (posA - posB).Magnitude < 50 then

-- GOOD: 二乗同士で比較（平方根なし）
if (posA - posB).Magnitude ^ 2 < 50 * 50 then
```

Luauでは `Magnitude` プロパティは内部でsqrtを計算する。大量のオブジェクトに対する距離チェックでは二乗比較が有効である。

## 2-6. `--!native` ネイティブコード生成

スクリプト先頭に `--!native` を記述すると、LuauがネイティブCPUコードにコンパイルされ、数値計算やバッファ操作が多いスクリプトで顕著な高速化が得られる。

```lua
--!native

local function heavyComputation(data: {number}): number
    local sum = 0
    for _, v in data do
        sum += v * v
    end
    return sum
end
```

関数単位で適用する場合は `@native` アトリビュートを使う。

```lua
@native
local function fastFunction(v: Vector3): number
    return v.X + v.Y + v.Z
end
```

**制限事項:**
- コンパイル時間とメモリ消費が増加する
- 体験あたりのネイティブコード総量に上限がある
- 1関数あたり64K命令、1スクリプトあたり100万命令が上限
- 型注釈（特にVector3等）を付けるとより効果的に最適化される

**向いている処理:** 数値計算、bufferライブラリ操作、大量ループ
**向いていない処理:** Instance操作が主体のスクリプト（API呼び出しのオーバーヘッドが支配的なため）

## 2-7. Parallel Luau

Actorインスタンスの子孫にスクリプトを配置し、`task.desynchronize()` / `task.synchronize()` で並列・直列フェーズを切り替えることで、複数CPUコアを活用できる。

```lua
-- Actor 配下のスクリプト
local RunService = game:GetService("RunService")

RunService.Heartbeat:ConnectParallel(function()
    -- 並列フェーズ: 読み取り専用の計算（Instance変更不可）
    local result = expensiveCalculation()

    task.synchronize()

    -- 直列フェーズ: Instance の変更はここで行う
    part.Position = result
end)
```

**制約:**
- 並列フェーズでは `Instance` のプロパティ変更やインスタンス生成ができない
- 並列フェーズでは `require()` が使用できない（事前に直列で require しておく）
- APIのスレッドセーフティはAPIリファレンスのタグで確認する（未指定はUnsafe）

**向いている処理:** 大量NPCのAI計算、空間検索、レイキャストの並列実行

## 2-8. taskライブラリの使用

非推奨のグローバル関数 `wait()` / `spawn()` / `delay()` はスロットリングや不正確な再開タイミングの問題がある。`task` ライブラリに置き換える。

| 非推奨 | 置き換え先 | 違い |
|---|---|---|
| `wait(n)` | `task.wait(n)` | スロットルされない。期限到来の最初のHeartbeatで再開 |
| `spawn(f)` | `task.spawn(f)` | 即座に実行開始（遅延なし） |
| `delay(n, f)` | `task.delay(n, f)` | スロットルされない。期限到来のHeartbeatで実行 |
| — | `task.defer(f)` | 現在のフレームの残りの処理を終えてから実行 |
| — | `task.cancel(thread)` | スレッドの取り消し |

---

# 3. RemoteEvent / RemoteFunctionの最適化

## 確認方法と目標値

**何を見るか:** `client-performance.md` セクション10-5のRecv欄（Stats詳細: Ctrl+Alt+F7）で帯域を確認する。MicroProfilerのネットワークダンプ（verbosity: High）でRemoteEventのトラフィック内訳を確認できる。

**目標値:** クライアントのRecv 50KB/s以下（40KB/s以下が推奨）。

## 3-1. スロットリング制限

クライアントからサーバーへの `FireServer()` は、**RemoteEvent・UnreliableRemoteEvent それぞれ約500回/秒/クライアント**の制限がある。同じ型のリモート間で共有される。超過した呼び出しはドロップされる。

サーバーからクライアントへの `FireClient()` / `FireAllClients()` にも同様の制限がある。

## 3-2. ペイロードサイズ

公式ドキュメントでは通常の RemoteEvent のペイロードサイズ上限は明記されていないが、送信データ量はそのまま帯域消費に直結する。

**UnreliableRemoteEvent** はペイロードが **1,000バイトを超えるとドロップ**される。Studioではドロップ時にOutputに超過バイト数が表示される。

**型別のシリアライズサイズ（概算）:**

データ型ごとのワイヤ上のサイズは公式に数値表が公開されていないが、一般的に以下の傾向がある。

| データ型 | 概算サイズ |
|---|---|
| boolean | 2 バイト程度 |
| number（double） | 9 バイト程度 |
| string | 長さ + 2〜4 バイト（長さヘッダ） |
| Vector3 | 13 バイト程度 |
| CFrame | 14〜20 バイト程度（回転の表現方法で変動） |
| Instance参照 | 数バイト（内部ID） |
| テーブル | キー・値の合計 + オーバーヘッド |

UnreliableRemoteEvent の 1,000バイト制限に収めるには、データ型の選択とペイロードの最小化が重要である。

## 3-3. UnreliableRemoteEvent の活用

`UnreliableRemoteEvent` はUDPベースで、パケットの到達保証と順序保証がない代わりに低レイテンシで送信できる。

**向いている用途:**
- プレイヤーの位置・回転の高頻度同期（毎フレーム送信）
- ダメージ数字やヒットエフェクトなどの演出指示
- 1〜2フレーム後に新しいデータで上書きされるような短命データ

**向いていない用途:**
- 購入・トレード・セーブなど確実に届く必要があるデータ
- 順序が重要なチャットメッセージやキュー操作

```lua
-- サーバー: 全プレイヤーにNPC位置を高頻度で送信
local unreliableRemote = Instance.new("UnreliableRemoteEvent")
unreliableRemote.Name = "NPCPositionSync"
unreliableRemote.Parent = ReplicatedStorage

RunService.Heartbeat:Connect(function()
    local positions = {}
    for _, npc in npcList do
        table.insert(positions, {npc.Id, npc.RootPart.CFrame})
    end
    unreliableRemote:FireAllClients(positions)
end)
```

## 3-4. バッチング戦略

複数の独立したRemoteEvent呼び出しを1回のテーブル送信にまとめることで、パケットオーバーヘッドを削減できる。

```lua
-- BAD: 個別に送信（オーバーヘッド × N）
for _, coin in collectedCoins do
    coinCollectedRemote:FireClient(player, coin.Id)
end

-- GOOD: まとめて送信（オーバーヘッド × 1）
local coinIds = {}
for _, coin in collectedCoins do
    table.insert(coinIds, coin.Id)
end
coinCollectedRemote:FireClient(player, coinIds)
```

## 3-5. 引数の制約

RemoteEvent / RemoteFunctionの引数には以下の制約がある。

- 関数は送信できない（受信側では `nil` になる）
- メタテーブルは失われる
- 受信側から見えない Instance は `nil` になる
- テーブルはディープコピーされ、参照は共有されない
- 数値キーと文字列キーを混在させない（配列か辞書のどちらかに統一する）
- 配列のインデックスに `nil` を入れない

---

# 4. レプリケーションの最適化

## 4-1. Parentの前にプロパティを設定する

`Instance.new()` で作成したオブジェクトを `Parent` に設定した瞬間にレプリケーションが開始される。Parent設定後にプロパティを変更すると、その変更が追加のレプリケーションとして送信される。

```lua
-- BAD: Parent設定後にプロパティ変更 → 追加レプリケーション発生
local part = Instance.new("Part")
part.Parent = workspace
part.Color = Color3.new(1, 0, 0)
part.Size = Vector3.new(4, 4, 4)
part.Position = Vector3.new(0, 10, 0)

-- GOOD: プロパティを全て設定してからParent → 1回のレプリケーション
local part = Instance.new("Part")
part.Color = Color3.new(1, 0, 0)
part.Size = Vector3.new(4, 4, 4)
part.Position = Vector3.new(0, 10, 0)
part.Parent = workspace
```

## 4-2. プロパティ変更の頻度を抑える

エンジンはフレーム単位でプロパティ変更をバッチしてレプリケーションする。同一フレーム内で同じプロパティを複数回変更した場合、最後の値のみが送信される。しかし、**異なるプロパティの変更はそれぞれレプリケーション対象**となるため、不必要なプロパティ変更を避ける。

```lua
-- BAD: 変更不要なプロパティまで毎フレーム設定
RunService.Heartbeat:Connect(function()
    part.Position = newPosition
    part.Color = Color3.new(1, 0, 0)  -- 色は変わらないのに毎フレーム設定
    part.Size = Vector3.new(4, 4, 4)  -- サイズも変わらないのに毎フレーム設定
end)

-- GOOD: 変化するプロパティだけ更新
RunService.Heartbeat:Connect(function()
    part.Position = newPosition
end)
```

## 4-3. ビジュアルエフェクトはクライアント側で実行する

Tween、パーティクル制御、UI更新など描画にしか影響しない処理をサーバーで実行すると、不要なレプリケーションが発生する。RemoteEventでイベントだけ通知し、ビジュアルの実現はクライアントに任せる。

```lua
-- BAD: サーバーでTween → 毎フレームPositionがレプリケーション
-- Server Script
TweenService:Create(part, tweenInfo, {Position = targetPos}):Play()

-- GOOD: サーバーはイベント通知のみ、クライアントがTween実行
-- Server Script
effectRemote:FireAllClients("MovePart", part, targetPos)

-- Client Script
effectRemote.OnClientEvent:Connect(function(effectType, part, targetPos)
    if effectType == "MovePart" then
        TweenService:Create(part, tweenInfo, {Position = targetPos}):Play()
    end
end)
```

## 4-4. Network Ownership

物理シミュレーションの所有権は、デフォルトではアンカーされていないパーツに対してキャラクターとの距離に基づいて自動割り当てされる。アンカーされたパーツは常にサーバー所有である。

**手動でNetwork Ownershipを設定するケース:**

```lua
-- 車両: 運転者にNetwork Ownershipを渡す
local Players = game:GetService("Players")

vehicleSeat.Changed:Connect(function(prop)
    if prop == "Occupant" then
        local humanoid = vehicleSeat.Occupant
        if humanoid then
            local player = Players:GetPlayerFromCharacter(humanoid.Parent)
            if player then
                vehicleSeat:SetNetworkOwner(player)
            end
        else
            vehicleSeat:SetNetworkOwnershipAuto()
        end
    end
end)
```

- `SetNetworkOwner(player)` — 指定プレイヤーに所有権を移譲
- `SetNetworkOwner(nil)` — サーバーに所有権を固定
- `SetNetworkOwnershipAuto()` — 自動割り当てに戻す

**注意:** サーバー所有（`SetNetworkOwner(nil)`）の乱用はネットワーク負荷を増加させる。プレイヤーの近くで動くオブジェクトは、そのプレイヤーに所有権を渡す方が帯域効率が良い。

## 4-5. StreamingEnabled との連携

インスタンスストリーミングの設定はレプリケーション量に大きく影響する。詳細は `client-performance.md` セクション7を参照のこと。

サーバースクリプトで注意すべき点:
- ストリームアウトされたインスタンスはクライアントに存在しないため、`FireClient` で送信した Instance 参照が `nil` になる可能性がある
- `Model.StreamingMode = Persistent` を設定したモデルは常にクライアントに存在するため、参照が安全である
- `PersistentPerPlayer` を使うことで、特定プレイヤーにのみ永続化できる

---

# 5. 物理演算（サーバー視点）

## 確認方法と目標値

**何を見るか:** MicroProfilerの `physicsStepped` スコープ。

| MicroProfilerスコープ | 意味 |
|---|---|
| `physicsStepped` | 物理計算全体 |
| `worldStep` | フレームごとの離散物理ステップ |

**目標値:** `physicsStepped` がフレームバジェット（16.7ms）のうち大きな割合を占めていないこと。

## 5-1. Adaptive Timestepping

`Workspace.PhysicsSteppingMethod` を **Adaptive**（デフォルト）に設定すると、物理エンジンがアセンブリを240Hz / 120Hz / 60Hzのソルバーアイランドに自動分類し、最大2.5倍の物理パフォーマンス改善が得られる。詳細は `client-performance.md` セクション6-1を参照のこと。

## 5-2. CollisionFidelityとCanCollide/CanTouch/CanQuery

装飾パーツの物理プロパティ最適化は `client-performance.md` セクション4-4・6-2を参照のこと。サーバースクリプトで動的に生成するインスタンスにも同じ原則が適用される。

```lua
local part = Instance.new("Part")
part.Anchored = true
part.CanCollide = false
part.CanTouch = false
part.CanQuery = false
part.Parent = workspace
```

## 5-3. Humanoidの最適化（NPC）

Humanoidは水泳・登り・ジャンプ・落下などの状態判定を毎フレーム実行するため、大量のNPCに使用するとサーバーCPU負荷が急増する。

**対策:**
- アニメーション再生だけが必要な環境オブジェクト（鳥・魚など）には `AnimationController` を使用する（`client-performance.md` セクション6-4参照）
- NPCが移動しない待機状態では、不要な `HumanoidStateType` を無効化する

```lua
local humanoid = npc:FindFirstChildOfClass("Humanoid")
humanoid:SetStateEnabled(Enum.HumanoidStateType.Climbing, false)
humanoid:SetStateEnabled(Enum.HumanoidStateType.Swimming, false)
humanoid:SetStateEnabled(Enum.HumanoidStateType.FallingDown, false)
humanoid:SetStateEnabled(Enum.HumanoidStateType.Ragdoll, false)
```

- 画面外・遠距離のNPCはAIの更新頻度を下げる、または非アクティブ化する（NPCプーリング）
- NPCの移動をクライアント側で処理し、サーバーは判定のみ行うアーキテクチャも有効

---

# 6. DataStoreパフォーマンス

## 6-1. リクエスト予算

DataStoreへのリクエストには分あたりの予算が設定されている。予算を超えるとリクエストはキューイングされ（上限30リクエスト）、キューも満杯になるとエラーになる。

**標準DataStore（サーバーあたり/分）:**

| 操作 | 予算（2026年4月以降のサーバー既定） |
|---|---|
| GetAsync | 60 + numPlayers × 40 |
| SetAsync / IncrementAsync / UpdateAsync（書き込み側） | 60 + numPlayers × 40 |
| RemoveAsync | 60 + numPlayers × 40 |

**OrderedDataStore（サーバーあたり/分）:**

| 操作 | 予算 |
|---|---|
| GetSortedAsync | 5 + numPlayers × 2 |
| SetAsync / IncrementAsync | 30 + numPlayers × 5 |

`numPlayers` はそのサーバーのアクティブプレイヤー数。`UpdateAsync` は読み取りと書き込みの**両方の予算を1回で消費する**。

**体験全体の制限（2026年4月以降）:**

サーバーごとの予算に加え、体験全体で共有される上限もある。

| 操作 | 予算 |
|---|---|
| Standard Read | 250 + concurrentUsers × 40 |
| Standard Write | 250 + concurrentUsers × 20 |
| Ordered List（GetSortedAsync） | 100 + concurrentUsers × 2 |
| Ordered Write | 250 + concurrentUsers × 20 |

`concurrentUsers` は体験全体の同時ユーザー数。

## 6-2. データ制限

| 項目 | 上限 |
|---|---|
| キー名 | 最大50文字 |
| データ値（シリアライズ後） | 最大4,194,304文字 |
| キューサイズ | 各キュー30リクエスト |
| Readスループット（キーあたり） | 25 MB/分 |
| Writeスループット（キーあたり） | 4 MB/分 |

スループットはリクエストごとに次のKBに切り上げで計測される（例: 800B → 1KB）。

## 6-3. セッションキャッシュパターン

DataStoreへのリクエストを最小化する最も効果的な方法は、プレイヤーデータをメモリにキャッシュし、参加時に1回読み取り・退出時に1回書き込みとすることである。

```lua
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local playerStore = DataStoreService:GetDataStore("PlayerData")
local sessionCache = {}

Players.PlayerAdded:Connect(function(player)
    local success, data = pcall(function()
        return playerStore:GetAsync("Player_" .. player.UserId)
    end)
    sessionCache[player.UserId] = if success and data then data else {coins = 0, level = 1}
end)

local function savePlayerData(player)
    local data = sessionCache[player.UserId]
    if not data then return end

    local success, err = pcall(function()
        playerStore:SetAsync("Player_" .. player.UserId, data)
    end)
    if not success then
        warn("Save failed for", player.Name, err)
    end
end

Players.PlayerRemoving:Connect(function(player)
    savePlayerData(player)
    sessionCache[player.UserId] = nil
end)

game:BindToClose(function()
    for _, player in Players:GetPlayers() do
        savePlayerData(player)
    end
end)
```

**重要:** `BindToClose` でバインドした関数は、サーバーシャットダウン時に**最大30秒**待機される。30秒を超えると関数の完了を待たずにシャットダウンされるため、保存処理はできるだけ速やかに完了させる。複数の `BindToClose` 関数は並列に実行される。

## 6-4. UpdateAsync vs SetAsync

`UpdateAsync` は読み取りと書き込みを1つのアトミック操作で行う。競合が発生しうる場面では `SetAsync` より安全だが、**読み取りと書き込みの両方の予算を消費する**ため、競合リスクがない場合は `SetAsync` の方が予算効率が良い。

| メソッド | 特徴 | 予算消費 |
|---|---|---|
| `SetAsync` | 無条件に上書き | Write × 1 |
| `UpdateAsync` | 読み取り → 変換関数 → 書き込みのアトミック操作 | Read × 1 + Write × 1 |

---

# 7. メモリ管理

## 確認方法と目標値

**何を見るか:** Developer Console（F9）の Memory タブで Server を選択し、LuaHeap と InstanceCount を監視する。

**目標値:** サーバーメモリ使用率50%未満。サーバーの総メモリは以下の式で概算できる（`client-performance.md` セクション4参照）。

```
サーバー総メモリ ≈ 6.25 GiB + (100 MiB × 最大同時接続プレイヤー数)
```

**リークの兆候:** LuaHeap や InstanceCount が**時間経過とともに右肩上がりで増加し続ける**場合はメモリリークを疑う。Developer Console の Luau heap 機能でスナップショットを複数回取得し、時系列で比較することでリーク箇所を特定できる。

## 7-1. イベント接続のクリーンアップ

接続（`RBXScriptConnection`）を切断せず放置すると、接続先のイベントが存在する限りコールバック関数とそのクロージャがGCされない。

**接続を解除する3つの方法:**

1. `connection:Disconnect()` で手動切断
2. イベントの属するインスタンスを `Destroy()` する
3. 接続元のスクリプトオブジェクトを破棄する

```lua
-- パターン1: 明示的なDisconnect
local connection
connection = part.Touched:Connect(function(hit)
    -- 処理
    connection:Disconnect()
end)

-- パターン2: Once（1回だけ発火して自動切断）
part.Touched:Once(function(hit)
    -- 1回だけ実行される
end)
```

## 7-2. Playerデータのクリーンアップ

プレイヤーが退出しても `Player` オブジェクトは自動で破棄されない場合がある。`Players.PlayerRemoving` でプレイヤーに紐づくデータを確実にクリーンアップする。

```lua
local playerData = {}
local playerConnections = {}

Players.PlayerAdded:Connect(function(player)
    playerData[player.UserId] = {}

    local conn = player.CharacterAdded:Connect(function(character)
        -- キャラクター初期化
    end)
    playerConnections[player.UserId] = {conn}
end)

Players.PlayerRemoving:Connect(function(player)
    -- 接続の切断
    local conns = playerConnections[player.UserId]
    if conns then
        for _, conn in conns do
            conn:Disconnect()
        end
    end
    playerConnections[player.UserId] = nil

    -- データの削除
    playerData[player.UserId] = nil
end)
```

**`Workspace.PlayerCharacterDestroyBehavior`** を設定することで、プレイヤー退出時のキャラクター破棄を自動化できる。

## 7-3. テーブルの効率的な使い方

**事前アロケーション:** 配列のサイズが事前に分かる場合、`table.create()` で事前確保することでGC負荷を軽減できる。

```lua
-- BAD: 順次追加（テーブルが何度もリサイズされる）
local results = {}
for i = 1, 1000 do
    table.insert(results, compute(i))
end

-- GOOD: 事前アロケーション（リサイズなし）
local results = table.create(1000)
for i = 1, 1000 do
    results[i] = compute(i)
end
```

**テーブルの再利用:** 短期間で大量に作成・破棄されるテーブル（弾丸データ、パーティクル情報など）はプーリングで再利用する。

```lua
local pool = {}

local function acquire()
    local obj = table.remove(pool)
    if obj then
        -- 既存のオブジェクトを初期化して再利用
        table.clear(obj)
        return obj
    end
    return {}
end

local function release(obj)
    table.insert(pool, obj)
end
```

## 7-4. ガベージコレクション

Luauのガベージコレクタはインクリメンタル方式で動作し、処理を細かく分散することでフルストップのポーズを最小化している。

- **mark → atomic → sweep** の3フェーズで動作
- GC assists により、メモリ割り当てに応じてコレクタがインターリーブ実行される
- atomic ステップは不可分であり、ヒープが大きい場合に数十ms級の一時停止が発生しうる

開発者がGCの挙動を直接制御するAPIはないが、**短命のテーブルを大量に生成しない**ことが最も効果的なGC負荷の軽減策である。

---

# 8. 計測・診断

## 8-1. MicroProfiler（サーバー側）

**サーバーダンプの取得手順:**

1. Developer Console（F9）を開く
2. ドロップダウンから **MicroProfiler** を選択
3. **Server** タブに切り替え
4. **Begin server recording** をクリック（最大60フレーム、開始まで最大4秒の遅延）
5. 数秒後にダンプファイルのパスが表示される

**主要スコープ:**

| スコープ | 内容 |
|---|---|
| `physicsStepped` | 物理計算全体 |
| `worldStep` | 離散物理ステップ |
| `RunService.PostSimulation` | Heartbeatイベント上のスクリプト |
| `RunService.PreSimulation` | Steppedイベント上のスクリプト |
| `ProcessPackets` | 受信パケットの処理 |
| `Allocate Bandwidth and Run Senders` | 送信側の帯域割り当てと送信処理 |

**カスタムプロファイルポイント:**

```lua
debug.profilebegin("MyExpensiveFunction")
-- 計測したい処理
debug.profileend()
```

MicroProfilerのDiff機能を使って、最適化前後のダンプを比較できる。

## 8-2. Developer Console

| タブ | 内容 |
|---|---|
| **Memory**（Server選択） | サーバーのメモリ内訳。LuaHeap、InstanceCount、PlaceScriptMemory等 |
| **Memory** → Luau heap | ヒープスナップショットの取得と比較。リーク箇所の特定に有用 |
| **Server Jobs** | Heartbeat行のSteps Per Secでサーバーフレームレートを確認（目標: 60） |
| **Server Stats** | 接続プレイヤーの平均ping等 |
| **Network** | HttpService / DataStore等のWeb呼び出し |
| **Script Profiler**（Server選択） | サーバースクリプトの関数別実行時間 |

## 8-3. Script Profiler

Developer Console の Script Profiler は MicroProfiler とは別のツールで、**関数単位の累積実行時間**を計測できる。

- Client / Server を切り替えてプロファイリング対象を選択
- セッション終了時にサーバー側データはクリアされる
- エクスポートしたJSONには、カテゴリ（Heartbeat、Parallel Luau等）、関数名、累積時間（マイクロ秒）、`IsNative` フラグなどが含まれる

---

# 9. アンチパターン集

サーバーサイドのコーディングで頻出するパフォーマンス上の問題パターンとその修正方法。

---

### 9-1. 毎フレームRemoteEventを送信する

```lua
-- BAD: 60回/秒で全クライアントに送信
RunService.Heartbeat:Connect(function()
    remote:FireAllClients(someData)
end)

-- GOOD: 必要な頻度に間引く
local SYNC_INTERVAL = 0.1  -- 10回/秒
local elapsed = 0
RunService.Heartbeat:Connect(function(dt)
    elapsed += dt
    if elapsed < SYNC_INTERVAL then return end
    elapsed -= SYNC_INTERVAL
    remote:FireAllClients(someData)
end)
```

高頻度の位置同期には `UnreliableRemoteEvent` を使う。

---

### 9-2. Parent設定後にプロパティを変更する

```lua
-- BAD: Parent後のプロパティ変更が追加レプリケーション
local part = Instance.new("Part")
part.Parent = workspace
part.Color = Color3.new(1, 0, 0)
part.Anchored = true

-- GOOD: 全プロパティ設定後にParent
local part = Instance.new("Part")
part.Color = Color3.new(1, 0, 0)
part.Anchored = true
part.Parent = workspace
```

---

### 9-3. 非推奨の wait / spawn / delay を使う

```lua
-- BAD: スロットリングされる可能性がある
wait(1)
spawn(function() doSomething() end)
delay(5, function() doLater() end)

-- GOOD: task ライブラリを使用
task.wait(1)
task.spawn(function() doSomething() end)
task.delay(5, function() doLater() end)
```

---

### 9-4. DataStoreに毎回直接アクセスする

```lua
-- BAD: コイン取得のたびにDataStoreへ読み書き
part.Touched:Connect(function(hit)
    local player = Players:GetPlayerFromCharacter(hit.Parent)
    if player then
        local data = store:GetAsync("Player_" .. player.UserId)
        data.coins += 1
        store:SetAsync("Player_" .. player.UserId, data)
    end
end)

-- GOOD: メモリにキャッシュし、退出時に一括保存
part.Touched:Connect(function(hit)
    local player = Players:GetPlayerFromCharacter(hit.Parent)
    if player then
        sessionCache[player.UserId].coins += 1
    end
end)
```

---

### 9-5. ループ内で FindFirstChild / GetChildren を繰り返す

```lua
-- BAD: 毎フレーム GetDescendants を呼ぶ
RunService.Heartbeat:Connect(function()
    for _, part in workspace:GetDescendants() do
        if part:IsA("BasePart") and part.Name == "Coin" then
            -- 処理
        end
    end
end)

-- GOOD: CollectionService でタグ管理し、事前にリストを保持
local CollectionService = game:GetService("CollectionService")
local coins = CollectionService:GetTagged("Coin")
CollectionService:GetInstanceAddedSignal("Coin"):Connect(function(coin)
    table.insert(coins, coin)
end)
CollectionService:GetInstanceRemovedSignal("Coin"):Connect(function(coin)
    local idx = table.find(coins, coin)
    if idx then table.remove(coins, idx) end
end)
```

---

### 9-6. グローバル変数を多用する

```lua
-- BAD: グローバルテーブルのルックアップは遅い
function processData()
    for i = 1, 10000 do
        result = math.sqrt(i)
    end
end

-- GOOD: ローカル変数を使う
local sqrt = math.sqrt
local function processData()
    local result
    for i = 1, 10000 do
        result = sqrt(i)
    end
end
```

---

### 9-7. イベント接続を切断しない

```lua
-- BAD: 接続が蓄積し続ける
Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        character:WaitForChild("Humanoid").Died:Connect(function()
            -- 死亡処理
        end)
    end)
end)

-- GOOD: 接続を管理して適切に切断
local playerConnections = {}

Players.PlayerAdded:Connect(function(player)
    playerConnections[player.UserId] = {}

    local charConn
    charConn = player.CharacterAdded:Connect(function(character)
        local diedConn
        diedConn = character:WaitForChild("Humanoid").Died:Connect(function()
            -- 死亡処理
            diedConn:Disconnect()
        end)
        table.insert(playerConnections[player.UserId], diedConn)
    end)
    table.insert(playerConnections[player.UserId], charConn)
end)

Players.PlayerRemoving:Connect(function(player)
    local conns = playerConnections[player.UserId]
    if conns then
        for _, conn in conns do
            conn:Disconnect()
        end
    end
    playerConnections[player.UserId] = nil
end)
```

---

### 9-8. while true do + wait() のポーリング

```lua
-- BAD: ポーリングで状態変化を検出
while true do
    wait(0.1)
    if someCondition() then
        doSomething()
    end
end

-- GOOD: イベント駆動で状態変化を検出
someObject:GetPropertyChangedSignal("SomeProperty"):Connect(function()
    if someCondition() then
        doSomething()
    end
end)
```

プロパティ変更やインスタンスの追加・削除は、対応するイベント（`Changed`、`GetPropertyChangedSignal`、`ChildAdded`、`CollectionService:GetInstanceAddedSignal` 等）を使用する。ポーリングはイベントで代替できない場合にのみ使い、その場合も `task.wait()` を使用し間隔を適切に設定する。

---

### 9-9. サーバーでビジュアルエフェクトやTweenを実行する

```lua
-- BAD: サーバーでTween → 全クライアントにプロパティ変更がレプリケーション
TweenService:Create(door, TweenInfo.new(1), {CFrame = openCFrame}):Play()

-- GOOD: クライアントにイベント通知し、クライアント側でTween
doorRemote:FireAllClients("Open", door, openCFrame)
```

ただし、物理的な衝突判定に影響するオブジェクトの移動（ドアの開閉など）は、サーバーで最終位置を直接設定し、クライアントでビジュアルの補間を行うハイブリッド方式が安全である。

---

### 9-10. Instance.new でコンストラクタの第2引数にParentを渡す

`Instance.new` の第2引数（parent）は**非推奨**であり、プロパティ設定前にParentが設定されるためレプリケーションの問題がある。

```lua
-- BAD: 非推奨の第2引数
local part = Instance.new("Part", workspace)

-- GOOD: 明示的にプロパティ設定後にParent
local part = Instance.new("Part")
part.Anchored = true
part.Parent = workspace
```

---

# 10. 作業チェックリスト

対象: Robloxサーバー・ネットワークパフォーマンスガイド — スクリプティングの最適化

**凡例:**
- `[必須]` — 違反すると影響が大きい・後から修正が困難・気づきにくい
- `[推奨]` — 重要だが状況依存、または影響が相対的に小さい

---

## フェーズ1: スクリプト設計

### 基本
- [ ] `[必須]` 非推奨の `wait()` / `spawn()` / `delay()` を使用していない（`task` ライブラリに置き換え済み）（→ 2-8）
- [ ] `[必須]` サービス取得（`GetService`）やオブジェクト参照はスクリプト冒頭でローカル変数にキャッシュしている（→ 2-1）
- [ ] `[必須]` `Instance.new` の第2引数（parent）を使用していない（→ 9-10）
- [ ] `[必須]` `Instance.new` で作成したオブジェクトはプロパティ設定後に `Parent` を設定している（→ 4-1）

### RemoteEvent / RemoteFunction
- [ ] `[必須]` RemoteEventを毎フレーム送信していない（必要な頻度に間引いている）（→ 3-1 / 9-1）
- [ ] `[必須]` 複数の小さな FireClient を1回のテーブル送信にバッチングしている（→ 3-4）
- [ ] `[推奨]` 高頻度の位置同期には `UnreliableRemoteEvent` を使用している（→ 3-3）
- [ ] `[推奨]` ペイロードに含めるデータを必要最小限にしている（→ 3-2）

### レプリケーション
- [ ] `[必須]` Tween・ビジュアルエフェクトはクライアント側で実行している（サーバーでTweenしていない）（→ 4-3 / 9-9）
- [ ] `[推奨]` 変化しないプロパティを毎フレーム設定していない（→ 4-2）
- [ ] `[推奨]` Network Ownershipを適切に設定している（車両等）（→ 4-4）

### DataStore
- [ ] `[必須]` セッションキャッシュを使用し、DataStoreへの直接アクセスを最小化している（→ 6-3 / 9-4）
- [ ] `[必須]` `BindToClose` でサーバーシャットダウン時のデータ保存を行っている（→ 6-3）
- [ ] `[推奨]` `UpdateAsync` と `SetAsync` を用途に応じて使い分けている（→ 6-4）

---

## フェーズ2: メモリ管理

- [ ] `[必須]` `Players.PlayerRemoving` でプレイヤーに紐づくデータ・接続を確実にクリーンアップしている（→ 7-2）
- [ ] `[必須]` イベント接続を適切に `Disconnect` している（ネストされた接続も含む）（→ 7-1 / 9-7）
- [ ] `[推奨]` 大量生成するテーブルはプーリングまたは `table.create()` で事前アロケーションしている（→ 7-3）
- [ ] `[推奨]` `while true do` + ポーリングの代わりにイベント駆動を使用している（→ 9-8）

---

## フェーズ3: 物理・NPC

- [ ] `[必須]` 動的生成するパーツに `Anchored` / `CanCollide` / `CanTouch` / `CanQuery` を適切に設定している（→ 5-2）
- [ ] `[推奨]` 大量NPCの `HumanoidStateType` を必要最小限に絞っている（→ 5-3）
- [ ] `[推奨]` `Workspace.PhysicsSteppingMethod` が Adaptive であることを確認した（→ 5-1）
- [ ] `[推奨]` 計算コストの高いAI処理にスロットリングを適用している（→ 2-4）

---

## フェーズ4: パフォーマンスレビュー

### サーバーCPU
- [ ] `[必須]` MicroProfilerサーバーダンプで `physicsStepped` と Heartbeat スクリプトの負荷を確認した（→ 8-1）
- [ ] `[必須]` Developer Console の Server Jobs で Heartbeat の Steps Per Sec が 60 に近いことを確認した（→ 8-2）
- [ ] `[推奨]` Script Profiler で関数別の実行時間を確認し、ホットスポットを特定した（→ 8-3）

### メモリ
- [ ] `[必須]` Developer Console の Memory（Server）で LuaHeap と InstanceCount が時間経過で増加し続けていないことを確認した（→ 7）
- [ ] `[推奨]` サーバーメモリ使用率が 50% 以下であることを確認した（→ 7）

### ネットワーク
- [ ] `[必須]` クライアントの Recv 帯域が 40KB/s 以下であることを確認した（→ 3 / `client-performance.md` セクション5）

---

# 11. 参考情報源

- Roblox公式ドキュメント「Improve Performance」— スクリプトメモリ使用量、ネットワークとレプリケーション、MicroProfilerスコープ、接続のクリーンアップ https://create.roblox.com/docs/performance-optimization/improve
- Roblox公式ドキュメント「Identify Performance Issues」— サーバーメモリ計算式（6.25 GiB + 100 MiB × players）、Developer Console の使い方、Server Jobs タブ https://create.roblox.com/docs/performance-optimization/identify
- Roblox公式ドキュメント「MicroProfiler」— サーバーダンプ取得手順、カスタムプロファイルポイント、Diff機能 https://create.roblox.com/docs/performance-optimization/microprofiler
- Roblox公式ドキュメント「MicroProfiler: Network」— ネットワークダンプ、verbosity設定、Engine network batch data https://create.roblox.com/docs/performance-optimization/microprofiler/network
- Roblox公式ドキュメント「Memory Usage」— Developer Console の Memory タブ、Luau heap スナップショット https://create.roblox.com/docs/studio/optimization/memory-usage
- Roblox公式ドキュメント「Script Profiler」— 関数別プロファイリング、サーバー側の計測、エクスポート形式 https://create.roblox.com/docs/studio/optimization/scriptprofiler
- Roblox公式ドキュメント「Data Stores」— DataStoreの概要と使い方 https://create.roblox.com/docs/cloud-services/data-stores
- Roblox公式ドキュメント「Data Store Error Codes and Limits」— リクエスト予算、キュー上限、スループット制限、データサイズ上限 https://create.roblox.com/docs/cloud-services/data-stores/error-codes-and-limits
- Roblox公式ドキュメント「Remote Events and Callbacks」— RemoteEvent/RemoteFunctionの使い方、引数の制約 https://create.roblox.com/docs/scripting/events/remote
- Roblox APIリファレンス「RemoteEvent」— スロットリング制限（約500回/秒/クライアント） https://create.roblox.com/docs/reference/engine/classes/RemoteEvent
- Roblox APIリファレンス「UnreliableRemoteEvent」— 1,000バイトペイロード制限、信頼性・順序の挙動 https://create.roblox.com/docs/reference/engine/classes/UnreliableRemoteEvent
- Roblox公式ドキュメント「Network Ownership」— 物理所有権の自動割り当て、SetNetworkOwner https://create.roblox.com/docs/physics/network-ownership
- Roblox公式ドキュメント「Instance Streaming」— StreamingEnabled、ModelStreamingBehavior https://create.roblox.com/docs/workspace/streaming
- Roblox公式ドキュメント「Native Code Generation」— --!native、@native、制限事項 https://create.roblox.com/docs/luau/native-code-gen
- Roblox公式ドキュメント「Parallel Luau」— Actor、task.desynchronize/synchronize、ConnectParallel https://create.roblox.com/docs/scripting/multithreading
- Roblox APIリファレンス「task」— task.wait/spawn/delay/defer/cancel https://create.roblox.com/docs/reference/engine/libraries/task
- Roblox APIリファレンス「DataModel:BindToClose」— 30秒タイムアウト、複数関数の並列実行 https://create.roblox.com/docs/reference/engine/classes/DataModel
- Luau公式サイト「How we make Luau fast」— インクリメンタルGC、table.create、テーブルの最適化 https://luau-lang.org/performance
