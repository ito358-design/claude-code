# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 作業方針

タスクが大量に発生した場合は、チームエージェント（サブエージェント）を活用して並列で作業を進める。独立したタスクは Agent ツールで複数のサブエージェントに分担させ、効率よく処理する。

ファイルを作成した後は、作成したファイルのフルパスを必ずユーザーに報告する。

## 概要

Claude Code の学習・実験用ワーキングディレクトリ。スタンドアロンのファイル群で構成されており、ビルドシステムやテストスイートはない。

## ファイル構成

- `timer.html` — 日本語UIのカウントダウンタイマー。単体のHTMLファイルで外部依存なし。ブラウザで直接開くだけで動作する。
- `claude-code-course-materials-2026-04/` — Claude Codeコース教材
  - `receipts/` — レシート画像（receipt_01.jpg〜receipt_20.jpg）
  - `cards/` — カード画像（card_01.jpg〜card_20.jpg）
  - `Skills/pptx_michikusa/` — MichikusaブランドPPTX生成スキル

## pptx_michikusa スキル

`Skills/pptx_michikusa/michikusa_pptx.py` に `Deck` クラスが定義されており、Michikusaブランドの `.pptx` を生成する。

### 依存インストール（初回のみ）

```bash
pip3 install python-pptx budoux --break-system-packages
```

### 基本的な使い方

```python
from michikusa_pptx import Deck

d = Deck()  # デフォルトで冒頭にMichikusa会社紹介5枚が入る
d = Deck(include_intro=False)  # イントロなし

d.cover("タイトル", "サブタイトル")
d.section("セクション名")
d.bullets("タイトル", ["箇条書き1", "箇条書き2"])
d.twocol("タイトル", ["左1", "左2"], ["右1", "右2"], left_head="左見出し", right_head="右見出し")
d.save("output.pptx")
```

### テンプレートファイル

- `michikusa_intro.pptx` — デフォルトテンプレート（会社紹介5枚入り）
- `michikusa.pptx` — 空テンプレート（`include_intro=False` 時に使用）

### 注意点

- `WRAP` 定数で各プレースホルダーの折り返し文字数を調整できる（値は下げる方向のみ推奨）
- 孤立行（寡婦）が出た場合は `jp_wrap(text, max_chars)` を直接テストして `max_chars` を下げる
- PowerPointで開く前に既存の同名ファイルを必ず閉じる（古いキャッシュでPDF出力されるバグ回避）
