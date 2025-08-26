# Edge Impulse 模型更新指南

## 概述

本文档提供了在 micro:bit 语音识别扩展中更新 Edge Impulse 模型的详细指南。

## 可用工具

### 1. Windows 批处理脚本 (`update-model.bat`)

**使用方法：**
```cmd
update-model.bat "C:\path\to\new-model.js"
```

### 2. Linux/macOS Shell 脚本 (`update-model.sh`)

**使用方法：**
```bash
chmod +x update-model.sh
./update-model.sh "/path/to/new-model.js"
```

## 模型文件说明

### 必需文件
- `edge-impulse-standalone.js` - Edge Impulse 推理引擎 JavaScript 文件
- `edge-impulse-standalone.wasm` - WebAssembly 模块文件

### 文件获取
1. 在 Edge Impulse Studio 中训练并部署模型
2. 选择 "Library" 部署选项
3. 下载 "WebAssembly" 格式的模型文件

## 更新步骤

### 自动更新（推荐）

1. **备份当前模型**
   ```bash
   # 脚本会自动创建带时间戳的备份文件
   # 例如: edge-impulse-standalone.js.backup.20231201-143022
   ```

2. **替换模型文件**
   ```bash
   # 运行更新脚本
   ./update-model.sh "/path/to/your/new-model.js"
   ```

3. **验证更新**
   ```bash
   # 运行测试
   npm test
   ```

### 手动更新

如果自动脚本不适用，可以手动执行以下步骤：

1. **备份当前文件**
   ```bash
   cp edge-impulse-standalone.js edge-impulse-standalone.js.backup.$(date +"%Y%m%d-%H%M%S")
   cp edge-impulse-standalone.wasm edge-impulse-standalone.wasm.backup.$(date +"%Y%m%d-%H%M%S")
   ```

2. **替换文件**
   ```bash
   cp /path/to/new-model.js edge-impulse-standalone.js
   cp /path/to/new-model.wasm edge-impulse-standalone.wasm
   ```

## 测试新模型

更新后，请运行以下测试确保模型正常工作：

### 1. 基本功能测试
```bash
npm test
```

### 2. 性能测试
```bash
node performance-test.js
```

### 3. 示例测试
```bash
node run-impulse.js
```

## 版本管理

### 更新版本号
在 `pxt.json` 中更新版本号：
```json
{
  "name": "microbit-voice-recognition",
  "version": "1.1.0",  # 更新版本号
  "description": "语音识别扩展",
  ...
}
```

### Git 提交
```bash
git add .
git commit -m "更新Edge Impulse模型到vX.Y.Z"
```

### 发布新版本
```bash
git tag v1.1.0
git push origin v1.1.0
```

## 故障排除

### 常见问题

1. **模型不兼容**
   - 确保新模型使用相同的输入格式和采样率
   - 检查特征提取参数是否匹配

2. **内存不足**
   - 新模型可能占用更多内存
   - 考虑优化模型大小或减少输入长度

3. **性能下降**
   - 测试新模型的推理时间
   - 调整 `voice-recognition.ts` 中的缓冲区大小

### 回滚操作
如果新模型有问题，可以恢复备份：
```bash
cp edge-impulse-standalone.js.backup.20231201-143022 edge-impulse-standalone.js
cp edge-impulse-standalone.wasm.backup.20231201-143022 edge-impulse-standalone.wasm
```

## 最佳实践

1. **定期备份** - 在更新前总是备份当前模型
2. **版本控制** - 每次模型更新都创建新的Git标签
3. **测试验证** - 更新后全面测试所有功能
4. **文档更新** - 更新README中的模型版本信息

## 支持

如有问题，请参考：
- [Edge Impulse 文档](https://docs.edgeimpulse.com)
- [项目GitHub Issues](https://github.com/343695222/microbit-voice-recognition/issues)

---
*最后更新: $(date +"%Y-%m-%d")*