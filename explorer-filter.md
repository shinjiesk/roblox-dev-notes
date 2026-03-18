# Robloxスタジオ エクスプローラのフィルター構文ガイド

Roblox Studio のエクスプローラには検索フィルター機能がある。多数のインスタンスから目的のオブジェクトを特定し、一括選択して編集できるようになった。

本ガイドでは、公式ドキュメントに掲載されている構文と、開発者コミュニティが発見した非公式テクニックの両方をまとめている。

## 公式ドキュメント掲載の構文

### 名前検索

フィルターバーにテキストを入力すると、インスタンス名で部分一致検索が行われる。大文字・小文字は区別されない。

| 構文 | 結果 |
|------|------|
| `Part` | 名前に `Part` を含むインスタンス |
| `"Red Team Spawn"` | スペースを含む名前はダブルクォートで囲む |

### クラスフィルター

インスタンスのクラスで絞り込むには `is:` を使用する。指定したクラスのサブクラスも含めて検索される。

| 構文 | 結果 |
|------|------|
| `is:Part` | `Part` クラスのインスタンスすべて |
| `is:BasePart` | `BasePart` を継承するすべてのインスタンス（`Part`、`MeshPart`、`WedgePart` など） |

> **補足**: `ClassName=Part` のようにプロパティ検索として記述することも可能だが、`is:` とは異なりサブクラスは含まれず完全一致となる。

### タグ検索

`CollectionService` のタグで絞り込むには `tag:` を使用する。

| 構文 | 結果 |
|------|------|
| `tag:LightSource` | タグ `LightSource` が付いたインスタンス |
| `tag:"Light Source"` | スペースを含むタグ名はダブルクォートで囲む |

### プロパティ検索

ほとんどのプロパティに対応している。スペースの有無は無視され、大文字・小文字も区別されない。部分一致にも対応する。

#### 等号検索（`=` / `==`）

| 構文 | 結果 |
|------|------|
| `Locked=true` | `Locked` が `true` のインスタンス |
| `Material=Plastic` | マテリアルが `Plastic` の `BasePart` |
| `Material==plas` | `Plastic` または `SmoothPlastic` に部分一致 |

#### 比較演算子（`~=` `>` `<` `>=` `<=`）

| 構文 | 結果 |
|------|------|
| `Health>50` | `Health` が 50 より大きい `Humanoid` |
| `Transparency>=0.5` | `Transparency` が 0.5 以上のインスタンス |
| `Transparency~=0.5` | `Transparency` が 0.5 でないインスタンス |

#### Vector3 / Color3 の個別フィールド検索

Vector3 型と Color3 型のプロパティは `.X`/`.Y`/`.Z` や `.R`/`.G`/`.B` でサブフィールドにアクセスできる。`BasePart` の `Position`・`Size`・`Color` などが対象となる。

> **注意**: `Model` の位置情報は CFrame 型プロパティ（`Origin`、`WorldPivot`）にしか存在せず、CFrame のサブフィールド検索は動作しない。そのため **Model を位置で絞り込むことはフィルターではできない**。

| 構文 | 結果 |
|------|------|
| `Position.X=1` | X 座標が 1 の `BasePart`（Model には効かない） |
| `Color.R>120` | 赤チャンネルが 120 より大きいオブジェクト |

#### Vector3 / Color3 の完全一致・比較検索

ダブルクォートで囲み、カンマ区切りで指定する。比較演算子も使用可能で、各要素が個別に比較される。

| 構文 | 結果 |
|------|------|
| `Position="1, 2, 3"` | 位置が (1, 2, 3) に完全一致（`BasePart` のみ） |
| `Color="255, 0, 0"` | RGB が (255, 0, 0) のオブジェクト |
| `Size>"20, 5, 20"` | X, Y, Z がそれぞれ 20, 5, 20 より大きいオブジェクト |

#### Enum プロパティ

| 構文 | 結果 |
|------|------|
| `Material=Plastic` | 文字列として Enum 値を指定 |
| `is:BasePart Material=Plastic or Material=SmoothPlastic` | 複数の値を `or` で組み合わせ |

