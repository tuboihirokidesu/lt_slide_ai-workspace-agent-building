---
theme: default
title: AIエージェントの作り方 — 2つの実装方式
info: |
  公開実装を題材に、AI SDK ToolLoopAgent と Claude Agent SDK によるエージェント構築を手順から解説する。
transition: none
mdc: true
fonts:
  sans: 'Noto Sans JP'
  mono: 'JetBrains Mono'
  webfonts:
    - 'Noto Sans JP'
    - 'JetBrains Mono'
  weights: '400,500,600,700'
  provider: 'google'
highlighter: shiki
layout: cover
---

<div class="flex h-full flex-col justify-between">

<div class="flex items-center justify-between">
  <div class="muji-kicker">AIエージェント開発</div>
  <div class="muji-meta">2026 · 08 · TSUBOI HIROKI</div>
</div>

<div>
  <div class="muji-eyebrow mb-4">公開実装から学ぶ</div>
  <h1>AIエージェントの<br>作り方</h1>
  <div class="muji-red-rule mt-7"></div>
  <p class="mt-6 text-xl max-w-[50rem]">
    ToolLoopAgent と Claude Agent SDK<br>
    <span class="text-base text-[#6d6d72]">設計・実装・選択を、ひとつの流れで理解する</span>
  </p>
</div>

<div class="muji-meta">公開リポジトリを題材にしたアーキテクチャ解説</div>

</div>

<!--
外部の開発者が、エージェントの構成要素、共通の作成手順、2方式の違いと選択基準を理解するための資料。

[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">この資料でわかること</div>

# 「何を作るか」から「どう選ぶか」まで持ち帰る

<div class="grid grid-cols-3 gap-7 mt-9">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">1</div>
  <div class="text-xl font-bold mt-3">設計する</div>
  <p class="text-sm text-[#6d6d72] mt-2">役割・知識・ツール・安全策を、実装前に定義する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">2</div>
  <div class="text-xl font-bold mt-3">組み立てる</div>
  <p class="text-sm text-[#6d6d72] mt-2">2つの方式それぞれで、動くところまで配線する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">3</div>
  <div class="text-xl font-bold mt-3">選択する</div>
  <p class="text-sm text-[#6d6d72] mt-2">要件に合う実行方式を、能力ではなく責任で選ぶ。</p>
</div>

</div>

<div class="muji-callout mt-10">
  <div class="text-lg font-bold">対象は、チャット画面から利用する業務エージェント。</div>
  <div class="muji-small mt-1">専門知識を使い、必要に応じて外部システムやファイルを操作する。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">最初に押さえること</div>

# エージェントは、6つの要素で作る

<div class="grid grid-cols-3 gap-x-8 gap-y-8 mt-8">

<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">役割</div><div class="font-bold mt-2">何を任せるか</div><p class="muji-small mt-2">目的、対象利用者、対応しない範囲</p></div>
<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">指示</div><div class="font-bold mt-2">どう振る舞うか</div><p class="muji-small mt-2">判断規則、出力形式、対話方針</p></div>
<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">知識</div><div class="font-bold mt-2">何を参照するか</div><p class="muji-small mt-2">RAG、添付、メモリ、Skills</p></div>
<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">ツール</div><div class="font-bold mt-2">何を実行できるか</div><p class="muji-small mt-2">検索、更新、ファイル、コード実行</p></div>
<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">ループ</div><div class="font-bold mt-2">いつ考え直すか</div><p class="muji-small mt-2">tool → result → 再判断 → 完了</p></div>
<div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">安全と運用</div><div class="font-bold mt-2">どう制御するか</div><p class="muji-small mt-2">認可、承認、状態、監視、失敗処理</p></div>

</div>

<blockquote class="mt-8"><p>SDKを選ぶ前に、この6項目を言葉にする。</p></blockquote>

<!--
[Sources]
- https://ai-sdk.dev/docs/agents/building-agents
- https://code.claude.com/docs/en/agent-sdk/overview
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">共通の作成手順</div>

# どちらの方式でも、作る順番は同じ

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">01</div><div><div class="muji-step-title">役割と完了条件を決める</div><div class="muji-step-text">誰の、どの仕事を、どの状態まで進めるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">02</div><div><div class="muji-step-title">指示と知識を用意する</div><div class="muji-step-text">system prompt、RAG、Skills、添付を設計。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">03</div><div><div class="muji-step-title">ツールを選ぶ</div><div class="muji-step-text">既存ツールを優先し、必要な操作だけ公開。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">04</div><div><div class="muji-step-title">ループと停止条件を作る</div><div class="muji-step-text">再判断、承認、最大ステップ、終了条件。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">05</div><div><div class="muji-step-title">UIと状態をつなぐ</div><div class="muji-step-text">ストリーム、会話履歴、実行中状態、成果物。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">06</div><div><div class="muji-step-title">安全に公開する</div><div class="muji-step-text">権限、監視、失敗、再送、評価を確認。</div></div></div>
</div>

<div class="muji-panel-kinari mt-7"><strong>2方式の違いは、手順3〜5をどこに置くか。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">公開実装に見る2方式</div>

# 同じチャット画面でも、送信後の経路が違う

<div class="muji-arch-entry mt-5"><strong>チャット画面</strong><span>→</span><code>selectedAgent</code></div>

<div class="grid grid-cols-[auto_1fr] gap-x-7 gap-y-5 items-center mt-5">
  <div class="muji-arch-index">A</div>
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1.15fr] items-stretch gap-3">
    <div class="muji-arch-box">Next.js 共通Route</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box"><strong>ToolLoopAgent</strong></div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">MCP・Skills・Sandbox</div>
  </div>
  <div class="muji-arch-index">B</div>
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1.15fr] items-stretch gap-3">
    <div class="muji-arch-box">実行基盤を直接呼び出す</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">AgentCore Runtime</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box"><strong>Claude Agent SDK</strong></div>
  </div>
