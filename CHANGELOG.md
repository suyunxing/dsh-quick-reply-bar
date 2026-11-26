# 更新日志 / Changelog

## 1.0.1 — 2026-11-26

发布流程修正，插件行为不变。

- CI 在发布前把 npm 升到 11（Node 22 自带的 npm 10 不支持 OIDC 可信发布），修掉发布时 `E404 is not in this registry`。

### English

Release-pipeline fix only; plugin behaviour is unchanged.

- CI now upgrades npm to 11 before publishing (Node 22 ships npm 10, which cannot do OIDC trusted publishing), fixing the `E404 is not in this registry` failure.

## 1.0.0 — 2026-11-25

首个公开版本。

- 收起态：输入框上方只留一个小按钮（`✦ 快捷回复 N`），不占版面。
- 展开态：一横排短语按钮，可横向滚动；点一下直接把该短语发送出去。
- 编辑：右侧 `＋` 就地打开编辑面板，支持新增、改名、改内容、上下移动、删除、恢复默认。
- 短语存浏览器 `localStorage`，换会话不丢，换设备各存各的。
- 快捷键文案与默认短语跟随界面语言（中文 / English）。
- 发送前若输入框已有草稿，会先暂存，发送完成后自动放回。

## 1.0.1 — 2026-11-26

发布流程修正，插件行为不变。

- CI 在发布前把 npm 升到 11（Node 22 自带的 npm 10 不支持 OIDC 可信发布），修掉发布时 `E404 is not in this registry`。

### English

Release-pipeline fix only; plugin behaviour is unchanged.

- CI now upgrades npm to 11 before publishing (Node 22 ships npm 10, which cannot do OIDC trusted publishing), fixing the `E404 is not in this registry` failure.

## 1.0.0 — 2026-11-25

First public release.

- Collapsed: a single small button (`✦ Quick replies N`) above the composer.
- Expanded: a horizontally scrolling strip of phrase buttons; one click sends the phrase.
- Editing: the trailing `＋` opens an inline panel to add, rename, reorder, delete or restore the phrases.
- Phrases live in browser `localStorage`, per device, and survive session switches.
- Default phrases and the UI copy follow the interface language (Chinese / English).
- A non-empty draft is stashed before sending and put back afterwards.

