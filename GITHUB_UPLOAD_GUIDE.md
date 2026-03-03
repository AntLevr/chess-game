# 如何在GitHub上创建仓库并上传战旗游戏项目

## 第一步：创建GitHub仓库

1. **登录GitHub**
   - 打开浏览器，访问 https://github.com
   - 登录你的账号（antlevr）

2. **创建新仓库**
   - 点击右上角的 "+" 图标
   - 选择 "New repository"

3. **填写仓库信息**
   - **Repository name**: chess-game
   - **Description** (可选): 战旗游戏项目
   - **Visibility**: 选择 "Public"（公开）
   - **不要**勾选 "Initialize this repository with a README"
   - 其他选项保持默认

4. **创建仓库**
   - 点击 "Create repository" 按钮

## 第二步：推送代码到GitHub

创建仓库后，GitHub会显示一个页面，提供推送代码的命令。复制这些命令并在项目目录中执行：

```bash
# 进入项目目录
cd c:\Users\Antlevr\Documents\trae_projects\Chess

# 确保远程仓库已添加（如果之前没有成功）
git remote add origin https://github.com/antlevr/chess-game.git

# 推送代码
git push -u origin main
```

## 第三步：验证上传

- 访问 https://github.com/antlevr/chess-game
- 确认所有文件都已上传成功
- 查看仓库是否正常显示

## 常见问题解决

### 认证问题
如果推送时需要认证：
- 输入你的GitHub用户名：antlevr
- 输入你的GitHub密码或个人访问令牌

### 权限问题
如果遇到权限错误：
- 确保你正确输入了GitHub用户名和密码
- 确保你有权限创建和推送仓库

### 网络问题
如果遇到网络错误：
- 检查你的网络连接
- 尝试使用SSH方式推送（需要设置SSH密钥）

## 完成！

上传成功后，你的战旗游戏项目就会在GitHub上了。你可以：
- 分享仓库链接给朋友
- 邀请其他开发者协作
- 在GitHub上管理和更新项目

祝你使用愉快！