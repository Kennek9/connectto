# connectto｜MVP 产品框架与英文线框图（历史讨论稿）

> ⚠️ **历史讨论稿｜已于 2026-08-10 被取代**
> 当前产品入口见 [connectto｜主动机会 Agent 产品构想](connectto-主动机会-Agent-产品构想.md)。第三方介绍、私密名片和关系图仍可作为后续能力参考，但不再代表第一版 MVP。
![connectto MVP interaction wireframes — Native iOS + no-login web surfaces](https://prod-files-secure.s3.us-west-2.amazonaws.com/6b41dcd0-9d3d-812a-8993-0003b7ac91ae/ae4a61e5-a151-4fb1-8f4c-fdc424807e38/connectto-mvp-interaction-wireframes.svg?X-Amz-Algorithm=REDACTED&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=REDACTED&X-Amz-Date=REDACTED&X-Amz-Expires=300&X-Amz-Security-Token=REDACTED&X-Amz-Signature=REDACTED&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject)
*英文低保真线框图。用于确认信息层级、页面关系和核心流程，不代表最终品牌视觉。*

## 01｜产品站位
- connectto 的底层可以具备 CRM 的关系数据能力，但产品表面不应像 CRM。
- 不以 Dashboard、漏斗、数字指标、任务墙或批量操作作为首页。
- 用户从一个真实关系事件进入，动作在关系语境中自然出现，并尽可能轻。
- 关系不是一组需要维护的记录，而是持续变化的理解：人物、来源、语境、信任、许可和真实结果。
- 点状关系图是一级设计方向。它必须帮助用户看懂“我与谁有什么关系、为什么此刻相关、可以通过谁连接”，不能只是装饰。
- 未来可以提供多种关系视图；本轮先验证最直觉的点状连接图。
## 02｜第一版的切入口
**核心场景**
用户刚认识 Nicole，想到她可能应该认识自己已经熟悉的 David。用户打开 connectto，发起一次介绍。
**即时任务完成**
名片成功发送。接收方是否回应，不阻塞发送完成。
**长期产品价值**
介绍被接受，双方在外部沟通工具里真正开始交流；之后的真实结果成为相似关系判断的依据。
**产品范围**
第三方介绍是第一版最清晰的入口，不等于产品只做介绍。完整产品仍覆盖 Self Profile、Living Profile、关系记忆、Current Focus、Open Loops、Connector、Connection 和结果回流。
## 03｜信息架构
<table fit-page-width="true" header-row="true">
<tr>
<td>区域</td>
<td>用户在这里做什么</td>
<td>界面原则</td>
</tr>
<tr>
<td>Home</td>
<td>从当下真实意图开始：介绍、记录交流、推进一件事</td>
<td>一个主问题、一个主动作；不是 Dashboard</td>
</tr>
<tr>
<td>People</td>
<td>理解人物与关系，查看相关语境和可信连接路径</td>
<td>关系图优先，同时保留人物列表视图</td>
</tr>
<tr>
<td>Connections</td>
<td>查看一次连接为什么发生、当前到哪一步、后来发生了什么</td>
<td>关系故事，不做销售管道</td>
</tr>
</table>
第一版客户端采用 **Native iOS**。确认名片和接收名片采用 **无需登录的 Web 页面**。
不把独立的 “Agent Workbench” 写入第一版信息架构。Agent 先作为流程内的协作方式出现；是否需要独立工作台，后续单独讨论。
## 04｜核心流程
1. 用户在 Home 选择 **Start an introduction**。
2. 选择被介绍人和接收人；新人物只需补充最少信息，不强制完成完整 Profile。
3. Agent 询问少量关键问题，边聊边生成卡片预览。
4. 被介绍人打开免登录页面，确认本次展示内容和介绍意愿。
5. connectto 为接收人生成一张只服务于本次介绍的私密名片。
6. 用户发送名片；此刻本次任务完成。
7. 接收人可选择 **I’m open to meeting** 或 **Not a fit**，也可以暂不回应。
8. 对方愿意见面后，connectto 生成群聊或邮件开场白，由用户一键带到微信、邮件等外部工具。
9. 后续在自然相关的时机轻问一次结果，不制造提醒队列。
## 05｜八个页面
### 01 — Home · iOS
- 首屏问题：**Who do you want to connect today?**
- 主动作：**Start an introduction**
- 次级入口：**Capture a conversation**、**Move something forward**
- 最多出现一条有明确原因的关系提示，例如 Nicole 此刻为什么可能与 David 相关。
- 不出现统计数字、待办墙、漏斗和快捷动作矩阵。
### 02 — Choose people · iOS
- 明确介绍方向：**Introduced person → Recipient**
- 人物卡只展示完成选择所需的最少信息。
- 新人物允许在流程中创建，不先打断用户做完整档案。
- 继续后进入介绍理由的生成过程。
### 03 — Co-create · iOS
- Agent 每次只问一个有助于形成介绍的关键问题。
- 交谈过程中同步展示 **Card taking shape**，让用户看见内容如何形成。
- 预览聚焦 **Why meet / Why now / A good place to start**。
- 这是流程内协作，不预设为独立 Agent 工作台。
### 04 — Introduced person approval · Web
- 被介绍人无需登录即可查看是谁发起、要介绍给谁、为什么。
- 每条信息说明来源：本人提供、公开来源或介绍人判断。
- 被介绍人明确选择 **I’m open to this** 或 **Not now**。
- 未确认前不得向接收人披露本次名片内容。
### 05 — Private connection card · Web
卡片按本次接收人和目的生成，不是永久公开主页。内容顺序为：
1. **Why meet**
2. **About Nicole**
3. **Why this matters to you**
4. **Why now**
5. **A good place to start**
接收人无需登录，可以表达愿意认识或暂不合适。卡片默认私密、可撤回，只用于这次介绍。
### 06 — Sent · iOS
- 清楚告诉用户：**Card sent**。
- 发送即本次任务完成，不要求用户继续维护状态。
- 页面只保留返回首页和查看这次 Connection 两个出口。
### 07 — People map · iOS
- “Me” 是当前关系视角中心，人物以点出现，关系以有意义的线连接。
- 连线可显示关系来源或时间，例如 **met last week**、**known 3 years**。
- 选择人物后展示 **Why relevant / Recent context / Trusted paths**。
- 图谱必须支持理解和选择，不用节点数量制造“关系资产很多”的错觉。
- 第一版保留 **Map / People** 切换，为未来多视图演进留口。
### 08 — Connection story · iOS
- 用纵向叙事呈现这次连接：理由形成、本人确认、名片发送、自然等待。
- 不使用 Pipeline 阶段列、赢单概率或催办状态。
- 当真实结果出现时，把它追加到故事里，并只影响相似场景下的未来判断。
## 06｜名片与许可规则
- 人物有相对稳定的身份基础，但每张介绍卡都针对具体接收人和目的重新生成。
- 被介绍人控制“向谁展示什么、为什么展示、展示多久”。
- 第三方介绍必须得到被介绍人的明确许可。
- 双方都同意前，不展示直接联系方式。
- 拒绝、撤回和不回应都应被产品清楚尊重。
- connectto 不做陌生人冷启动外联，也不代替微信或邮件成为聊天工具。
## 07｜MVP 验收标准
- 用户无需先完成复杂入门或维护 Dashboard，就能从 Home 发起介绍。
- 新人物可以用最少信息进入流程，Agent 能生成可编辑的介绍草稿。
- 被介绍人可以在免登录页面理解并控制本次披露。
- 接收人可以在免登录页面读懂“为什么值得认识”，并自由选择是否回应。
- 名片成功发送后，用户获得明确完成反馈。
- People 图能够解释关系与相关性，而不是只展示漂亮节点。
- Connection 页面像一段关系故事，不像销售状态管理。
- 整条路径不依赖桌面端，也不要求双方安装 connectto。
## 08｜本轮尚未锁定
- 点状关系图的布局算法、缩放方式、时间维度和多视图切换。
- 最终品牌语言、色彩、动效和组件视觉。
- 是否以及何时需要独立 Agent 工作台。
- 真实网页原型只优先验证两个高风险交互：关系图，以及 Agent 边聊边生成卡片。
---
**相关依据**
- [Notion 页面](第一版产品-PRD.md)
- [Notion 页面](产品结论日志.md)
- [Notion 页面](竞品地图与完整调研报告-旧方向.md)

---

来源：[Notion 原页面](https://app.notion.com/p/3b71dcd09d3d80c4add6fba9e83aacd6?pvs=204)
