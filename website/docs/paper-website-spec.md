# Optimized Control of Duplex Networks 论文网站设计与内容底稿

## 1. 网站总体定位与信息架构

### 总体定位
这是一个单页 scrollytelling paper website，目标不是把 PDF 平铺上网，而是把论文中的核心科学问题拆成一条可解释、可验证、可交互的认知路径：

1. 访问者先理解问题到底是什么。
2. 再理解为什么“独立求每层 minimum driver set”会带来冗余。
3. 再理解为什么“在 maximum matching 的可重配置空间里重排”能减少这种冗余。
4. 最后看到理论保证、实验结果、适用边界与现实意义。

### 页面结构
1. Hero / 首屏
2. Why This Problem Matters
3. Primer: Single-layer Structural Controllability
4. Problem Formulation
5. Key Idea of CLAP-S
6. Interactive Algorithm Demo
7. Theory Made Intuitive
8. Experimental Evidence
9. Applications and Implications
10. Limitations and Future Work
11. Resources
12. FAQ / Glossary

### 叙事节奏
- 20-30 秒：知道“这篇论文在 fixed budgets 下最小化 duplex 的 union driver set”
- 3 分钟：知道“为什么会冗余、为什么可以重排、CLAP-S 在做什么”
- 8-10 分钟：知道“公式、定理、实验、边界、意义”

---

## 2. 首页首屏的 3 组 hero 文案备选

### 方案 A：学术型
- 标题：Optimized Control of Duplex Networks
- 副标题：A matching-based framework for minimizing the union of driver nodes while preserving each layer’s minimum control budget.
- Value proposition：CLAP-S reconfigures layer-wise maximum matchings to reuse actuators across two directed layers without changing `k1` or `k2`.
- CTA 1：Read the paper
- CTA 2：Explore the algorithm

### 方案 B：科普解释型
- 标题：Two layers can each be controllable and still waste actuators together
- 副标题：This paper shows how to keep both layers minimally controllable while shrinking the number of unique nodes that must be actuated.
- Value proposition：The key is not adding more control, but rearranging maximum matchings so that the two minimum driver sets overlap more.
- CTA 1：See why redundancy happens
- CTA 2：Watch CLAP-S step by step

### 方案 C：高端视觉传播型
- 标题：Align the unmatched. Contract the union.
- 副标题：A duplex network can keep both minimal driver budgets fixed and still become cheaper to actuate through cross-layer reconfiguration.
- Value proposition：Each successful CLAP update removes two cross-layer conflicts and contracts the union driver set by exactly one node.
- CTA 1：View the demo
- CTA 2：Download PDF

---

## 3. 每个 section 的完整文案草稿

### Section 1. Hero
**Headline**
Optimized Control of Duplex Networks

**Subhead**
A matching-based framework for minimizing the union of driver nodes while preserving each layer’s minimum control budget.

**Lead**
Each layer already uses the minimum number of driver nodes implied by maximum matching. The remaining question is whether those layer-wise minimum driver sets can be better aligned so that fewer unique nodes must be actuated across the duplex.

**Support copy**
This paper answers that question in the aligned-node, uncoupled duplex setting. It introduces CLAP-S, a shortest cross-layer augmenting path search that reconfigures layer-wise maximum matchings without changing `k1` or `k2`, while provably minimizing the union driver set inside that fixed-budget feasible space.

### Section 2. Why this problem matters
**Section title**
Independent layer control creates avoidable actuator redundancy

**Lead**
In a duplex network, the same physical entities appear in both layers. If each layer independently selects one minimum driver set, the two choices can both be valid and still poorly aligned.

**Body**
That mismatch matters whenever actuation is attached to shared entities: a gene, a brain region, an account, or an institution. The engineering cost is paid in unique actuated nodes, not in two separate layer-wise lists.

