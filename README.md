# Top Seed / connectto

## 网站开发

需要 Node.js 18 或更新版本。PR 会自动运行测试、历史快照检查和静态构建。

Top Seed 是基于公开来源的 AI 公司研究网站。当前榜单截止 2026-10-05，Seed、Series A、B、C 各 50 家。2026-08-22 原始榜单及证据单独存档。

- `npm test`：页面契约、历史资料、当前事实和新榜单验证。
- `npm run check-data`：检查原始 200 家公司历史快照。
- `npm run check-sources`：检查公开来源的 HTTP 可访问性；更新 `source-access.js` 和 `research/source-check.json`。此检查不验证事实，也不自动修改公司状态。
- `npm run build`：输出 `dist/`，包含首页、213 家公司的静态正文、逐公司证据 JSON、当前排名决策 JSON 和历史版本。
- 本地查看：`python3 -m http.server 4179 --bind 127.0.0.1 --directory dist`。

本期复核 213 家公司：200 家入选、5 家候补、8 家因阶段、存续状态或证据冲突退出。候选范围是本次审阅集合，不代表全球完整名单。产品描述分别注明原文核验或搜索索引来源。页面采用米白纸纹、勃艮第红重点色与自托管字体。

排名维护：`ranking-edition.js` 保存明确的本期顺序及逐公司判断，`edition-candidates.js` 保存新增公司的来源资料，`edition.js` 处理迁移、退出及纠错。历史版可从首页进入，或访问 `/editions/2026-08-22/`。

数据维护：原始 `canonical-data.js` 保持历史原样；已核实的新事件与阶段/状态更正写入 `reviewed-updates.js`，产品资料写入 `refreshed-profiles.js`。每条新增内容必须保留原始链接、来源关系、日期和核查时间。搜索发现记录不能直接当作已核实事实发布。

本轮范围：公开网站；收费方式尚未确定。用户明确推迟注册联系邮箱，目前纠错页仅展示更正记录，没有实际收件入口。尚未部署本次版本；不能把静态构建通过当作生产上线验收。本次重新排序覆盖上述 213 家候选；没有宣称穷尽全球公司或独立验证企业自报业绩。

## 项目资料

Connectto 项目资料仓库。Notion 是当前主要编辑位置，这里保存可检索、可审阅、可追踪版本的 Markdown 副本。

## 同步状态

- 来源：[Ken Ge’s Space 中的 connectto 页面](https://app.notion.com/p/2c91dcd09d3d805c8938fe70b74ef046)
- 同步时间：2026-08-11（Asia/Shanghai）
- 范围：根页面下 10 个页面，以及 PRD 下 1 个子页面
- 结果：11 个 Markdown 文档；当前页面没有可下载附件

## 文档

- [主动机会 Agent 产品构想](docs/connectto-主动机会-Agent-产品构想.md)
- [产品结论日志](docs/产品结论日志.md)
- [Agent-Native 时代的个人身份与协商基础设施](docs/Agent-Native-时代的个人身份与协商基础设施.md)
- [第一版产品 PRD v2（历史版本）](docs/第一版产品-PRD.md)
  - [第一阶段讨论稿｜产品形态、交互与实现](docs/第一版产品-PRD/第一阶段讨论稿-产品形态、交互与实现.md)
- [后续能力演进](docs/后续能力演进.md)
- [产品与融资 Timeline（待按新方向重排）](docs/产品与融资-Timeline.md)
- [YC 正式评审报告（历史评审）](docs/YC-正式评审报告.md)
- [竞品地图与完整调研报告（旧方向）](docs/竞品地图与完整调研报告-旧方向.md)
- [MVP 产品框架与英文线框图（历史讨论稿）](docs/MVP-产品框架与英文线框图-历史讨论稿.md)
- [Bonjour 欧美竞品与复刻可行性（2026）](docs/Bonjour-欧美竞品与复刻可行性-2026.md)

## 目录

- `docs/`：Notion 页面转换后的 Markdown
- `assets/`：历史文档资源