</div>

<div class="grid grid-cols-2 gap-8 mt-7">
  <div class="muji-callout"><strong>A:</strong> Webアプリがエージェントを組み立てる。</div>
  <div class="muji-callout"><strong>B:</strong> 専用の実行基盤がエージェントを内包する。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/(authenticated)/(chat)/_utils/chatTransport/chatTransport.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/agent.py
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">違いをひと言で</div>

# 「アプリで組み立てる」か「実行環境ごと包む」か

<div class="grid grid-cols-2 gap-10 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">A</div>
  <div class="text-2xl font-bold mt-3">ToolLoopAgent方式</div>
  <p class="mt-4">Next.jsがループを持ち、prompt・tools・Skillsをリクエスト時に組み立てる。</p>
  <div class="muji-panel-kinari mt-5"><strong>Webアプリ中心</strong><br><span class="muji-small">既存UIと運用機能を再利用しやすい</span></div>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">B</div>
  <div class="text-2xl font-bold mt-3">Claude Agent SDK方式</div>
  <p class="mt-4">専用の実行基盤がループと作業環境を持ち、ファイルやコマンドを一体で扱う。</p>
  <div class="muji-panel mt-5"><strong>実行環境中心</strong><br><span class="muji-small">作業用の環境をエージェントへ同梱しやすい</span></div>
</div>

</div>

<!--
[Sources]
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://code.claude.com/docs/en/agent-sdk/overview
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">誤解しやすいポイント</div>

# SkillsもBashも、どちらの方式からでも利用できる

<div class="grid grid-cols-3 gap-7 mt-9">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">スキル</div>
  <div class="text-lg font-bold mt-3">仕事の手順書</div>
  <p class="muji-small mt-3">必要なときだけ指示を読み込み、判断の仕方を変える。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">ツール</div>
  <div class="text-lg font-bold mt-3">操作の入口</div>
  <p class="muji-small mt-3">検索、更新、ファイル操作、コード実行を型付きで公開する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">隔離環境・実行基盤</div>
  <div class="text-lg font-bold mt-3">安全な作業場所</div>
  <p class="muji-small mt-3">Bashやライブラリを、隔離された環境の中で実行する。</p>
