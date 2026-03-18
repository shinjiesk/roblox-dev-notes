# BillboardGui プロパティ解説

## StudsOffset（カメラ基準・スタッド単位）

- X：2次元的に画面の左右に位置をずらす
- Y：2次元的に画面の上下に位置をずらす（正で画面の上）
- Z：3次元的にカメラとの距離を変える。Scale使用時は実質的にサイズ変化。AlwaysOnTopがfalseなら前後の重なりにも影響
- スタジオ上でAdorneeのScaleを変更すると見た目が同じになるように値が自動調整される

## ExtentsOffset（カメラ基準・Adorneeバウンディングボックスの半分単位）

- 軸の意味はStudsOffsetと同じ
- 単位はカメラから見たAdorneeのバウンディングボックスの半分。カメラの角度が変わるとバウンディングボックスの形も変わるため、ずれる量も変わる
- Adorneeのサイズに応じてずれる量が自動スケールする

## StudsOffsetWorldSpace（ワールド基準・スタッド単位）

- X, Y, Z：3次元的にワールド軸に沿って位置をずらす。カメラの向きに関係なく固定
- スタジオ上でAdorneeのScaleを変更すると見た目が同じになるように値が自動調整される

## ExtentsOffsetWorldSpace（ワールド基準・Adorneeバウンディングボックスの半分単位）

- 軸の意味はStudsOffsetWorldSpaceと同じ
- 単位はワールド軸に沿ったAdorneeのバウンディングボックスの半分。カメラの角度が変わってもずれる量は変わらない
- Adorneeのサイズに応じてずれる量が自動スケールする

## Size（UDim2）

- Scale：スタッド単位。距離に応じて画面上のサイズが変わる
- Offset：ピクセル単位。距離に関係なく固定

## SizeOffset（Vector2）

- 2次元的にGUIのサイズを基準にした位置調整。AnchorPointに近い役割

## ScreenGuiとの違い

- ScreenGuiはYを増やすと画面の下に移動する（左上が原点）
- BillboardGuiのカメラ基準オフセットはYを増やすと画面の上に移動する

## 「Adorneeバウンディングボックスの半分単位」について

- 公式ドキュメントには「Modelのバウンディングボックスの半分」という記述しかない
- 「Model」というのは、おそらくAdorneeプロパティで指定したPartもしくはBillboardGuiの親ではないかと（仮説）

## 実用Tips：キャラクターの大きさに関わらず頭上にBillboardGuiを表示する
（仮説のもとで）
- ExtentsOffsetWorldSpaceのYを1.5程度に設定する
- AdorneeにはHead等の個別パーツではなく、キャラクター全体のModelを指定する
- Extents系はAdorneeのバウンディングボックスに比例するため、R6/R15やスケールの異なるキャラクターでも自動的に適切な位置に表示される