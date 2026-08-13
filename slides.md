---
theme: default
title: AIエージェントの作り方 — A0005が採用した2つの実装方式
info: |
  参照実装 A0005 を題材に、AI SDK ToolLoopAgent と Claude Agent SDK による2つの構築経路を手順から解説する。
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
  <div class="muji-eyebrow mb-4">参照実装から学ぶ</div>
  <h1>AIエージェントの<br>作り方</h1>
  <div class="muji-red-rule mt-7"></div>
  <p class="mt-6 text-xl max-w-[50rem]">
    A0005が採用した ToolLoopAgent と Claude Agent SDK<br>
    <span class="text-base text-[#6d6d72]">設計・実装・選択を、ひとつの流れで理解する</span>
  </p>
</div>

<div class="muji-meta">A0005を題材にしたアーキテクチャ解説</div>

</div>

<!--
外部の開発者が、エージェントの構成要素、共通の作成手順、2方式の違いと選択基準を理解するための資料。

[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">なぜエージェントを作るのか</div>

# 次の一手を固定できない仕事で<br>エージェントを検討する

<div class="grid grid-cols-2 gap-12 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">手順を先に書ける</div>
  <div class="text-2xl font-bold mt-3">明示ワークフロー</div>
  <p class="mt-4">可能な経路・分岐・失敗時の処理をアプリで定義できる。信頼性と再現性を優先する仕事に向く。</p>
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 mt-6 text-center">
    <div class="muji-arch-box">入力</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">決めた処理</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">結果</div>
  </div>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">途中結果で選び直す</div>
  <div class="text-2xl font-bold mt-3">エージェント</div>
  <p class="mt-4">モデルがtool結果を見て、次の操作や完了を判断する。経路を事前に列挙し切れない仕事に向く。</p>
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto] items-center gap-3 mt-6 text-center">
    <div class="muji-arch-box">モデル</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">tool</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">結果</div><div class="muji-arch-arrow">↺</div>
  </div>
</div>

</div>

<div class="muji-callout mt-8"><strong>固定手順で目的を満たせるなら、まずワークフロー。</strong><span class="muji-small ml-2">エージェント化自体を目的にしない。</span></div>

<!--
[Sources]
- https://ai-sdk.dev/docs/agents/overview
- https://ai-sdk.dev/docs/agents/workflows
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">自律性の境界</div>

# 違うのはAPIの能力ではなく、制御を置く場所

<div class="grid grid-cols-2 gap-12 mt-7">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">アプリが進行を制御</div>
  <div class="text-2xl font-bold mt-3">明示ワークフロー</div>
  <div class="muji-small mt-2">例: <code>generateText</code> / <code>streamText</code>を順次・並列に構成</div>
  <ul class="mt-4">
    <li>可能な経路と分岐をコードで定義する</li>
    <li>retry・fallback・業務状態遷移を明示する</li>
    <li>経路内の分類・評価はLLMにも任せられる</li>
  </ul>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">開発者の境界内でモデルが選択</div>
  <div class="text-2xl font-bold mt-3">モデル主導 agent loop</div>
  <div class="muji-small mt-2">例: <code>ToolLoopAgent</code> / Claude Agent SDK / core functions + <code>stopWhen</code></div>
  <ul class="mt-4">
    <li>モデルがtoolを選択する</li>
    <li>結果をcontextへ戻し、次を再判断する</li>
    <li>開発者がtools・承認・停止条件を制約する</li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-7"><strong>API名だけでは決まらない。</strong><span class="muji-small ml-2"><code>generateText</code> / <code>streamText</code>もmulti-stepや手動loopに使える。違いは誰が制御を書くか。</span></div>
<div class="mt-4 text-[#6d6d72]"><strong>A0005の2経路はいずれもagent loop。</strong> 以降は、そのloopと作業環境をどこに置くかを比較する。</div>