</div>

</div>

<div class="muji-callout mt-9">
  <strong>ToolLoopAgentにも、Skillを読むツールとSandboxを接続できる。</strong>
  <div class="muji-small mt-1">Claude Agent SDKでは、作業環境として一体化されている。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/skills/skillTool.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://ai-sdk.dev/cookbook/guides/agent-skills
- https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox
- https://vercel.com/changelog/use-skills-in-your-ai-sdk-agents-via-bash-tool
-->

---
layout: section
---

<div class="muji-kicker mb-6">作り方 A</div>

# Webアプリの中に<br>エージェントを追加する

<p class="muji-lead mt-7">AI SDK ToolLoopAgentを使い、共通Routeへ差分を宣言する。</p>

---
layout: default
---

<div class="muji-eyebrow mb-3">作り方Aの全体像</div>

# 5つの作業で、既存チャットへ新しい役割を足す

<div class="grid grid-cols-5 gap-4 mt-10">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">1</div><div class="font-bold mt-3">IDと役割</div><p class="muji-small mt-2">識別子と公開範囲</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">2</div><div class="font-bold mt-3">指示</div><p class="muji-small mt-2">promptと知識</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">3</div><div class="font-bold mt-3">ツール</div><p class="muji-small mt-2">MCP・Skills・実行環境</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">4</div><div class="font-bold mt-3">ループ</div><p class="muji-small mt-2">停止と承認</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">5</div><div class="font-bold mt-3">公開</div><p class="muji-small mt-2">表示・権限・テスト</p></div>
</div>

<div class="muji-panel-kinari mt-10">
  <div class="text-lg font-bold">共通Routeは変更せず、エージェント定義を追加する。</div>
  <div class="muji-small mt-1">ストリーム、保存、認可、承認、観測は既存の仕組みを再利用する。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A1 · 定義</div>

# ID・振る舞い・公開設定を分けて持つ

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">識別子</div>
  <div class="text-xl font-bold mt-3"><code>AGENT_IDS</code></div>
  <p class="muji-small mt-3">リクエストと型が共有する、エージェント名の正規リスト。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">振る舞い</div>
  <div class="text-xl font-bold mt-3"><code>AGENT_REGISTRY</code></div>
  <p class="muji-small mt-3">prompt、tools、モデル、テレメトリなどを宣言する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">公開設定</div>
  <div class="text-xl font-bold mt-3">公開データ</div>
  <p class="muji-small mt-3">表示名、有効・無効、利用権限を運用データとして管理する。</p>
</div>

</div>

<div class="muji-callout mt-9"><strong>型は実装漏れを止め、データは公開範囲を制御する。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/agentRegistry.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A2 · 指示とツール</div>

# エージェント固有の差分を、ツールとしてまとめる

<div class="grid grid-cols-4 gap-5 mt-8">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">ローカル</div><div class="font-bold mt-2">TypeScriptツール</div><p class="muji-small mt-2">軽い計算や変換</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">MCP</div><div class="font-bold mt-2">外部ツール</div><p class="muji-small mt-2">RAG・業務システム</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">スキル</div><div class="font-bold mt-2">手順の読み込み</div><p class="muji-small mt-2">専門手順を必要時に読む</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">実行環境</div><div class="font-bold mt-2">隔離環境</div><p class="muji-small mt-2">ファイル・コード実行</p></div>
</div>

<div class="mt-9 px-6 py-5 bg-[#f4eede] border border-[#e0ceaa]">
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center text-center gap-5">
    <div><strong>選ぶ</strong><br><span class="muji-small">必要な能力だけ</span></div>
    <div class="text-[#7f0019] text-2xl">→</div>
    <div><strong>包む</strong><br><span class="muji-small">承認・表示・計測</span></div>
    <div class="text-[#7f0019] text-2xl">→</div>
    <div><strong>渡す</strong><br><span class="muji-small">ToolLoopAgentへ</span></div>
  </div>
