# ポモドーロタイマー

シンプルで使いやすいポモドーロタイマーのWebアプリケーションです。

## 機能

- **基本的なタイマー機能**
  - 作業時間（デフォルト: 25分）
  - 短い休憩（デフォルト: 5分）
  - 長い休憩（デフォルト: 15分）
  - 開始、一時停止、リセット機能

- **カスタマイズ可能な設定**
  - 作業時間の長さ
  - 短い休憩の長さ
  - 長い休憩の長さ
  - 長い休憩までのセッション数

- **統計情報**
  - 完了したポモドーロ数
  - 今日の総作業時間

- **通知機能**
  - セッション終了時の音声通知
  - ブラウザ通知（許可が必要）

- **その他の機能**
  - 設定の自動保存（ローカルストレージ）
  - 統計の自動保存（日付ごと）
  - レスポンシブデザイン
  - 美しいグラデーションUI

## 使い方

1. `index.html`をブラウザで開く
2. 必要に応じて設定を調整
3. 「開始」ボタンをクリックしてタイマーを開始
4. 作業に集中！
5. タイマーが終了すると自動的に休憩時間に切り替わります

## ポモドーロテクニックとは

ポモドーロテクニックは、フランチェスコ・シリロによって開発された時間管理手法です。

基本的な流れ：
1. 25分間の作業
2. 5分間の短い休憩
3. 4セット完了後、15-30分の長い休憩

この手法により、集中力を維持しながら効率的に作業を進めることができます。

## 技術スタック

- HTML5
- CSS3（グラデーション、アニメーション）
- JavaScript（ES6+）
- ローカルストレージAPI
- Web Audio API（通知音）
- Notification API（ブラウザ通知）
