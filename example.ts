/**
 * 语音识别扩展示例程序
 * 演示如何使用micro:bit语音识别功能
 */

// 初始化语音识别模块
voiceRecognition.initialize();

// 设置采样参数
voiceRecognition.setSampleRate(16000);
voiceRecognition.setRecordingDuration(2000);

// 启用调试模式
voiceRecognition.setDebugMode(true);

// 设置识别完成事件处理
voiceRecognition.onRecognitionCompleted(() => {
    let result = voiceRecognition.getRecognitionResult();
    
    // 显示识别结果
    basic.showString(result);
    
    // 检查特定关键词
    if (voiceRecognition.isKeyword("hello")) {
        basic.showIcon(IconNames.Happy);
        music.playTone(Note.C, music.beat(BeatFraction.Whole));
    } else if (voiceRecognition.isKeyword("goodbye")) {
        basic.showIcon(IconNames.Sad);
        music.playTone(Note.G, music.beat(BeatFraction.Whole));
    } else if (voiceRecognition.containsText("light")) {
        // 如果识别结果包含"light"，点亮LED
        basic.showIcon(IconNames.Diamond);
        led.setBrightness(255);
    } else {
        // 未识别的命令
        basic.showIcon(IconNames.Confused);
    }
    
    // 显示音频缓冲区长度
    basic.pause(1000);
    basic.showNumber(voiceRecognition.getAudioBufferLength());
});

// 按钮A：开始语音识别
input.onButtonPressed(Button.A, () => {
    if (voiceRecognition.isInitialized()) {
        if (!voiceRecognition.isCurrentlyRecording()) {
            basic.showString("LISTEN");
            voiceRecognition.startRecognition();
        } else {
            basic.showString("BUSY");
        }
    } else {
        basic.showString("NOT INIT");
    }
});

// 按钮B：停止录音
input.onButtonPressed(Button.B, () => {
    if (voiceRecognition.isCurrentlyRecording()) {
        voiceRecognition.stopRecording();
        basic.showString("STOPPED");
    } else {
        basic.showString("NOT REC");
    }
});

// 按钮A+B：显示模型信息
input.onButtonPressed(Button.AB, () => {
    let modelInfo = voiceRecognition.getModelInfo();
    basic.showString(modelInfo);
});

// 摇晃：清除音频缓冲区
input.onGesture(Gesture.Shake, () => {
    voiceRecognition.clearAudioBuffer();
    basic.showString("CLEARED");
    basic.showIcon(IconNames.Yes);
});

// Logo按下：显示详细分类结果
input.onLogoEvent(TouchButtonEvent.Pressed, () => {
    let detailed = voiceRecognition.getDetailedClassification();
    basic.showString(detailed);
});

// 启动时显示欢迎信息
basic.showString("VOICE READY");
basic.showIcon(IconNames.Heart);

// 主循环：显示状态指示
basic.forever(() => {
    if (voiceRecognition.isCurrentlyRecording()) {
        // 录音时闪烁红色LED
        led.plot(2, 2);
        basic.pause(200);
        led.unplot(2, 2);
        basic.pause(200);
    } else {
        // 空闲时显示绿色LED
        led.plot(0, 0);
        basic.pause(1000);
        led.unplot(0, 0);
        basic.pause(1000);
    }
});

/**
 * 使用说明：
 * 
 * 1. 按钮A：开始语音识别
 * 2. 按钮B：停止录音
 * 3. 按钮A+B：显示模型信息
 * 4. 摇晃：清除音频缓冲区
 * 5. Logo按下：显示详细分类结果
 * 
 * 支持的语音命令示例：
 * - "hello" - 显示笑脸并播放音调
 * - "goodbye" - 显示哭脸并播放音调
 * - 包含"light"的命令 - 点亮LED
 * 
 * 状态指示：
 * - 录音时：中心LED闪烁
 * - 空闲时：左上角LED慢闪
 */