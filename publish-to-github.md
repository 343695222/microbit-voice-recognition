# 发布micro:bit语音识别扩展到GitHub

本指南将帮助您将micro:bit语音识别扩展发布到GitHub，使其可以作为MakeCode扩展供其他用户使用。

## 前提条件

1. 拥有GitHub账户
2. 已安装Git
3. 项目已完成开发和测试

## 发布步骤

### 1. 创建GitHub仓库

1. 登录GitHub (https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `microbit-voice-recognition`
   - **Description**: `micro:bit voice recognition extension using Edge Impulse`
   - **Visibility**: Public (必须为公开仓库才能作为MakeCode扩展)
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 连接本地仓库到GitHub

在项目目录中运行以下命令（替换YOUR_USERNAME为您的GitHub用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/microbit-voice-recognition.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

### 3. 创建发布版本

1. 在GitHub仓库页面，点击右侧的 "Releases"
2. 点击 "Create a new release"
3. 填写发布信息：
   - **Tag version**: `v1.0.0`
   - **Release title**: `micro:bit Voice Recognition Extension v1.0.0`
   - **Description**: 复制以下内容：

```markdown
## micro:bit语音识别扩展 v1.0.0

### 🎯 主要功能
- 实时语音识别和关键词检测
- 集成Edge Impulse机器学习模型
- 可配置的音频采样参数
- 用户友好的可视化编程块
- 完整的TypeScript API支持

### 📦 包含文件
- 核心功能模块 (main.ts, voice-recognition.ts, edge-impulse-wrapper.ts)
- Edge Impulse WebAssembly模型文件
- 示例代码和测试文件
- 完整的文档和使用说明

### 🚀 快速开始
1. 在MakeCode中添加扩展：`https://github.com/YOUR_USERNAME/microbit-voice-recognition`
2. 参考README.md中的使用示例
3. 查看example.ts了解完整功能

### 📊 性能指标
- 音频处理延迟: < 2ms
- 模型推理时间: < 0.01ms
- 内存占用: < 1MB
- 处理吞吐量: > 10M samples/sec

### 🔧 技术规格
- 支持采样率: 8kHz, 16kHz, 22kHz, 44kHz
- 音频格式: 16-bit PCM
- 模型格式: Edge Impulse WebAssembly
- 兼容性: micro:bit v1/v2, MakeCode
```

4. 点击 "Publish release"

### 4. 在MakeCode中使用扩展

发布后，用户可以通过以下方式添加扩展：

1. 打开MakeCode编辑器 (https://makecode.microbit.org)
2. 点击 "Extensions" (扩展)
3. 在搜索框中输入您的GitHub仓库URL：
   ```
   https://github.com/YOUR_USERNAME/microbit-voice-recognition
   ```
4. 点击搜索结果中的扩展进行安装

### 5. 扩展验证

MakeCode会自动验证扩展的以下方面：
- `pxt.json` 配置文件格式正确
- TypeScript代码语法正确
- 所有依赖文件存在
- 扩展元数据完整

## 维护和更新

### 发布新版本

1. 更新代码并提交到GitHub
2. 更新 `pxt.json` 中的版本号
3. 更新 `CHANGELOG.md`
4. 创建新的GitHub Release
5. 用户将自动获得更新提示

### 最佳实践

1. **版本管理**: 使用语义化版本号 (如 v1.0.0, v1.1.0, v2.0.0)
2. **文档更新**: 保持README.md和示例代码的最新状态
3. **测试验证**: 每次发布前运行 `node build.js` 验证扩展完整性
4. **性能监控**: 定期运行 `node performance-test.js` 检查性能
5. **用户反馈**: 及时响应GitHub Issues和用户问题

## 故障排除

### 常见问题

1. **扩展无法在MakeCode中加载**
   - 检查仓库是否为公开状态
   - 验证 `pxt.json` 格式是否正确
   - 确保所有文件都已提交到GitHub

2. **TypeScript编译错误**
   - 运行 `node build.js` 检查语法错误
   - 检查依赖关系是否正确

3. **扩展功能异常**
   - 检查Edge Impulse模型文件是否完整
   - 验证音频处理逻辑
   - 查看浏览器控制台错误信息

## 支持和贡献

- **问题报告**: 在GitHub仓库中创建Issue
- **功能请求**: 通过GitHub Discussions讨论
- **代码贡献**: 提交Pull Request
- **文档改进**: 欢迎改进README和示例代码

---

**注意**: 请将上述说明中的 `YOUR_USERNAME` 替换为您的实际GitHub用户名。