</div>

<blockquote class="mt-8"><p>新しい能力を作る前に、既存のtoolとSkillを探す。</p></blockquote>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/_utils/tools.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/skills/skillTool.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A3 · ループ</div>

# ToolLoopAgentに進め方と停止条件を渡す

<div class="grid grid-cols-[1.15fr_0.85fr] gap-9 mt-5">

```ts {2,4,5,6,7,8}
const agent = new ToolLoopAgent({
  id: agentId,
  model,
  instructions,
  tools,
  stopWhen: isStepCount(10),
  toolApproval: approvalPolicy,
  onStepEnd: observeStep,
})
```

<div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">instructions</div><div class="muji-small">役割と判断規則</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">tools</div><div class="muji-small">実行可能な操作の集合</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">stopWhen</div><div class="muji-small">暴走を防ぐ上限</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">toolApproval</div><div class="muji-small">副作用の前で人に戻す</div></div>
</div>

</div>

<!--
[Sources]
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A4 · UIと状態</div>

# 共通Routeが、エージェントの外側を引き受ける

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">認証・認可</div><div class="muji-step-text">誰が、どのエージェントとtoolを使えるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">ストリーミング</div><div class="muji-step-text">テキスト、tool call、進捗をUIへ変換。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">会話履歴</div><div class="muji-step-text">過去のmessagesを次の実行へ戻す。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">承認</div><div class="muji-step-text">破壊的操作を止め、継続入力を受け取る。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">成果物</div><div class="muji-step-text">生成ファイルや参照情報を会話へ紐づける。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">観測</div><div class="muji-step-text">model、tool、usage、失敗を同じ形式で記録。</div></div></div>
</div>

<div class="muji-panel-kinari mt-7"><strong>新しいエージェントほど、業務差分だけに集中できる。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A5 · 実行環境</div>

# Bashは、安全な実行環境を通して使う

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">1</div>
  <div class="text-xl font-bold mt-3">ローカルツール</div>
  <p class="muji-small mt-3">小さく決定的な処理。入力を絞り、ホスト上で実行する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">2</div>
  <div class="text-xl font-bold mt-3">Vercel Sandbox</div>
  <p class="muji-small mt-3">隔離VMでBash・Files・追加ライブラリを使う。現状はiad1。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">3</div>
  <div class="text-xl font-bold mt-3">Code Interpreter</div>
  <p class="muji-small mt-3">コード実行をAPI化して接続。AgentCoreは東京リージョンに対応。</p>
</div>

</div>

<div class="muji-callout mt-9">
  <strong>ToolLoopAgentがBashを持つ必要はない。</strong>
  <span class="muji-small ml-2">Bashを実行するツールを持てばよい。</span>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/discussions/3637
- https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox
- https://vercel.com/docs/sandbox
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">完成イメージ</div>

# たとえば「社内文書検索エージェント」はこう流れる

<div class="muji-arch-lane muji-arch-lane-four mt-8">
  <div class="muji-arch-box"><span>利用者</span><br><strong>質問する</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>ToolLoopAgent</span><br><strong>検索が必要と判断</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>MCP tool</span><br><strong>根拠を取得</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>共通Route</span><br><strong>回答と出典を保存</strong></div>
</div>

<div class="grid grid-cols-3 gap-7 mt-9">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">固有に作る</div><div class="font-bold mt-2">役割・prompt・検索tool</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">共通化する</div><div class="font-bold mt-2">認可・承認・表示・保存</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">確認する</div><div class="font-bold mt-2">根拠・失敗・権限境界</div></div>
</div>

<div class="muji-panel-kinari mt-8"><strong>「専門家を足す」感覚で作れるのが、この方式の強み。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">作り方Aが向く場面</div>