The paper therefore does not ask whether a layer can be controlled with fewer drivers. Each layer already sits at its minimum budget implied by maximum matching. The question is subtler: can those layer-wise minimum driver sets be reconfigured so that more of them fall on the same nodes?

This is where driver redundancy appears. A node that is a driver in only one layer contributes to deployment cost without contributing to reuse. The optimization target is to eliminate as many of those cross-layer disagreements as the network topology allows.

### Section 3. Primer
**Section title**
From single-layer structural controllability to duplex coordination

**Lead**
The starting point is the standard matching-based view of structural controllability.

**Body**
For a directed network, build its bipartite representation: every node is copied into an out-side and an in-side, and each directed edge becomes a bipartite edge from `u+` to `v-`.

A maximum matching then covers as many target-side copies as possible without conflict. The unmatched target-side copies determine the minimum driver set. Their count is

`ND = max(1, N - |M*|)`.

The crucial freedom is that maximum matchings are often not unique. Alternating paths let one valid maximum matching transform into another without changing its size. In a single layer, that means a minimum driver set can change composition while keeping the same minimum budget.

The duplex problem begins when both layers have this freedom at once. Each layer can remain minimally actuated, but the two chosen driver sets may overlap poorly. The optimization space is therefore the product of two maximum-matching spaces, one per layer.

### Section 4. Problem formulation
**Section title**
Fixed budgets, minimum union

**Lead**
The paper studies an aligned-node duplex with no explicit inter-layer state-transition links.

**Body**
Let `M1` and `M2` be maximum matchings for layer 1 and layer 2. Their driver sets `D1` and `D2` have fixed sizes `k1` and `k2`, because those sizes come from the corresponding maximum matching cardinalities.

The optimization target is the Union Driver Set

`U = D1 ∪ D2`

which counts the number of unique nodes that must be actuated so both layers are structurally controllable.

The feasible space is not “all subsets of nodes.” It is the Cartesian product of the two layer-wise maximum matching spaces:

`Ω = M1(k1) × M2(k2)`

The problem is:

> Under fixed budgets `k1` and `k2`, find `(M1, M2) ∈ Ω` that minimizes `|D1 ∪ D2|`.

### Section 5. Key idea of CLAP-S
**Section title**
Use cross-layer alternating operations to align driver sets

**Lead**
The paper turns single-layer driver exchange into a duplex coordination mechanism.

**Body**
Inside one layer, an alternating path can swap a driver node `s` with a non-driver node `t` while preserving maximum matching size. This is the Driver Exchange Principle.

Across two layers, the paper chains such exchanges into a Cross-Layer Augmenting Path, or CLAP. A CLAP starts at a node in `DD1`, ends at a node in `DD2`, alternates layers, and uses relay nodes that must satisfy strict consistency conditions.

To measure progress, the paper defines the difference mass

`Δ = |DD1| + |DD2|`.

Under fixed budgets,

`|U| = (k1 + k2 + Δ) / 2`.

So minimizing the union is equivalent to minimizing the difference mass. Each successful CLAP reduces `Δ` by exactly `2`, which means `|U|` decreases by exactly `1`.

### Section 6. Interactive algorithm demo
**Section title**
Step through CLAP-S on a toy duplex

**Lead**
The core interactive demo should visualize the three shortest CLAPs from the paper’s toy case study.

**Body**
Initial state:
- `DD1 = {1,3,9}`
- `DD2 = {4,6,8}`
- `CDS = {5}`
- `CMS = {2,7}`
- `Δ = 6`

Then the demo steps through:
- `P1: 1 -> 4`
- `P2: 3 -> 2 -> 4 -> 5 -> 6`
- `P3: 9 -> 6 -> 7 -> 8`

After each update, the interface should show the new `D1`, `D2`, `DD1`, `DD2`, `CDS`, `CMS`, plus a dynamic annotation:

> Delta decreases by 2, |U| decreases by 1.

### Section 7. Theory made intuitive
**Section title**
A local move with a global certificate