<!--
[Sources]
- https://ai-sdk.dev/docs/agents/overview
- https://ai-sdk.dev/docs/agents/workflows
- https://ai-sdk.dev/docs/agents/loop-control
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">最初に押さえること</div>

# この資料では、6つの観点で整理する

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
- https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">参照実装に見る2方式</div>

# 同じチャット画面でも、送信後の経路が違う

<div class="muji-arch-entry mt-5"><strong>チャット画面</strong><span>→</span><code>selectedAgent</code></div>

<div class="grid grid-cols-[auto_1fr] gap-x-7 gap-y-5 items-center mt-5">
  <div class="muji-arch-index">A</div>
  <div class="grid grid-cols-[1fr_auto_1fr_auto_1.15fr] items-stretch gap-3">
    <div class="muji-arch-box">Next.js 共通Route</div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box"><strong>ToolLoopAgent</strong></div><div class="muji-arch-arrow">→</div>
    <div class="muji-arch-box">MCP・Skills・業務tools</div>
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

# A0005では「共通Route」か「実行環境ごと包む」か

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

# SkillsやBashは、接続方法と権限境界まで設計する

<div class="grid grid-cols-3 gap-7 mt-9">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">スキル</div>
  <div class="text-lg font-bold mt-3">手順と補助資源</div>
  <p class="muji-small mt-3">SKILL.mdを中心に、references・assets・任意のscriptsを必要時に使う。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">ツール</div>
  <div class="text-lg font-bold mt-3">操作の入口</div>
  <p class="muji-small mt-3">検索、更新、ファイル操作、コード実行を型付きで公開する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">隔離と認可</div>
  <div class="text-lg font-bold mt-3">別々の安全境界</div>
  <p class="muji-small mt-3">microVMはセッション間を隔離する。AWS資源への操作可否はIAMで別に狭める。</p>
</div>

</div>

<div class="muji-callout mt-9">
  <strong>PermissionはSandboxではない。SandboxもAWS資源への認可を代替しない。</strong>
  <div class="muji-small mt-1">参照commitのA方式はSkills / MCPまで。汎用BashやSandboxは未接続。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/skills/skillTool.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://ai-sdk.dev/cookbook/guides/agent-skills
- https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#experimental-sandbox
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html
-->

---
layout: section
---

<div class="muji-kicker mb-6">作り方 A</div>

# Webアプリの中に<br>エージェントを追加する

<p class="muji-lead mt-7">AI SDK ToolLoopAgentを使い、共通Routeへ差分を宣言する。</p>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">作り方Aの全体像</div>

# 5つの作業で、既存チャットへ新しい役割を足す

<div class="grid grid-cols-5 gap-4 mt-10">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">1</div><div class="font-bold mt-3">IDと役割</div><p class="muji-small mt-2">識別子と公開範囲</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">2</div><div class="font-bold mt-3">指示</div><p class="muji-small mt-2">promptと知識</p></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">3</div><div class="font-bold mt-3">ツール</div><p class="muji-small mt-2">MCP・Skills・必要な操作</p></div>
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
  <p class="muji-small mt-3">prompt、tool接続、表示・保存方式、テレメトリなどを宣言する。</p>
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
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-label">拡張例</div><div class="font-bold mt-2">隔離先</div><p class="muji-small mt-2">参照commitでは未接続</p></div>
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
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">toolApproval</div><div class="muji-small">policy指定の対象だけ止める。参照実装はtool名で判定</div></div>
</div>

</div>

<!--
[Sources]
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/_utils/hitlUtils.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A4 · UIと状態</div>

# 共通Routeが、エージェントの外側を引き受ける

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">認証・認可</div><div class="muji-step-text">Routeはagentの有効・権限を確認。tool側もMCP・Lambda・IAMで検証。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">ストリーミング</div><div class="muji-step-text">テキスト、tool call、進捗をUIへ変換。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">会話履歴</div><div class="muji-step-text">過去のmessagesを次の実行へ戻す。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">承認対象tool</div><div class="muji-step-text">policy指定のtoolを止める。参照実装の既定判定はtool名heuristic。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">成果物</div><div class="muji-step-text">生成ファイルや参照情報を会話へ紐づける。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">✓</div><div><div class="muji-step-title">観測</div><div class="muji-step-text">model、tool、usage、失敗を同じ形式で記録。</div></div></div>
</div>