# 既存プロダクトへ、専門的な役割を増やしたいとき

<div class="grid grid-cols-2 gap-10 mt-8">

<div>
  <div class="muji-label mb-3">向いている</div>
  <ul>
    <li>既存のチャットUIをそのまま使いたい</li>
    <li>認可・保存・承認・観測を共通化したい</li>
    <li>MCPやTypeScript toolsを組み合わせたい</li>
    <li>短いHTTPストリームで仕事が完結する</li>
  </ul>
</div>

<div>
  <div class="muji-label mb-3">設計上の注意</div>
  <ul>
    <li>ファイルやBashには実行toolが別途必要</li>
    <li>長い作業状態は外部ストアへ保存する</li>
    <li>toolが増えるほど権限境界を明示する</li>
    <li>Webアプリの実行時間と負荷を管理する</li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-8"><strong>「できるか」ではなく、「共通基盤に乗せる価値があるか」で選ぶ。</strong></div>

<!--
[Sources]
- https://ai-sdk.dev/docs/agents/building-agents
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
-->

---
layout: section
---

<div class="muji-kicker mb-6">作り方 B</div>

# 専用の実行基盤に<br>エージェントを構築する

<p class="muji-lead mt-7">Claude Agent SDKと作業環境を、ひとつの公開単位にまとめる。</p>

---
layout: default
---

<div class="muji-eyebrow mb-3">作り方Bの全体像</div>

# 5つの作業で、独立したエージェント実行基盤を作る

<div class="grid grid-cols-5 gap-4 mt-10">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">1</div><div class="font-bold mt-3">実行基盤</div><p class="muji-small mt-2">専用ディレクトリ</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">2</div><div class="font-bold mt-3">設定</div><p class="muji-small mt-2">モデル・指示・権限</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">3</div><div class="font-bold mt-3">能力</div><p class="muji-small mt-2">組み込み・Skills・MCP</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">4</div><div class="font-bold mt-3">接続</div><p class="muji-small mt-2">呼び出し・SSE変換</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">5</div><div class="font-bold mt-3">運用</div><p class="muji-small mt-2">コンテナ・IAM・状態</p></div>
</div>

<div class="muji-panel-kinari mt-10">
  <div class="text-lg font-bold">新しいエージェントは、新しい実行サービスに近い。</div>
  <div class="muji-small mt-1">コードだけでなく、依存・権限・ネットワーク・状態も一緒に設計する。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
- https://code.claude.com/docs/en/agent-sdk/hosting
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B1 · 実行基盤</div>

# エージェント固有と、共有基盤を分ける

<div class="grid grid-cols-[0.9fr_1.1fr] gap-10 mt-7">

```text
runtime/
├── shared/
│   └── chat/
│       ├── server_app.py
│       ├── runtime_app.py
│       ├── hitl.py
│       └── session_store.py
└── <agent>/
    ├── agent.py
    ├── system_prompt.py
    ├── .claude/settings.json
    ├── requirements.txt
    └── Dockerfile
```

<div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">共有基盤</div><div class="muji-small">HTTP入口、agent loop、承認queue、状態保存、イベント変換</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">エージェント固有</div><div class="muji-small">model、prompt、Skills、MCP、権限、依存ライブラリ</div></div>
  <div class="muji-panel-kinari mt-5"><strong>差し替えるのは設定。再実装しないのはループ。</strong></div>
</div>

</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B2 · 設定</div>

# ClaudeAgentOptionsで実行条件をまとめる

<div class="grid grid-cols-[1.1fr_0.9fr] gap-9 mt-5">

```py {2,3,4,5,6,7}
options = ClaudeAgentOptions(
    model=model_id,
    system_prompt=system_prompt,
    skills=["s3-upload"],
    mcp_servers=mcp_servers,
    permission_mode="default",
    can_use_tool=approve_tool,
    cwd="/app",
)
```