**Body**
The CLAP Gain Theorem shows that each valid CLAP preserves both layer budgets, reduces `Δ` by exactly `2`, and reduces `|U|` by exactly `1`.

The CLAP-or-Optimal theorem shows that a feasible configuration is globally optimal if and only if it is CLAP-stable, meaning that no feasible CLAP remains.

So CLAP-S is not just a heuristic improvement rule. It is an exact descent procedure with a stopping certificate.

### Section 8. Experimental evidence
**Section title**
CLAP-S matches ILP and outperforms random sampling

**Body**
Synthetic benchmarks include ER-ER, BA-BA, and ER-BA duplex networks. Across the tested configurations, CLAP-S reaches exactly the same optimum union size as `ILP-EXACT`.

Compared with `RSU`, which samples many random maximum matchings and keeps the best observed union, CLAP-S consistently achieves smaller unions and does so more reliably.

`CLAP-G` is a faster greedy variant. It usually improves clearly beyond RSU and often comes close to CLAP-S, but unlike CLAP-S it is not guaranteed to be optimal.

The paper also shows that optimization headroom depends on density, structural overlap, and initial disagreement size. In both synthetic and real-world duplexes, average path length is very short, indicating that many cross-layer conflicts can be resolved by local reconfiguration.

### Section 9. Applications and implications
**Section title**
Why actuator reuse matters in practice

**Body**
In biological duplexes, a smaller union means fewer unique intervention targets across two directed layers such as regulation and interaction. In brain-network settings, it means fewer distinct loci that must be stimulated or monitored. In social or information systems, it means fewer unique accounts or actors that need intervention across multiple directed relation layers. In finance, it means fewer institutions that must be instrumented across distinct directed relation types.

The value is not “more control.” The value is more efficient reuse of intervention points while keeping each layer at its own minimal structural budget.

### Section 10. Limitations and future work
**Section title**
Exact within scope, not beyond scope

**Body**
The optimality claim applies to:
- aligned-node duplex networks
- uncoupled layers
- fixed minimum budgets derived from maximum matchings

The paper does not claim that the same theory already covers:
- relaxed budgets
- more than two layers
- explicit inter-layer coupling in supra-dynamics

Those are natural future directions, but they are not solved in the current manuscript.

### Section 11. Resources
**Blocks**
- Paper abstract
- PDF download
- Supplementary material
- GitHub code and data
- BibTeX
- Author info
- Contact email

### Section 12. FAQ / Glossary
建议以 accordion + glossary card 两列呈现。FAQ 负责消除常见误解，Glossary 负责建立术语准确性。

---

## 4. 五个动画模块的 storyboard 与交互说明

## 动画 A：Single-layer structural controllability primer

### 动画目的
让访问者理解 driver nodes 不是任意挑出来的，而是由 bipartite representation 上的 maximum matching 决定的。

### 画面结构
- 左侧：原始 directed network
- 右侧：对应 bipartite representation
- 底部：legend 与步骤说明
- 右下角：hover 状态说明框

### 交互方式
- `Play / Pause`
- `Previous / Next / Reset`
- hover 任意节点显示原图与二分图映射关系

### 逐步说明
1. Frame 1: 只显示 directed network
2. Frame 2: 显示 bipartite representation
3. Frame 3: 高亮 maximum matching
4. Frame 4: 高亮 unmatched target copies，并映射为 driver nodes

### 每一步屏幕文案
1. “Start from topology. We do not choose drivers yet.”
2. “Duplicate each node into source-side and target-side copies.”
3. “A maximum matching covers as many target-side copies as possible.”
4. “Unmatched target-side copies become driver nodes.”

### 图例与颜色语义
- matched edge: deep ink
- non-matching edge: light slate
- driver node: burnt orange
- hovered node mapping: teal outline

### 用户控件
- Play
- Pause
- Previous
- Next
- Reset
- hover tooltip

