# LGF 官网 · Laboratorio di confezione, Reggio Emilia

L.G.F. S.r.l. 的对外官网：意大利语（主）/ 英语 / 中文三种语言。一页三屏：3D 工厂 → 为什么选我们 → 联系。
风格和工厂管理系统统一（苹果式简约：系统字体、#f5f5f7 浅灰底、只用苹果蓝一个主题色、白色圆角卡片）。

- `/it` `/en` `/zh` 三个语言版本；打开 `/` 会按浏览器语言自动跳转（意大利语 > 中文 > 英文，都不是就用意大利语）
- 技术栈和工厂管理系统一样：Next.js 16 + Tailwind 4 + three.js
- 3D 机器模型来自管理系统的「数字工厂」（`src/components/factory3d/models.ts`），颜色收敛成中性灰，衣服用驼色 / 黑 / 白等成衣色

线上地址（GitHub Pages）：https://liyucheng1997.github.io/351_lab-factory-website/

## 运行

```bash
npm install
npm run dev        # http://localhost:3000/it
npm run build      # 静态导出到 out/
```

## 部署

纯静态网站（`next.config.ts` 里 `output: "export"`），推送到 `main` 或打 `v*` 标签时，
`.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。
根路径 `/` 是 `public/index.html`，按浏览器语言跳到 `/it/`、`/en/` 或 `/zh/`。

绑定自己的域名（例：www.lgf-srl.it）：仓库 Settings → Pages → Custom domain 填域名，
再在域名商那里加一条 CNAME 指向 `liyucheng1997.github.io`。子路径会自动去掉，不用改代码。

## 上线前要改的地方

**1. 公司资料**：`src/content/company.ts`

| 字段 | 说明 |
| --- | --- |
| `street` `postalCode` | 街道地址、邮编（填了以后「在谷歌地图打开」会定位到门口） |
| `vat` | P.IVA（意大利法律要求公司网站页脚显示） |
| `email` `phone` `whatsapp` | 空着的项网站上不显示 |
| `hours` | 工作时间 |
| `CLIENTS` | 合作品牌，用统一的衬线字排成一行（不放品牌 Logo 图片） |

**2. 文字**：`src/content/dict/it.ts`（意大利语）、`en.ts`、`zh.ts`，三份结构一样，改一处记得改另外两处。
下面这些是按常见做法写的，请按实际情况确认或修改：

- 首屏 3D 下面每个车间的一句话说明（`hero.notes`）：提到了自动铺布机、电脑裁床、立体整烫机，没有的删掉
- 「为什么选我们」三张卡片：正式合同用工、可签 NDA、欢迎审核和参观
- 数字：2000 m²、15 人、3 条自有流水线

**3. 询价表单**：GitHub Pages 只能放静态文件，没有服务器发邮件。两种办法：

- 推荐：在 [Formspree](https://formspree.io)（或 Getform 等）免费注册一个表单，拿到地址（例：`https://formspree.io/f/abcdwxyz`），
  填到仓库 Settings → Secrets and variables → Actions → **Variables** 里，名字叫 `FORM_ENDPOINT`，再重新部署。
  客户提交后，邮件直接发到你注册用的邮箱。
- 不配置：点「提交」会打开客户自己的邮件程序，收件人是 `company.ts` 里的 `email`（所以 email 一定要填）。

## 结构

```
src/
  app/[lang]/page.tsx        首页（三屏的顺序在这里）
  app/[lang]/privacy/        隐私说明（GDPR）
  app/globals.css            颜色、字体、按钮、卡片（和管理系统同一套规范）
  content/company.ts         公司资料
  content/dict/*.ts          三种语言的文字
  components/Hero.tsx        首屏 + 3D + 车间切换
  components/sections.tsx    「为什么选我们」+ 页脚
  components/Contact.tsx     联系方式 + 询价表单
  components/factory3d/showcase.ts  3D 场景：厂房布局、灯光、动画、镜头
public/index.html            根路径：按浏览器语言跳转
public/og/og-*.jpg           分享链接时显示的预览图（从 3D 首屏截的）
```

改了首屏以后，分享预览图要重新截一张 1200×630 的替换 `public/og/` 里的文件。

## 3D 场景说明

- 厂房 34 m × 22 m 的剖面模型：左边裁剪（10 米长裁床 + 来回走的铺布机、电脑裁床、面料架），中间两组背靠背车缝线，右边整烫（烫台、锅炉、立体整烫机、成衣架）和验货包装发货
- 朝向镜头的墙会自动淡出；模型下面的「全景 / 裁剪 / 车缝 / 整烫 / 验货」或者点模型上的标签，镜头会推到那个车间，拉近时屋架自动隐藏
- 小动画：铺布机来回走、两辆周转车绕车缝区转圈、烫台和整烫机冒蒸汽、车工手上的动作
- 性能：three.js 在首屏文字显示以后才加载；所有静态设备合并成几十个网格；离开屏幕或切到后台就停止渲染；手机上阴影分辨率减半
- 电脑上鼠标拖动、手机上手指左右滑动可以旋转（上下滑还是滚动页面）；系统开了「减少动态效果」就不自动旋转
- 手机上：浏览器空闲时才建模型、30 帧渲染、阴影少算，滚动更顺、更省电