<div class="muji-panel-kinari mt-7"><strong>新しいエージェントほど、業務差分だけに集中できる。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/_utils/hitlUtils.ts
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 A5 · 実行環境</div>

# Bashは、実行先へ明示的に委譲する

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">1</div>
  <div class="text-xl font-bold mt-3">ローカルツール</div>
  <p class="muji-small mt-3">小さく決定的な処理。ホスト上で動くため、Sandboxではない。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">2</div>
  <div class="text-xl font-bold mt-3">Vercel Sandbox <span class="muji-small">拡張</span></div>
  <p class="muji-small mt-3">Firecracker microVMへ委譲。既定の外向き通信は開いているためpolicyで狭める。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-number">3</div>
  <div class="text-xl font-bold mt-3">Code Interpreter <span class="muji-small">拡張</span></div>
  <p class="muji-small mt-3">コード実行をtool APIとして接続。session・IAM・時間上限を別に設計する。</p>
</div>

</div>

<div class="muji-callout mt-9">
  <strong>AI SDKのexperimental_sandboxは委譲契約であり、隔離実装そのものではない。</strong>
  <div class="muji-small mt-1">参照commitではVercel Sandbox / Code Interpreterのどちらも未接続。</div>
</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#experimental-sandbox
- https://vercel.com/docs/sandbox
- https://vercel.com/changelog/advanced-egress-firewall-filtering-for-vercel-sandbox
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

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/agent.py
- https://code.claude.com/docs/en/agent-sdk/hosting
-->

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

```py {3-15}
# 実装抜粋（要約）
options = ClaudeAgentOptions(
    model=model_id,
    system_prompt={
        "type": "preset", "preset": "claude_code",
        "append": build_prompt(session_id),
    },
    setting_sources=["project"],
    skills=["s3-upload"],
    permission_mode="default",
    disallowed_tools=["WebFetch"],
    can_use_tool=make_can_use_tool(
        session_id, web_search_always_hitl=True,
    ),
    cwd="/app",
)
```

<div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">model / prompt</div><div class="muji-small">役割と判断規則</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">settings / skills</div><div class="muji-small">project設定と専門手順を読み込む</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">permissions</div><div class="muji-small">allow・deny・人への確認</div></div>
  <div class="border-t border-[#3c3c43] py-4"><div class="font-bold">cwd / container</div><div class="muji-small">作業場所と依存環境</div></div>
</div>

</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/agent.py
- https://code.claude.com/docs/en/agent-sdk/python
- https://code.claude.com/docs/en/agent-sdk/permissions
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B3 · 能力</div>

# 組み込みの作業道具を、同じ環境で使う

<div class="grid grid-cols-3 gap-7 mt-8">

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">参照実装 · 組み込み</div>
  <div class="text-xl font-bold mt-3">Read · Edit · Write<br>Glob · Grep · Bash</div>
  <p class="muji-small mt-3">同じファイルシステムを見ながら、調査と変更を反復する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">参照実装 · 接続</div>
  <div class="text-xl font-bold mt-3">Skills · MCP<br>Session · Streaming</div>
  <p class="muji-small mt-3">手順・外部能力・会話継続・イベントをRuntimeへ配線する。</p>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">SDK拡張 · 未設定</div>
  <div class="text-xl font-bold mt-3">Custom subagents · Hooks<br>max_turns · max_budget_usd</div>
  <p class="muji-small mt-3">SDKが提供していても、参照実装で設定済みとは限らない。</p>
</div>

</div>