### 移动端简化
- 改为上下布局
- 不同时显示所有说明，保留当前帧文案
- hover 改为 tap

## 动画 B：Union contraction in duplex networks

### 动画目的
让访问者直观看到：每层 budget 不变，但 driver sets 重合度提升，`|U|` 下降。

### 画面结构
- 左侧：两个 layer 的 driver rows
- 右侧：partition view（DD1 / DD2 / CDS / CMS）
- 顶部：四个实时指标卡 `|D1|`, `|D2|`, `|U|`, `Δ`

### 交互方式
- `Initial / Reconfigured` 切换
- hover 节点显示其当前所属集合

### 逐步说明
1. 初始状态：`D1={1,2}`, `D2={4,5}`
2. 重构状态：`D1'={3,4}`, `D2'={3,4}`

### 每一步屏幕文案
1. “Both layers are minimal, but their driver locations are disjoint.”
2. “Budgets stay fixed. The composition changes, overlap increases, and the union contracts.”

### 图例与颜色语义
- DD1: teal
- DD2: amber
- CDS: dark green
- CMS: cool gray

### 用户控件
- Before / After toggle
- hover tooltip

### 移动端简化
- 指标卡改为 2x2
- 两层 driver rows 改为上下排列

## 动画 C：CLAP execution trace on a toy example

### 动画目的
精确展示论文 toy duplex 中三次 shortest CLAP 如何逐步消除差异。

### 画面结构
- 左：Layer 1 network
- 中：Layer 2 network
- 右：当前 `D1, D2, DD1, DD2, CDS, CMS`
- 顶部：`Δ` 与 `|U|` 动态显示

### 交互方式
- `Previous / Next / Reset`
- step-by-step 控制

### 逐步说明
1. 初始状态：`DD1={1,3,9}`, `DD2={4,6,8}`
2. `P1: 1 -> 4`
3. `P2: 3 -> 2 -> 4 -> 5 -> 6`
4. `P3: 9 -> 6 -> 7 -> 8`
5. 终局：`D1=D2={2,5,6,8}`, `Δ=0`

### 每一步对应屏幕文案
1. “Redundancy lives in DD1 and DD2.”
2. “A direct layer-1 CLAP removes one disagreement pair.”
3. “Relay nodes preserve budget while transporting disagreement across layers.”
4. “The last short CLAP removes the remaining conflict.”
5. “No CLAP remains. The state is globally optimal within the fixed-budget space.”

### 图例与颜色语义
- source: teal glow
- relay: steel blue
- target: amber glow
- active layer-1 segment: cyan stroke
- active layer-2 segment: orange stroke

### 用户控件
- Next
- Previous
- Reset
- hover node -> current role

### 移动端简化
- 两个 layer 图改为可切换 tab
- 集合表保留

## 动画 D：Shortest CLAP search

### 动画目的
把 shortest layer-alternating BFS 的“搜索过程”讲清楚，而不是只给伪代码。

### 画面结构
- 左：search graph / frontier animation
- 右：当前 frame 说明
- technical mode 下额外显示 queue / frontier / visited / target

### 交互方式
- `Intuition mode / Technical mode`
- `Previous / Next / Reset`

### 逐步说明
1. 从 DD1 source 初始化 frontier
2. 用 layer 1 扩展 admissible segments
3. 接受满足 relay feasibility 的 relay
4. 切换到 layer 2
5. 命中 DD2 target
6. reconstruct predecessor chain

### 每一步屏幕文案
1. “Search starts from disagreement on layer 1.”
2. “Layer 1 pushes driver status forward.”
3. “Only consistency-preserving relays are admissible.”
4. “Layer role switches after each segment.”
5. “The first reached DD2 node closes the shortest CLAP.”
6. “Shortest-path reconstruction yields one atomic update.”

### 图例与颜色语义
- frontier: teal
- visited: light gray-blue
- relay: steel blue
- target: amber

