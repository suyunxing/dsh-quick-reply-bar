# dsh-quick-reply-bar

输入框上方的快捷回复条：**收起只有一个小按钮，点开是一横排短语，点一下直接发送。**

[English](#english) · [更新日志](CHANGELOG.md) · [详细说明](docs/DETAIL.md)

## 它长什么样

收起时，输入框上方只有一颗小胶囊（`✦ 快捷回复 4`），不占版面：

```
        ┌─────────────────────────────────┐
        │ ✦ 快捷回复 4                     │  ← 平时就这样
        └─────────────────────────────────┘
        ┌─────────────────────────────────┐
        │  输入框                          │
```

点开以后变成一横排短语按钮，右边还有一个 `＋`：

```
   ⌃  [继续] [详细点] [简短点] [换个思路]        ＋
        ┌─────────────────────────────────┐
        │  输入框                          │
```

点任意一个短语，文字会立刻发送出去（不是只填进输入框）。点 `＋` 打开编辑面板，可以新增、改名、改内容、上下移动、删除，改完点「完成」即保存。

## 安装

```sh
dsh plugin --profile <你的 profile> add dsh-quick-reply-bar
```

装完重启一次 DSH，插件才会加载（新装的包对已运行的宿主不可见）。

## 用它

| 想做的事 | 怎么做 |
| --- | --- |
| 收起 / 展开 | 点胶囊展开，点条带左侧的 `⌃` 收回 |
| 发一句话 | 点对应的短语按钮，立即发送 |
| 加一条 | 点右侧 `＋` → 面板底部「新增一条」→ 填名字和内容 |
| 改一条 | 点右侧 `＋` → 直接改「名字」和「发送内容」 |
| 调顺序 | 在编辑面板里点 `↑` `↓` |
| 删一条 | 在编辑面板里点 `×` |
| 恢复默认 | 编辑面板底部「恢复默认短语」 |

输入框里已经写了东西时点短语：原草稿会先暂存，发送完成后自动放回输入框。

## 数据存在哪

短语存在浏览器的 `localStorage`，键名 `dsh-quick-reply-bar:v1`；收起/展开状态存在 `dsh-quick-reply-bar:ui:v1`。不联网、不上传、不读任何凭据，换设备各存各的。

## 兼容性

- DSH `>=0.2.2-rc.3 <0.3.0`（Node `>=20`）
- 纯客户端插件：Host 半边是空的 `apply()`，不发 HTTP 路由、没有工具、没有后台进程
- 挂在 `conversation.input.dock` 槽位，主题色只用 `--dsw-alias-*` 变量，明暗主题都跟随

## 开发

```sh
npm test          # 假 DOM 冒烟：渲染、展开、发送、编辑、持久化
```

目录：

```
client.js          浏览器端全部逻辑（模块加载器注册 + React 组件 + 注入的 CSS）
index.js           Host 半边（空实现）
cordis.patch.yml   插件登记
locale/            zh / en 词典与插件页文案
docs/              插件详情页文档
test/smoke.mjs     离线冒烟脚本
```

## License

MIT

---

## English

A quick-reply bar above the composer: **collapsed to one small button; expand it for a horizontal strip of phrases; one click sends.**

- **Collapsed** — a single pill (`✦ Quick replies 4`) above the composer, taking no layout space.
- **Expanded** — a horizontally scrolling strip of phrase buttons plus a trailing `＋`.
- **Send** — clicking a phrase sends it immediately, not just fills the box.
- **Edit** — `＋` opens an inline panel: add, rename, rewrite, reorder (`↑` `↓`), delete (`×`), or restore the defaults.
- **Storage** — phrases live in `localStorage` (`dsh-quick-reply-bar:v1`); no network, no credentials, no background process.
- **Draft safety** — a non-empty draft is stashed before a phrase is sent and restored afterwards.

### Install

```sh
dsh plugin --profile <your-profile> add dsh-quick-reply-bar
```

Restart DSH once after installing — a running host does not discover a package it has not seen at start-up.

### Compatibility

DSH `>=0.2.2-rc.3 <0.3.0`, Node `>=20`. Client-only plugin on the `conversation.input.dock` slot; theme colours come from `--dsw-alias-*` tokens.

### Development

```sh
npm test
```

See [docs/DETAIL.en.md](docs/DETAIL.en.md) for the design notes.