### 階層検索

特定のインスタンス以下に絞り込んで検索できる。`.` 演算子でスコープを指定し、`*` をワイルドカードとして使用する。

| 構文 | 結果 |
|------|------|
| `Parent.Child` | `Parent` の直下にある `Child` |
| `Cart.*` | `Cart` の直接の子すべて |
| `Cart.*.*` | `Cart` の孫（直接の子は含まない） |
| `Cart.*.Trim` | `Cart` の孫のうち名前が `Trim` のもの |
| `model.**` | `model` のすべての子孫を再帰的に検索 |
| `workspace.**` | `Workspace` 以下すべて |

### 論理演算子

複数の条件を組み合わせることができる。

| 演算子 | 構文例 | 意味 |
|--------|--------|------|
| AND（暗黙） | `Anchored=true Locked=true` | スペース区切りで AND 条件 |
| `and` | `Anchored=false and CanCollide=false` | 明示的な AND |
| `or` | `Cat or Dog` | いずれかを満たすものを検索 |
| `()` | `(Anchored=true) or (CanCollide=false)` | 括弧でグループ化 |

### 名前とプロパティの組み合わせ

名前検索とプロパティ検索は組み合わせ可能である。

| 構文 | 結果 |
|------|------|
| `Wheel1 CanCollide=false` | 名前が `Wheel1` かつ `CanCollide` が `false` のインスタンス |

### 便利な操作

| ショートカット | 説明 |
|----------------|------|
| Ctrl+Shift+X / Cmd+Shift+X | エクスプローラの検索バーにフォーカス |
| Ctrl+A / Cmd+A | 検索結果をすべて選択（一括編集に有用） |
| 上下ボタン | 検索バーヘッダーに配置。検索結果間の移動と一致件数の表示 |

## コミュニティ発見の非公式テクニック

公式ドキュメントには記載されていないが、開発者コミュニティが発見し動作が確認されている構文である。

### PackageLink の Status フィルター

`Package` を多用するプロジェクトで有用である。変更済みパッケージや更新可能なパッケージを即座に検出できる。

| 構文 | 結果 |
|------|------|
| `is:PackageLink Status=Changed` | 変更されたパッケージ |
| `is:PackageLink Status="Up To Date"` | 最新のパッケージ |
| `is:PackageLink Status="New Version Available"` | 新バージョンがあるパッケージ |

複数単語の値はダブルクォートで囲む必要がある。`Status=Up To Date` のように書くと動作しない。