### 用户控件
- mode toggle
- previous / next / reset
- hover frontier node -> show `(node, next layer)`

### 移动端简化
- technical panel 默认折叠
- 只保留 intuition 模式为主

## 动画 E：Interactive results explorer

### 动画目的
把“结果到底说明了什么”做成可筛选、可 hover 的解释型图表。

### 画面结构
- 左：dataset / metric / network type 控件
- 右：chart + “What this chart says”
- 底部：hover summary

### 交互方式
- synthetic / real-world
- network type
- metric type
- hover point/bar 查看具体值

### synthetic 视图推荐
- 绝对 gain：按 `<k>` 的折线图，显示 `CLAP-S / ILP / CLAP-G / RSU`
- 相对 gain：显示 CLAP-S 相对 RSU 的提升
- runtime：多方法运行时间折线

### real-world 视图推荐
- 绝对 gain：按 network 排序条形图
- 相对 gain：CLAP-S 相对 RSU 的提升
- runtime：对数尺度排序条形图
- memory：对数尺度排序条形图

### 图旁文案模板
- “CLAP-S and ILP overlap, which means the path-based search reaches the same optimum union size on this benchmark.”
- “Positive relative gain means CLAP-S is not just good in isolation; it is consistently stronger than random sampling.”
- “Low memory usage matters because RSU stores many candidate matchings, whereas CLAP-S works through lightweight path-guided updates.”

### 移动端简化
- 控件堆叠
- chart 改为单列
- 只显示 top-6 real-world networks

---

## 5. 理论解释模块的公式与文字说明

### 公式 1
`ND = max(1, N - |M*|)`

**自然语言解释**
maximum matching 覆盖不了的 target-side nodes 必须直接接收外部输入，因此 maximum matching 的大小决定 minimum driver set 的大小。

### 公式 2
`U = D1 ∪ D2`

**自然语言解释**
真实部署成本取决于跨两层一共要激活多少个不同的节点，而不是分别写出两张 layer-specific 名单。

### 公式 3
`Δ = |DD1| + |DD2|`

**自然语言解释**
`Δ` 精确统计了“只在一层是 driver、另一层不是”的节点总数，也就是跨层冗余的核心来源。

### 公式 4
`|U| = (k1 + k2 + Δ) / 2`

**自然语言解释**
在 `k1, k2` 固定时，union size 完全由 difference mass 决定。预算不变时，减少冗余就等于减少 union。

### Double-layer expression 模板

#### Driver Exchange Principle
- Intuition：单层 maximum matching 不是唯一的，因此一个 driver 可以沿 alternating path 被另一个节点替代，而预算不变。
- Formal：若存在从 `s-` 到 `t-` 的 alternating path，则对称差更新保持 matching size 不变，并使 driver 从 `s` 移到 `t`。
- Why it matters：它是 CLAP 的原子操作。
- Visual aid：单层 alternating path toggle 动画。

#### CLAP Gain
- Intuition：CLAP 把差异从 `DD1` 运输到 `DD2`，只在两端消除差异，中继节点不制造新的差异。
- Formal：valid CLAP preserves `k1, k2`, reduces `Δ` by `2`, and reduces `|U|` by `1`.
- Why it matters：它让每一步改进都可计量、可验证。
- Visual aid：toy execution trace。

#### CLAP-or-Optimal
- Intuition：如果还有更优 fixed-budget 状态，那么当前状态与更优状态的差里一定藏着一条 cross-layer improving path。
- Formal：feasible state is globally optimal iff it is CLAP-stable.
- Why it matters：给算法提供全局最优性证书。
- Visual aid：no-path / no-improvement 对照图。

#### Shortest-path / BFS
- Intuition：不必枚举全部 matching pair，只需在当前状态上做 layer-alternating BFS。
- Formal：BFS on `(node, next-layer)` states reconstructs the first reached target in `DD2`.
- Why it matters：把 exact optimization 变成可实现的多步局部搜索。
- Visual aid：frontier expansion + queue panel。

