# micro:bit语音识别扩展

这是一个为micro:bit开发的语音识别扩展，使用Edge Impulse机器学习模型进行关键词检测和语音分类。

## 🎯 功能特性

- **实时语音录制**: 支持可配置的采样率和录音时长
- **智能语音处理**: 内置音频预处理和特征提取
- **机器学习识别**: 基于Edge Impulse WebAssembly模型
- **关键词检测**: 支持自定义关键词和文本匹配
- **可视化编程**: 提供完整的MakeCode积木块
- **性能优化**: 经过性能测试和优化
- **调试支持**: 内置调试模式和详细日志

## 📦 安装方法

### 方法1: 通过MakeCode扩展库
1. 在MakeCode编辑器中打开你的micro:bit项目
2. 点击"扩展"按钮
3. 搜索"microbit-voice-recognition"或输入此扩展的GitHub URL
4. 点击添加扩展

### 方法2: 手动导入
1. 下载此项目的所有文件
2. 在MakeCode中选择"导入"→"导入文件"
3. 选择项目文件夹中的所有文件

## 快速开始

### 基本使用

```typescript
// 初始化语音识别模块
voiceRecognition.initialize()

// 设置采样参数
voiceRecognition.setSampleRate(16000)  // 16kHz采样率
voiceRecognition.setRecordingDuration(1000)  // 1秒录音时长

// 设置识别完成回调
voiceRecognition.onRecognitionCompleted(() => {
    let result = voiceRecognition.getRecognitionResult()
    basic.showString(result)
})

// 开始语音识别
input.onButtonPressed(Button.A, () => {
    voiceRecognition.startRecognition()
})
```

### 高级使用

```typescript
// 获取音频缓冲区数据
let audioBuffer = voiceRecognition.getAudioBuffer()

// 检查是否正在录音
if (voiceRecognition.isCurrentlyRecording()) {
    basic.showIcon(IconNames.SmallHeart)
}

// 清除音频缓冲区
voiceRecognition.clearAudioBuffer()

// 获取当前设置
let currentSampleRate = voiceRecognition.getSampleRate()
let currentDuration = voiceRecognition.getRecordingDuration()
```

## API参考

### 初始化函数

#### `initialize()`
初始化语音识别模块和Edge Impulse模型。

### 配置函数

#### `setSampleRate(rate: number)`
设置音频采样率。
- `rate`: 采样率 (Hz)，范围：8000-48000，默认：16000

#### `setRecordingDuration(duration: number)`
设置录音时长。
- `duration`: 录音时长 (毫秒)，范围：100-5000，默认：1000

### 录音和识别函数

#### `startRecognition()`
开始录音并进行语音识别。

#### `onRecognitionCompleted(handler: () => void)`
设置识别完成时的回调函数。

### 数据获取函数

#### `getRecognitionResult(): string`
获取最后一次识别的结果。

#### `getAudioBuffer(): number[]`
获取音频数据缓冲区。

#### `isCurrentlyRecording(): boolean`
检查是否正在录音。

#### `getSampleRate(): number`
获取当前采样率设置。

#### `getRecordingDuration(): number`
获取当前录音时长设置。

### 工具函数

#### `clearAudioBuffer()`
清除音频缓冲区数据。

## Edge Impulse模型集成

### 模型文件结构

扩展支持以下Edge Impulse导出的文件：
- `edge-impulse-standalone.wasm` - WebAssembly模型文件
- `edge-impulse-standalone.js` - JavaScript包装器
- `run-impulse.js` - 运行脚本
- `README.md` - 模型说明文档

### 更新模型

要更新语音识别模型，只需替换以下文件：
1. 将新的Edge Impulse导出文件复制到扩展目录
2. 重新编译扩展
3. 上传到micro:bit

### 支持的数据格式

扩展接受以下格式的音频数据：
- 采样率：8kHz - 48kHz
- 位深度：16位
- 通道数：单声道
- 数据格式：整数数组

## 示例项目

### 语音控制LED

```typescript
voiceRecognition.initialize()
voiceRecognition.setSampleRate(16000)
voiceRecognition.setRecordingDuration(1000)

voiceRecognition.onRecognitionCompleted(() => {
    let result = voiceRecognition.getRecognitionResult()
    
    if (result == "on") {
        basic.showIcon(IconNames.Heart)
    } else if (result == "off") {
        basic.clearScreen()
    } else {
        basic.showString(result)
    }
})

input.onButtonPressed(Button.A, () => {
    basic.showIcon(IconNames.SmallHeart)
    voiceRecognition.startRecognition()
})
```

### 语音计数器

```typescript
let counter = 0

voiceRecognition.initialize()
voiceRecognition.onRecognitionCompleted(() => {
    let result = voiceRecognition.getRecognitionResult()
    
    if (result == "up") {
        counter += 1
    } else if (result == "down") {
        counter -= 1
    } else if (result == "reset") {
        counter = 0
    }
    
    basic.showNumber(counter)
})

input.onGesture(Gesture.Shake, () => {
    voiceRecognition.startRecognition()
})
```

## 性能优化

### 采样率选择
- 较低采样率 (8-11kHz)：更快处理，较低精度
- 中等采样率 (16-22kHz)：平衡性能和精度
- 较高采样率 (44kHz)：最高精度，较慢处理

### 录音时长
- 短时长 (100-500ms)：快速响应，可能影响识别精度
- 中等时长 (1000ms)：推荐设置，平衡响应和精度
- 长时长 (2000-5000ms)：高精度，较慢响应

## 故障排除

### 常见问题

**Q: 显示 "INIT FIRST" 错误**
A: 请先调用 `voiceRecognition.initialize()` 初始化模块。

**Q: 识别结果总是 "unknown"**
A: 检查麦克风是否工作正常，尝试调整采样率和录音时长。

**Q: 扩展无法加载**
A: 确保使用micro:bit v2硬件，v1不支持内置麦克风。

**Q: 识别精度较低**
A: 尝试增加录音时长，确保环境安静，检查Edge Impulse模型是否适合当前使用场景。

### 错误代码

- `MODEL_NOT_INITIALIZED`: 模型未初始化
- `NO_DATA`: 没有音频数据
- `CLASSIFICATION_ERROR`: 分类过程出错
- `927`: micro:bit v1硬件不支持

## 技术规格

- 支持的micro:bit版本：v2
- 内存使用：约20KB
- 处理延迟：< 100ms (不包括录音时间)
- 支持的关键词数量：取决于Edge Impulse模型
- 最大音频缓冲区：5000个样本

## 开发和贡献

### 项目结构

```
microbit-voice-recognition/
├── pxt.json                 # 扩展配置文件
├── main.ts                  # 主API接口
├── voice-recognition.ts     # 音频录制和处理
├── edge-impulse-wrapper.ts  # Edge Impulse集成
├── test.ts                  # 测试文件
├── README.md               # 说明文档
└── icon.png                # 扩展图标
```

### 本地开发

1. 克隆项目
2. 安装PXT CLI: `npm install -g pxt`
3. 在项目目录运行: `pxt serve`
4. 在浏览器中打开本地编辑器进行开发

## 许可证

MIT License - 详见LICENSE文件

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本语音识别功能
- 集成Edge Impulse WebAssembly模型
- 提供完整的API接口

## 支持

如有问题或建议，请在GitHub上提交Issue或Pull Request。

---

**注意**: 此扩展需要micro:bit v2硬件支持。在micro:bit v1上使用会显示错误代码927。