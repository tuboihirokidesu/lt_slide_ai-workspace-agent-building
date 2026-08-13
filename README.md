# AIエージェントの作り方

[調査対象リポジトリ](https://github.com/mhigroup/A0005-AI-Workspace)を題材に、エージェントを使う判断基準と、A0005 が採用した AI SDK `ToolLoopAgent` / Claude Agent SDK の2つの構築経路を整理した Slidev 資料です。AI SDK 7 の `WorkflowAgent` / `HarnessAgent` を含む網羅比較ではありません。

## Slides

- 公開版: https://tuboihirokidesu.github.io/lt_slide_ai-workspace-agent-building/
- ソース: [`slides.md`](./slides.md)

## Local development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

本資料は調査対象リポジトリの 2026-08-07 時点の `develop` ブランチ（commit `e33b41b`）を実装根拠とし、2026-08-13 時点の各プロダクトの公式ドキュメントで仕様を再確認しています。各スライドの発表者ノートに出典を記載しています。