出典: [DevForum「How to search for all modified packages in explorer」](https://devforum.roblox.com/t/how-to-search-for-all-modified-packages-in-explorer/2334524)

### Mass プロパティ

`Mass` は Properties パネルに表示されない読み取り専用の計算プロパティだが、フィルターでは使用可能である（MCP で `BasePart.Mass` の存在を確認済み）。

| 構文 | 結果 |
|------|------|
| `mass=5` | 質量がちょうど 5 のパーツ |
| `mass>10` | 質量が 10 より大きいパーツ |
| `mass<1` | 質量が 1 未満のパーツ |

出典: [DevForum「How to effectively use the search bar in the explorer」](https://devforum.roblox.com/t/how-to-effectively-use-the-search-bar-in-the-explorer/2655403)

### Parent プロパティ

`Parent=` を使用して、特定の親を持つインスタンスを検索できる。

| 構文 | 結果 |
|------|------|
| `Parent=Workspace` | 直接の親が `Workspace` であるインスタンス |
| `Parent=ServerStorage` | 直接の親が `ServerStorage` であるインスタンス |

出典: [DevForum「How to effectively use the search bar in the explorer」](https://devforum.roblox.com/t/how-to-effectively-use-the-search-bar-in-the-explorer/2655403)

### BrickColor の指定

`BrickColor` はスペースを含む値が多いため、ダブルクォートが必要である。

| 構文 | 例 |
|------|------|
| `BrickColor="New Yeller"` | 黄色のパーツ |
| `BrickColor="Bright red"` | 赤色のパーツ |

出典: [DevForum「How to effectively use the search bar in the explorer」](https://devforum.roblox.com/t/how-to-effectively-use-the-search-bar-in-the-explorer/2655403)

### Material と MaterialVariant の組み合わせ

`MaterialVariant` が空文字列のパーツ、すなわちカスタムマテリアルが適用されていないパーツを検出するテクニックである。

| 構文 | 結果 |
|------|------|
| `workspace.** Material=Plastic MaterialVariant=""` | `Workspace` 以下でデフォルトの `Plastic` マテリアルのまま残っているパーツ。テクスチャ適用漏れのチェックに有用 |

### BackgroundColor3 の構文

公式ドキュメントでは `Color="255, 0, 0"` のような記法が紹介されているが、`BackgroundColor3` などの GUI プロパティでは完全なプロパティ名での指定が必要である。

| 構文 | 備考 |
|------|------|
| `BackgroundColor3="255, 255, 255"` | ダブルクォートとカンマ区切りの RGB 値で指定する。`Color=` の省略記法では動作しないケースがある |

出典: [DevForum「New filter for Explorer window can't find some properties」](https://devforum.roblox.com/t/new-filter-for-explorer-window-cant-find-some-properties/2527847)

### 数字名フォルダの子要素検索

フォルダ名が数字の場合、階層検索でダブルクォートが必要である。

| 構文 | 結果 |
|------|------|
| `8.Red` | 動作しない（数値として解釈される） |
| `"8".Red` | フォルダ `8` の子 `Red` が見つかる |

出典: [DevForum「Explorer Search Improvements」Roblox スタッフ回答](https://devforum.roblox.com/t/explorer-search-improvements/2196033/98)

## 現在の制限事項

- **Attributes のフィルタリングは未対応** — 2024年2月時点でリクエストされているが、Roblox スタッフは実装の複雑さを指摘しており未実装である
- **一部の Color3 プロパティで構文の不一致** — プロパティによっては公式ドキュメントの記法が機能しない場合がある
- **子や子孫の有無によるフィルタリングは未対応** — 「特定の子を持つインスタンス」といった条件での検索はできない
- **CFrame プロパティのサブフィールド検索は未対応** — CFrame 型プロパティ（`Origin`、`WorldPivot`、`CFrame` 等）では `.X`/`.Y`/`.Z` によるサブフィールド検索が動作しない

## 実践的なユースケース

### アンカーし忘れたパーツを検出

```
workspace.** is:BasePart Anchored=false
```

上記で検索し、Ctrl+A で全選択して Properties パネルで `Anchored` を一括で `true` に変更する。

### 変更済みパッケージの確認

```
is:PackageLink Status=Changed
```

編集済みのパッケージを即座に確認できる。

### 透明度が中途半端なパーツの検出

```
Transparency>0 Transparency<1
```

完全表示でも完全非表示でもないパーツが見つかる。

### 全スクリプトの検索

```
is:LuaSourceContainer
```

`Script`、`LocalScript`、`ModuleScript` すべてが表示される（MCP で `LuaSourceContainer` がこれら3クラスの共通スーパークラスであることを確認済み）。

### 特定タグ付きの PointLight を検出

```
is:PointLight tag:Dynamic
```

クラスとタグの組み合わせで精密にフィルタリングできる。

## 参考リンク

- [公式ドキュメント - Explorer](https://create.roblox.com/docs/studio/explorer)
- [DevForum - Explorer Search Improvements](https://devforum.roblox.com/t/explorer-search-improvements/2196033)
- [DevForum - How to search for all modified packages](https://devforum.roblox.com/t/how-to-search-for-all-modified-packages-in-explorer/2334524)
- [DevForum - How to effectively use the search bar in the explorer](https://devforum.roblox.com/t/how-to-effectively-use-the-search-bar-in-the-explorer/2655403)
- [DevForum - BackgroundColor3 フィルターの不具合報告](https://devforum.roblox.com/t/new-filter-for-explorer-window-cant-find-some-properties/2527847)