---

## 6. 实验结果区的可视化建议与图旁文案

### 建议图 1：Synthetic line chart
- x 轴：average degree `<k>`
- y 轴：drivers saved or runtime
- 颜色：CLAP-S / ILP / CLAP-G / RSU
- 切换：ER-ER / BA-BA / ER-BA

**图旁文案**
“On the main synthetic benchmark, CLAP-S and ILP overlap. This means the shortest-path construction reaches the exact optimum union size on every tested configuration in the paper.”

### 建议图 2：Relative gain panel
- 指标：`R_opt`
- 目的：解释为什么 CLAP-S 比 RSU 更强

**图旁文案**
“Positive relative gain means CLAP-S is not merely finding good solutions; it is systematically finding better unions than random sampling.”

### 建议图 3：Real-world ranked bar view
- 按 network 排序
- 显示 `CLAP-S / RSU / CLAP-G / ILP(if available)`
- 支持 log scale

**图旁文案**
“Across biological, neuronal, social, and human relationship duplexes, CLAP-S consistently reduces the union beyond RSU, while matching ILP whenever ILP is tractable.”

### 建议图 4：Runtime / Memory explorer
- runtime：突出 CLAP-G 快，CLAP-S 精确
- memory：突出 CLAP-S 明显低于 RSU

**图旁文案**
“CLAP-S avoids the large candidate pools required by sampling-based baselines. The memory gap is especially meaningful on large real networks.”

### 建议图 5：Path-length insight card
- 单独做 insight panel，不一定大图

**图旁文案**
“Average CLAP length is very short. In practice, many cross-layer conflicts can be resolved locally, even when the global control problem is large.”

---

## 7. FAQ / Glossary 内容

### FAQ
1. 为什么不能简单地分别求每层 MDS 再取并集？  
因为 MDS 通常不唯一。随便选一个会引入可避免的跨层错位。论文优化的是 maximum matching 可重配置空间中的重合度。

2. 为什么固定预算是重要约束？  
因为这保证每层都停留在 minimum driver regime，并使 `Δ` 成为充分目标变量，也支撑 CLAP-or-Optimal 定理。

3. 为什么“没有 CLAP”就意味着最优？  
因为论文证明任何更优的 fixed-budget 状态都必然诱导出一条从 `DD1` 到 `DD2` 的 improving path，也就是 CLAP。

4. 这和 identical drivers across layers 有什么不同？  
identical drivers 是更强、更苛刻的约束；本论文只要求 union 最小，而不是两层 driver locations 完全相同。

5. 这和 dominating set / FVS 方法有什么不同？  
那些优化不同的控制 surrogate。这里研究的是 matching-based structural controllability。

### Glossary
- bipartite representation：把 directed graph 转成 source-side / target-side 的二分图表示
- maximum matching：最大的不冲突边集
- driver nodes：target-side unmatched nodes 对应的原始节点
- UDS：两层 driver sets 的并集
- difference mass `Δ`：两层不一致 driver 节点总数
- DD1 / DD2：只在一层是 driver 的节点
- CDS：两层都是 driver 的节点
- CMS：两层都不是 driver 的节点
- admissible segment：单层上可执行的 driver displacement
- relay feasibility：relay 必须满足 CMS / CDS 的切换约束
- CLAP：跨层增广路径
- CLAP-stability：当前状态没有任何可行 CLAP
- CLAP-or-Optimal：无 CLAP 即已达全局最优

---

## 8. 页面组件与视觉规范建议

### 组件建议
- StickyHeader
- HeroSwitcher
- MetricPills
- SectionHeading
- StructuralPrimerPanel
- UnionContractionPanel
- ClapTracePanel
- ShortestClapSearchPanel
- ResultsExplorer
- TheoryCard
- ResourceCard
- FAQAccordion
- GlossaryGrid

