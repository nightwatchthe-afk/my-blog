# 个人博客系统部署指南

本项目是一个基于 React + Vite + Express + MySQL 的全栈博客系统。你可以非常方便地将其部署到 Render 或 Zeabur 等云平台上。

## 部署准备

本项目已经配置好了生产环境所需的脚本，你可以直接将代码上传到 GitHub，然后在云平台中导入该仓库。

- **构建命令 (Build Command):** `npm install && npm run build`
- **启动命令 (Start Command):** `npm start`

## 环境变量配置

在部署到 Render 或 Zeabur 时，你需要在平台的控制台中配置以下环境变量（Environment Variables）：

1. **`DATABASE_URL`** (必填)
   - **说明:** 你的 MySQL 数据库连接字符串。
   - **格式:** `mysql://<username>:<password>@<host>:<port>/<database>?ssl-mode=REQUIRED`
   - **示例:** `mysql://avnadmin:AVNS_xxxx@mysql-xxxx.aivencloud.com:17214/defaultdb?ssl-mode=REQUIRED`
   - **注意:** 如果你不配置此变量，系统将尝试使用代码中内置的默认测试数据库，但这**不推荐**用于生产环境。

2. **`NODE_ENV`** (推荐)
   - **说明:** 告诉服务器当前处于生产环境。
   - **值:** `production`

## 部署步骤 (以 Render 为例)

1. 登录 [Render](https://render.com/)，点击 **New +**，选择 **Web Service**。
2. 连接你的 GitHub 账号，并选择你上传了此代码的仓库。
3. 填写基本信息：
   - **Name:** 你的博客名称
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. 向下滚动到 **Environment Variables** 区域，点击 **Add Environment Variable**，添加上面提到的 `DATABASE_URL` 和 `NODE_ENV`。
5. 点击 **Create Web Service**。
6. 等待几分钟，Render 会自动下载依赖、打包前端代码并启动后端服务。部署完成后，你就可以通过 Render 提供的域名访问你的博客了！

## 默认管理员密码

部署成功后，点击右上角的“管理员登录”，输入默认密码即可进入控制台：
- **密码:** `nuangetingfengdeboke`

*(如需修改密码，请在 `src/store.ts` 文件中修改 `login` 函数里的硬编码密码，然后重新部署)*
