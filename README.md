# 甩锅 - Cloudflare 错误页生成器

** 在线使用：https://7985200.github.io/cloudflare-custom-error-page/**

一个**纯前端生成工具**：浏览器里填入参数 → 实时预览 → 一键下载一个**独立的 HTML 错误页**
（自带全部 CSS 与图标，无外部依赖）。

页面 **1:1 复刻 Cloudflare 官方错误页**：

- HTML 结构照搬官方模板（含 IE 条件注释、Tailwind 工具类名）
- 样式来自官方 `/cdn-cgi/styles/main.css`
- 图标来自官方 `/cdn-cgi/images/cf-icon-*.png`（base64 内联）

> **已验证**：在相同参数下，本工具产出的 HTML 与 Cloudflare 真实错误页
> **逐字节完全相同**（去掉内联 `<style>` 后 `diff` 为 0）。

---

## 快速开始

### 在线直接用（推荐）

 **https://7985200.github.io/cloudflare-custom-error-page/**

不用下载、不用部署，打开就能用。

### 本地打开

下载本仓库，用浏览器打开 `web/index.html` 即可 —— 无需服务器、无需联网、无需安装任何东西。

```
web/
├── index.html     生成器界面
├── style.css      界面样式（纯黑白 + 圆角按钮）
├── app.js         表单逻辑（实时预览 / 下载 / 复制）
├── template.js    错误页模板 + 生成函数
└── cf-css.js      Cloudflare 官方样式（图标已 base64 内联）
```

界面左侧填参数，右侧 iframe 实时预览，下方四个按钮：**下载 HTML / 复制 HTML / 新窗口预览 / 重置**。

---

## 可自定义的参数

| 参数 | 说明 | 示例 |
|---|---|---|
| **语言** | 页面语言 | `English`（默认，同 Cloudflare）/ `中文` |
| **哪个节点出问题** | 三个节点里哪个标红并带白色箭头 | `源站主机`（默认）/ `Cloudflare` / `浏览器` |
| **错误码** | 随便填（数字/字母/梗都行） | `502`、`522`、`5201314` |
| **站点名** | 进 `<title>` 与源站节点 | `example.com` |
| **大标题** | 留空按错误码自动 | `Bad gateway` |
| **发生了什么？** | 正文 | 留空自动 / 支持中文 |
| **给访客的建议** | 留空自动 | 支持中文 |
| **给站长的建议** | **留空则不渲染该段** | 支持中文 |
| **机房城市** | 中间节点显示的城市，留空随机 | `Amsterdam`、`Hong Kong` |
| **页脚品牌名** | 默认 `Cloudflare` | — |
| **Ray ID** | 留空自动随机 | — |
| **访客 IP** | **留空 = 显示访客自己的真实 IP**；填值 = 固定显示 | `1.2.3.4` |
| **页面时间** | 留空取当前 UTC | — |

### 关于「访客 IP」

真实 Cloudflare 页面显示的 IP 是**当前访客自己的 IP**（服务端写入）。
本工具产出的是静态 HTML，服务端拿不到，所以留空时会注入一小段脚本，
在浏览器侧请求公共 IP 接口（`api64.ipify.org` → `api.ipify.org` → `ipapi.co`，逐个兜底）
把页脚那个 IP 替换成访客真实 IP —— 效果与官方一致。

> 那个 IP 默认被「Click to reveal」按钮遮住，替换过程不可见；
> 接口请求失败时保留随机兜底值，不影响页面。
> 若你填了固定 IP，则**不注入脚本**，此时源码与官方页面逐字节相同。

### 内置预设错误码

`502` `503` `504` `520` `521` `522` `523` `524`

标题 / 正文 / 访客建议 / 站长建议均取自 Cloudflare 官方错误页，**中英双语**。
选中的错误码会自动填充各字段的占位提示，留空即用预设值。

---

## 生成物长什么样

```html
<!DOCTYPE html>
<html class="no-js" lang="en-US">
<head>
  <title>izrot.com | 502: Bad gateway</title>
  <link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/main.css" />
  <style type="text/css">/* 官方 main.css + 内联图标 */</style>
</head>
<body>
  <div id="cf-wrapper">
    <div id="cf-error-details" class="p-0">
      <header>Bad gateway  [Error code 502]  …  2026-10-03 16:51:52 UTC</header>
      <div class="my-8 bg-gradient-gray">  <!-- 三节点示意 -->
        You / Browser / Working
        Amsterdam / Cloudflare / Working
        izrot.com / Host / Error        ← 出问题节点标红并带白色箭头
      </div>
      <div>What happened? … What can I do? …</div>
      <div class="cf-error-footer">Ray ID / Your IP / Performance &amp; security by Cloudflare</div>
    </div>
  </div>
</body>
</html>
```

**单文件**（`<link>` 仅保留以保持源码与官方一致，实际样式已内联），
可直接扔到任何静态托管，或配置为 Nginx `error_page`。

> 唯一的外部请求：留空访客 IP 时，页面会向公共 IP 接口查一次访客自己的 IP。
> 填了固定 IP 则完全没有外部请求。

## License

MIT