<div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">model / prompt</div><div class="muji-small">役割と判断規則</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">skills / MCP</div><div class="muji-small">専門手順と外部システム</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">permission</div><div class="muji-small">許可・拒否・人への確認</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">cwd / container</div><div class="muji-small">作業場所と依存環境</div></div>
</div>

</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/agent.py
- https://code.claude.com/docs/en/agent-sdk/overview
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B3 · 能力</div>

# 組み込みの作業道具を、同じ環境で使う

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">組み込みツール</div>
  <div class="text-xl font-bold mt-3">Read · Edit · Write<br>Glob · Grep · Bash</div>
  <p class="muji-small mt-3">同じファイルシステムを見ながら、調査と変更を反復する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">再利用する手順</div>
  <div class="text-xl font-bold mt-3">Skills · MCP<br>Subagents · Hooks</div>
  <p class="muji-small mt-3">作業方法と外部能力をRuntimeへ同梱する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">制御</div>
  <div class="text-xl font-bold mt-3">Permissions · Session<br>Streaming · Budget</div>
  <p class="muji-small mt-3">実行可否、継続、進捗、上限をアプリから管理する。</p>
</div>

</div>

<div class="muji-callout mt-9"><strong>強みは個々の機能ではなく、作業環境として統合済みであること。</strong></div>

<!--
[Sources]
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/skills
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/agent.py
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B4 · フロントエンド接続</div>

# 実行イベントを、チャットUIへ変換する

<div class="muji-arch-lane muji-arch-lane-four mt-7">
  <div class="muji-arch-box"><span>ブラウザ</span><br><strong>POST /invocations</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>AgentCore</span><br><strong>JWT・session</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>Agent SDK</span><br><strong>stream events</strong></div><div class="muji-arch-arrow">→</div>
  <div class="muji-arch-box"><span>フロントエンド</span><br><strong>UI表示用に変換</strong></div>
</div>

<div class="grid grid-cols-2 gap-9 mt-8">
  <div>
    <div class="muji-label mb-3">実行基盤へ渡す</div>
    <ul><li>認証トークン</li><li>固定したsession ID</li><li>ユーザー入力・添付・動的コンテキスト</li></ul>
  </div>
  <div>
    <div class="muji-label mb-3">UIへ戻す</div>
    <ul><li>テキストと推論の進捗</li><li>tool callと承認要求</li><li>成果物・エラー・完了状態</li></ul>
  </div>
</div>

<div class="muji-panel-kinari mt-7"><strong>エージェント専用Routeを通さない分、この変換層を明示的に作る。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/(authenticated)/(chat)/_utils/chatTransport/chatTransport.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/runtime_app.py
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B5 · 公開と運用</div>

# 実行環境ごと、ひとつのサービスとして公開する

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">01</div><div><div class="muji-step-title">コンテナを固定</div><div class="muji-step-text">CLI、Python、OS依存、ライブラリを再現可能にする。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">02</div><div><div class="muji-step-title">権限を最小化</div><div class="muji-step-text">IAM、MCP、S3、ネットワークを必要範囲へ閉じる。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">03</div><div><div class="muji-step-title">sessionを保存</div><div class="muji-step-text">会話を別ホストでも復元できるよう外部化する。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">04</div><div><div class="muji-step-title">失敗を設計</div><div class="muji-step-text">再送、重複、中断、タイムアウト、成果物を扱う。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">05</div><div><div class="muji-step-title">観測する</div><div class="muji-step-text">model、tool、session、Runtimeを同じtraceで追う。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">06</div><div><div class="muji-step-title">段階公開</div><div class="muji-step-text">専用URLと権限を設定し、画面から疎通確認する。</div></div></div>
</div>

<!--
[Sources]
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html
- https://code.claude.com/docs/en/agent-sdk/hosting
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">作り方Bが向く場面</div>

# 作業環境そのものが、エージェントの価値になるとき

<div class="grid grid-cols-2 gap-10 mt-8">

