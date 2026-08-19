# AIエージェントの作り方

社内AIワークスペースの参照実装を題材に、エージェントを使う判断基準と、AI SDK `ToolLoopAgent` / Claude Agent SDK の2つの構築経路を、動く様子と実物のコードから整理した Slidev 資料です。AI SDK 7 の `WorkflowAgent` / `HarnessAgent` を含む網羅比較ではありません。

構成: ループが回る実況 → 定義（ワークフローとの違い）→ 6観点 → 作り方A（共通Route + ToolLoopAgent）→ 作り方B（AgentCore Runtime + Claude Agent SDK）→ 選び方 → 参照実装の現在地。発表30分・全17枚。

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

本資料は参照実装リポジトリの 2026-08-07 時点の `develop` ブランチ（commit `e33b41b`）を実装根拠とし、2026-08-13 時点の各プロダクトの公式ドキュメントで仕様を再確認しています。各スライドの発表者ノートに出典を記載しています（`repo:` 表記は参照実装リポジトリ内のパス）。