<div class="muji-callout mt-9"><strong>「SDKが対応」と「この実装で設定済み」を分けて読む。</strong></div>

<!--
[Sources]
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/skills
- https://code.claude.com/docs/en/agent-sdk/subagents
- https://code.claude.com/docs/en/agent-sdk/hooks
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
    <ul><li>認証トークン</li><li>session ID（所有者照合が必要）</li><li>ユーザー入力・添付・trace ID</li></ul>
  </div>
  <div>
    <div class="muji-label mb-3">UIへ戻す</div>
    <ul><li>テキストと推論の進捗</li><li>tool callと承認要求</li><li>成果物・エラー・完了状態</li></ul>
  </div>
</div>

<div class="muji-panel-kinari mt-7"><strong>参照実装はsession所有者照合が未実装。</strong><span class="muji-small ml-2">検証済みuserとのBackend照合は本番化の必須差分。</span></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/(authenticated)/(chat)/_utils/chatTransport/chatTransport.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/general-agent/transport.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/runtime_app.py
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/auth.py
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/session_store.py
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">手順 B5 · 公開と運用</div>

# 実行環境ごと、ひとつのサービスとして公開する

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">01</div><div><div class="muji-step-title">固定範囲を明示</div><div class="muji-step-text">base image・CLI・Claude SDKは固定。他のPython依存はrange指定で、lockは別途必要。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">02</div><div><div class="muji-step-title">権限を最小化</div><div class="muji-step-text">隔離に頼らず、IAM・MCP・S3・egressを必要範囲へ閉じる。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">03</div><div><div class="muji-step-title">状態を分けて保存</div><div class="muji-step-text">会話transcriptと作業ファイル・成果物を別々に外部化。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">04</div><div><div class="muji-step-title">失敗を設計</div><div class="muji-step-text">再送、重複、中断、reconnect、timeoutを扱う。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">05</div><div><div class="muji-step-title">観測する</div><div class="muji-step-text">model、tool、session、Runtimeを同じtraceで追う。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">06</div><div><div class="muji-step-title">段階公開</div><div class="muji-step-text">専用URLと権限を設定し、画面から疎通確認する。</div></div></div>
</div>

<div class="muji-callout mt-5"><strong>microVM隔離 ≠ AWS認可。session所有者と実行roleの両方を狭める。</strong></div>

<!--
[Sources]
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html
- https://code.claude.com/docs/en/agent-sdk/hosting
- https://code.claude.com/docs/en/agent-sdk/secure-deployment
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/requirements.txt
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/terraform/modules/agentcore/runtime_container/main.tf
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
    <li>Skills・組み込みtools・sessionを一体で使う</li>
    <li>60分以内のstateful streamを専用基盤へ閉じたい</li>
  </ul>
</div>

<div>
  <div class="muji-label mb-3">設計上の注意</div>
  <ul>
    <li>コンテナとSDK依存を更新し続ける</li>
    <li>Webアプリとは別に認可と監視を揃える</li>
    <li>イベントをUI形式へ変換する</li>
    <li>60分超・切断復帰にはasync・checkpoint・reconnectを足す</li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-8"><strong>「専用の作業場を持つ価値があるか」で選ぶ。</strong></div>

<!--
[Sources]
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/hosting
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-how-it-works.html
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/general-agent/transport.ts
-->

---
layout: section
---

<div class="muji-kicker mb-6">選び方</div>

# 能力の有無ではなく<br>責任の置き場所で選ぶ

<p class="muji-lead mt-7">A0005が採用した2経路を比較する。AI SDK 7のWorkflowAgent / HarnessAgentは対象外。</p>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
- https://vercel.com/blog/ai-sdk-7
-->

---
layout: default
class: compact-matrix
---

<div class="muji-eyebrow mb-3">2方式の比較</div>

# A0005の違いは、責任の置き場所に現れる