### 视觉风格
- 整体：clean, scientific, elegant
- 背景：浅色 scientific mesh gradient
- 字体：`IBM Plex Sans` + `Source Serif 4`
- 圆角：24-32px
- 阴影：柔和，不重

### 全站颜色语义
- layer 1：teal / cyan
- layer 2：amber / orange
- matched：deep ink
- driver：burnt orange
- DD1：teal
- DD2：amber
- CDS：dark green
- CMS：cool gray
- source：teal highlight
- relay：steel blue
- target：amber highlight

### 设计原则
- 动画服务理解，不作装饰
- 数学公式必须可读
- 图例语义全站一致
- 任何“优化”表述都必须附着在 fixed-budget feasible space 上

---

## 9. 组件树、关键状态变量、交互逻辑与实现建议

### 组件树
```text
app/page.tsx
  PaperWebsite
    Header
    Hero
    Section: Why
      UnionContractionDemo
    Section: Primer
      StructuralPrimer
    Section: Problem
    Section: Algorithm
      ClapTraceDemo
      ShortestClapSearch
    Section: Theory
    Section: Results
      ResultsExplorer
    Section: Applications
    Section: Limitations
    Section: Resources
    Section: FAQ
```

### 关键状态变量
- `heroIndex`: 首屏文案切换
- `showChineseHints`: 是否显示中文术语提示
- `primerStage`: 动画 A 当前帧
- `unionStateIndex`: 动画 B 状态
- `traceStepIndex`: 动画 C 当前步
- `searchFrameIndex`: 动画 D 当前步
- `searchMode`: intuition / technical
- `resultsDataset`: synthetic / real
- `resultsMetric`: absolute / relative / runtime / memory
- `resultsFilter`: network type / domain
- `hoveredDatum`: 图表 hover 数据

### 交互逻辑建议
- 所有算法动画都必须支持 `reset`
- 所有关键指标必须与当前动画状态同步
- 结果图 hover 后必须出现一句“这个点/条表示什么”
- 移动端优先保证文案与状态信息可读，网络图可适度简化

---

## 10. 完整示例文案

### 首页首屏完整示例文案
**Title**  
Optimized Control of Duplex Networks

**Subtitle**  
A matching-based framework for minimizing the union of driver nodes while preserving each layer’s minimum control budget.

**Lead**  
Each layer already uses the minimum number of driver nodes implied by maximum matching. The remaining question is whether those layer-wise minimum driver sets can be better aligned so that fewer unique nodes must be actuated across the duplex.

**Value line**  
CLAP-S reconfigures layer-wise maximum matchings to reuse actuators across two directed layers without changing `k1` or `k2`.

**CTA**  
Read the paper  
Explore the algorithm

**Short takeaway card**  
CLAP-S does not reduce per-layer driver budgets. It reduces redundancy between them.

### 算法演示区完整示例文案
**Section title**  
Watch CLAP-S remove one redundant actuator at a time

**Lead**  
The toy duplex starts with valid minimum driver sets in both layers, but their disagreement mass is high. CLAP-S searches for the shortest cross-layer augmenting path that can reduce that disagreement without changing either layer’s maximum matching size.

**Step 0 caption**  
Initial state: `DD1={1,3,9}`, `DD2={4,6,8}`, `Δ=6`.

**Step 1 caption**  
Shortest CLAP found: `1 -> 4` in layer 1. One node leaves `DD1`, one leaves `DD2`. `Δ` drops from 6 to 4.

**Step 2 caption**  
Next shortest CLAP: `3 -> 2 -> 4 -> 5 -> 6`. Relay nodes preserve consistency while transporting disagreement across layers. `Δ` drops from 4 to 2.

**Step 3 caption**  
Final CLAP: `9 -> 6 -> 7 -> 8`. Both difference sets vanish. Now `D1 = D2 = {2,5,6,8}`.

**Closing line**  
No CLAP remains. Within the fixed-budget feasible space, this is the global optimum.
