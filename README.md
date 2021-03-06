# EVA_08_UI

ヱヴァンゲリオン新劇場版:Qの劇中に登場するGUIを再現したアプリです。

https://Ireansan.github.io/eva_08_gui/

## 操作方法

薬指, 小指は握った状態でそれ以外の指が真っ直ぐに伸びている状態を初期状態としています。また, 人差し指または中指を付け根から折り曲げてから戻すまでを一つの動作としています。2つの動作の組み合わせで操作します。
推定の精度上, 手のひらをカメラ側に向けて操作してください。

<img src="https://github.com/Ireansan/eva_08_gui/blob/master/docs/action_example_220617_v1.gif" alt="example">
<br />

### 登録されているジェスチャーとその結果

|ジェスチャー|結果|
|:--|:--|
|人差し指 -> 人差し指| キューブ上の数値全てに+1|
|中指 -> 中指| キューブ上の数値全てに-1|
|人差し指 -> 中指|左手の場合, 左回転 (右手では逆の右回転)|
|中指 -> 人差し指|左手の場合, 右回転 (右手では逆の左回転)|

### 操作パネルの使い方・見方

画面右上に紺色のパネルのようなものが表示されます。パネルの内容は動作に関係する setting と動作に関係はしないが結果を見ることができる view から構成されています。以下で setting の内容について説明します。view の内容については省略します。

|ラベル|内容|
|:--|:--|
|Index Threshold|人差し指に関する閾値|
|Middle Threshold|中指に関する閾値, 手のひらの平面を基準とした中指の角度|
|Index <-> Middle|人差し指と中指の間の角度|
|Time [s]|入力受付時間|

角度は手のひらの平面を基準としており, 指を曲げた際の角度が閾値以上になると折り曲げたと判定されます。人差し指, 中指間の角度は2本同時に曲げた際に処理を行わないようにするために閾値を設定しています。

## おまけ

作成の初期段階で試験的に作成した```Soft Sphere```と```Follow Box```という2つのモードがあります。

### Soft Sphere

人差し指と中指の間に球が追従し, 指先の距離に合わせて球が縦方向に伸びたり縮んだりできるモードです。

### Follow Box

人差し指の指先を箱が追従するだけのモードです。

## 参考

- [Mediapipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [nemutas/app-mediapipe-hands-demo](https://github.com/nemutas/app-mediapipe-hands-demo)
- [react-three-fiber](https://github.com/pmndrs/react-three-fiber)
- [leva](https://github.com/pmndrs/leva)
- [valtio](https://github.com/pmndrs/valtio)