<div>
  <div class="muji-label mb-3">向いている</div>
  <ul>
    <li>複数ファイルを読み書きしながら進める</li>
    <li>Bashやライブラリを繰り返し使う</li>
    <li>Skills・subagents・hooksを一体で使う</li>
    <li>長い作業状態を専用の実行基盤へ閉じたい</li>
  </ul>
</div>

<div>
  <div class="muji-label mb-3">設計上の注意</div>
  <ul>
    <li>コンテナとSDK依存を更新し続ける</li>
    <li>Webアプリとは別に認可と監視を揃える</li>
    <li>イベントをUI形式へ変換する</li>
    <li>失敗時にどこまで再開できるかを決める</li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-8"><strong>「専用の作業場を持つ価値があるか」で選ぶ。</strong></div>

<!--
[Sources]
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/hosting
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html
-->

---
layout: section
---

<div class="muji-kicker mb-6">選び方</div>

# 能力の有無ではなく<br>責任の置き場所で選ぶ

<p class="muji-lead mt-7">両方ともTools・Skills・Bashを扱える。違うのは、それを誰が準備し運用するか。</p>

---
layout: default
class: compact-matrix
---

<div class="muji-eyebrow mb-3">2方式の比較</div>

# 違いは、ループ・作業環境・運用単位に現れる

| 観点 | ToolLoopAgent方式 | Claude Agent SDK方式 |
|---|---|---|
| ループを持つ場所 | Webアプリの共通Route | 専用の実行基盤 |
| Skills | 読み込みツールで利用 | SDKのSkills機能で利用 |
| Bash・ファイル | Sandbox等をツール接続 | 組み込みツールとして利用 |
| UI・保存・承認 | 既存アプリの共通機能 | 実行基盤向けに配線 |
| 作業状態 | メッセージと外部ストア | SDKの状態と外部ストア |
| 公開単位 | Webアプリ | 実行基盤＋Web接続 |
| 得意な仕事 | アプリに統合された専門対話 | 作業環境を使う長いタスク |

<div class="muji-callout mt-5"><strong>左は「能力を接続する」。右は「能力を同梱する」。</strong></div>

<!--
[Sources]
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://ai-sdk.dev/cookbook/guides/agent-skills
- https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox
- https://code.claude.com/docs/en/agent-sdk/overview
- https://github.com/mhigroup/A0005-AI-Workspace/discussions/3637
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">判断の順序</div>

# 3つの質問に、上から答える

<div class="grid grid-cols-3 gap-6 mt-8">
  <div class="muji-decision-card">
    <div class="muji-number">1</div>
    <div class="muji-label mt-3">共通機能</div>
    <div class="font-bold mt-2">既存UI・保存・認可を<br>最大限使いたいか</div>
    <div class="muji-decision-result"><span>はい</span> ToolLoopAgent方式</div>
  </div>
  <div class="muji-decision-card">
    <div class="muji-number">2</div>
    <div class="muji-label mt-3">作業環境</div>
    <div class="font-bold mt-2">ファイルとコマンドを<br>繰り返し使うか</div>
    <div class="muji-decision-result"><span>はい</span> Claude Agent SDK方式</div>
  </div>
  <div class="muji-decision-card">
    <div class="muji-number">3</div>
    <div class="muji-label mt-3">部分的な実行</div>
    <div class="font-bold mt-2">コード実行だけを<br>安全に外へ出したいか</div>
    <div class="muji-decision-result"><span>はい</span> ToolLoopAgent＋Sandbox</div>
  </div>
</div>

<div class="muji-panel-kinari mt-7 text-center"><strong>最初から「高機能な方」を選ばない。運用責任が最小になる方を選ぶ。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/discussions/3637
- https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">要件から選ぶ例</div>