| 観点 | ToolLoopAgent方式 | Claude Agent SDK方式 |
|---|---|---|
| ループを持つ場所 | Webアプリの共通Route | 専用の実行基盤 |
| Skills | 読み込みツールで利用 | SDKのSkills機能で利用 |
| Bash・ファイル | 実行toolを別途接続<br>参照実装は未接続 | 組み込みツールとして利用 |
| UI・保存・承認 | 共通Routeを再利用 | custom transportと保存を配線 |
| 状態 | messages＋外部store<br>作業fileは別設計 | S3 transcript<br>作業fileは別設計 |
| 公開単位 | Webアプリ | 実行基盤＋Web接続 |
| 得意な仕事 | 共通Routeに統合する専門対話 | 60分stream内のstatefulな作業 |

<div class="muji-callout mt-5"><strong>左は「能力を接続」、右は「能力を同梱」。耐久性は別の設計軸。</strong></div>

<!--
[Sources]
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://ai-sdk.dev/cookbook/guides/agent-skills
- https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#experimental-sandbox
- https://vercel.com/blog/ai-sdk-7
- https://code.claude.com/docs/en/agent-sdk/overview
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/session_store.py
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">判断の順序</div>

# 3つの質問に、上から答える

<div class="grid grid-cols-3 gap-6 mt-8">
  <div class="muji-decision-card">
    <div class="muji-number">1</div>
    <div class="muji-label mt-3">共通Route</div>
    <div class="font-bold mt-2">認可・保存・承認を<br>そのまま再利用できるか</div>
    <div class="muji-decision-result"><span>はい</span> ToolLoopAgent方式</div>
  </div>
  <div class="muji-decision-card">
    <div class="muji-number">2</div>
    <div class="muji-label mt-3">作業環境</div>
    <div class="font-bold mt-2">作業環境をloopと<br>一体で運用するか</div>
    <div class="muji-decision-result"><span>はい</span> Claude Agent SDK方式</div>
  </div>
  <div class="muji-decision-card">
    <div class="muji-number">3</div>
    <div class="muji-label mt-3">耐久性</div>
    <div class="font-bold mt-2">60分超・切断復帰が<br>必要か</div>
    <div class="muji-decision-result"><span>はい</span> WorkflowAgent / async</div>
  </div>
</div>

<div class="muji-panel-kinari mt-7 text-center"><strong>ToolLoopAgentもRuntime streamも自動的にはdurableでない。</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/app/api/chat/histories/%5BhistoryId%5D/agent/route.ts
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/general-agent/transport.ts
- https://vercel.com/blog/ai-sdk-7
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
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
  <p class="muji-small mt-3">処理単位なら実行tool。継続workspaceならOffice依存を備えた専用基盤。</p>
  <div class="muji-token mt-4">要件次第</div>
</div>

<div class="border-t border-[#3c3c43] pt-5">
  <div class="muji-label">例3</div>
  <div class="text-xl font-bold mt-3">複数ファイルの調査・修正</div>
  <p class="muji-small mt-3">Read・Grep・Edit・Bashを使い、stream内でstatefulに反復する。</p>
  <div class="muji-token mt-4">Claude Agent SDK</div>
</div>

</div>

<div class="muji-callout mt-8"><strong>参照B実装はOffice依存とstream reconnectを未実装。</strong><span class="muji-small ml-2">60分を超えるならasync化する。</span></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/frontend/lib/general-agent/transport.ts
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
-->

---
layout: default
---

<div class="muji-eyebrow mb-3">公開前の確認</div>

# 仕事を、安全に完了できるかを見る

<div class="grid grid-cols-2 gap-x-10 gap-y-4 mt-7">
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">役割と非対応範囲</div><div class="muji-step-text">何を任せ、何を断るかが明確か。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">tool schema</div><div class="muji-step-text">入力が狭く、命名がモデルに伝わるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">承認・所有者・権限</div><div class="muji-step-text">副作用前で止まり、session・成果物・AWS権限を照合するか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">停止と予算</div><div class="muji-step-text">SDK機能の列挙でなく、実装にstep・時間・費用上限があるか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">再送と中断</div><div class="muji-step-text">冪等性、reconnect、checkpoint、async復帰を確認したか。</div></div></div>
  <div class="muji-step"><div class="muji-step-index">□</div><div><div class="muji-step-title">観測と評価</div><div class="muji-step-text">tool、失敗、usage、成果を追跡できるか。</div></div></div>