# 仕事の形で、方式の選択は変わる

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">例1</div>
  <div class="text-xl font-bold mt-3">社内文書の検索</div>
  <p class="muji-small mt-3">RAG toolを呼び、回答と出典を既存UIへ返す。</p>
  <div class="muji-token mt-4">ToolLoopAgent</div>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">例2</div>
  <div class="text-xl font-bold mt-3">Excelの編集</div>
  <p class="muji-small mt-3">特定処理ならCode Interpreter。継続作業なら専用の実行基盤。</p>
  <div class="muji-token mt-4">ToolLoopAgent＋実行tool</div>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">例3</div>
  <div class="text-xl font-bold mt-3">複数ファイルの調査・修正</div>
  <p class="muji-small mt-3">Read・Grep・Edit・Bashを使い、長い作業を反復する。</p>
  <div class="muji-token mt-4">Claude Agent SDK</div>
</div>

</div>

<div class="muji-callout mt-8"><strong>ExcelやBashという単語だけで方式は決まらない。</strong><span class="muji-small ml-2">処理の長さと運用境界まで見る。</span></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/discussions/3637
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">公開前の確認</div>

# 仕事を、安全に完了できるかを見る

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">役割と非対応範囲</div><div class="muji-step-text">何を任せ、何を断るかが明確か。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">tool schema</div><div class="muji-step-text">入力が狭く、命名がモデルに伝わるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">承認と権限</div><div class="muji-step-text">副作用の前で止まり、権限外を拒否するか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">停止と予算</div><div class="muji-step-text">step、時間、費用、出力サイズに上限があるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">再送と中断</div><div class="muji-step-text">重複実行や途中停止で壊れないか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">観測と評価</div><div class="muji-step-text">tool、失敗、usage、成果を追跡できるか。</div></div></div>
</div>

<div class="muji-panel-kinari mt-7"><strong>完了条件 = 回答 + tool実行 + 安全な失敗 + 再現可能な運用</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/.claude/rules/agent-capability-matrix.md
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://code.claude.com/docs/en/agent-sdk/overview
-->

---
layout: default
class: closing-slide
---

<div class="muji-kicker mb-7">まとめ</div>

# エージェントは<br>仕事と責任から設計する

<div class="grid grid-cols-3 gap-6 mt-10 max-w-[59rem]">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">1</div><div class="font-bold mt-2">役割・知識・tools・安全策を先に決める</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">2</div><div class="font-bold mt-2">共通UIへ足すならToolLoopAgent</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">3</div><div class="font-bold mt-2">作業環境ごと持たせるならClaude Agent SDK</div></div>
</div>

<div class="muji-meta mt-10">能力ではなく、ループと運用責任の置き場所を選ぶ</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://code.claude.com/docs/en/agent-sdk/overview
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">参考資料</div>

# 参考資料

<div class="grid grid-cols-2 gap-10 mt-6">

<div>
  <div class="muji-label mb-2">調査対象</div>
  <ul class="muji-source-list">
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace">調査対象リポジトリ</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md">エージェント追加手順ガイド</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md">General Agent Runtime仕様</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/discussions/3637">コード実行基盤の調査</a></li>
  </ul>
</div>

<div>
  <div class="muji-label mb-2">公式ドキュメント</div>
  <ul class="muji-source-list">
    <li><a href="https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent">AI SDK · ToolLoopAgent</a></li>
    <li><a href="https://ai-sdk.dev/cookbook/guides/agent-skills">AI SDK · Agent Skills</a></li>
    <li><a href="https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox">AI SDK · Sandbox</a></li>
    <li><a href="https://code.claude.com/docs/en/agent-sdk/overview">Claude Agent SDK · Overview</a></li>
    <li><a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html">Amazon Bedrock AgentCore Runtime</a></li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-7"><div class="muji-small">調査時点: <code>develop@e33b41bea233d00e4c6b92da024e12cc412abcf5</code> · 2026-08-07</div></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://ai-sdk.dev/cookbook/guides/agent-skills
- https://ai-sdk.dev/docs/reference/ai-sdk-core/sandbox
- https://code.claude.com/docs/en/agent-sdk/overview
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html
-->