</div>

<div class="muji-panel-kinari mt-7"><strong>完了条件 = 回答 + tool実行 + 安全な失敗 + 再現可能な運用</strong></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/.claude/rules/agent-capability-matrix.md
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://code.claude.com/docs/en/agent-sdk/overview
- https://code.claude.com/docs/en/agent-sdk/secure-deployment
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
-->

---
layout: default
class: closing-slide
---

<div class="muji-kicker mb-7">まとめ</div>

# エージェントは<br>必要な仕事だけに使う

<div class="grid grid-cols-3 gap-6 mt-10 max-w-[59rem]">
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">1</div><div class="font-bold mt-2">経路を定義できるなら明示ワークフロー</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">2</div><div class="font-bold mt-2">次の一手を任せるなら制約付きagent loop</div></div>
  <div class="border-t border-[#3c3c43] pt-4"><div class="muji-number">3</div><div class="font-bold mt-2">A0005では共通Routeか作業環境かで方式を選ぶ</div></div>
</div>

<div class="muji-meta mt-10">長時間・中断耐性は、Workflow / asyncで別に設計する</div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
- https://ai-sdk.dev/docs/agents/overview
- https://ai-sdk.dev/docs/agents/workflows
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://vercel.com/blog/ai-sdk-7
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
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5">調査対象commit</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/documents/%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%88%E8%BF%BD%E5%8A%A0%E6%89%8B%E9%A0%86%E3%82%AC%E3%82%A4%E3%83%89.md">エージェント追加手順ガイド</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/general-agent/README.md">General Agent Runtime仕様</a></li>
    <li><a href="https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/auth.py">session IDの信頼境界</a></li>
  </ul>
</div>

<div>
  <div class="muji-label mb-2">公式ドキュメント</div>
  <ul class="muji-source-list">
    <li><a href="https://ai-sdk.dev/docs/agents/overview">AI SDK · Agents / Structured Workflows</a></li>
    <li><a href="https://ai-sdk.dev/docs/agents/workflow-agent">AI SDK · ToolLoopAgent / WorkflowAgent</a></li>
    <li><a href="https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx">Agent Skills仕様</a></li>
    <li><a href="https://code.claude.com/docs/en/agent-sdk/secure-deployment">Claude Agent SDK · Secure Deployment</a></li>
    <li><a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html">AgentCore Runtime · Security</a></li>
    <li><a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html">AgentCore Runtime · Quotas</a></li>
  </ul>
</div>

</div>

<div class="muji-panel-kinari mt-7"><div class="muji-small">対象: <code>develop@e33b41bea233d00e4c6b92da024e12cc412abcf5</code> · 公式docs再確認: 2026-08-13</div></div>

<!--
[Sources]
- https://github.com/mhigroup/A0005-AI-Workspace/tree/e33b41bea233d00e4c6b92da024e12cc412abcf5
- https://github.com/mhigroup/A0005-AI-Workspace/blob/e33b41bea233d00e4c6b92da024e12cc412abcf5/runtime/shared/chat/auth.py
- https://ai-sdk.dev/docs/agents/overview
- https://ai-sdk.dev/docs/agents/workflows
- https://ai-sdk.dev/docs/agents/workflow-agent
- https://vercel.com/blog/ai-sdk-7
- https://ai-sdk.dev/docs/reference/ai-sdk-core/tool-loop-agent
- https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- https://code.claude.com/docs/en/agent-sdk/secure-deployment
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-security-best-practices.html
- https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/bedrock-agentcore-limits.html
-->
