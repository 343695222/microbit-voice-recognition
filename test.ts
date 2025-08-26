/**
 * 测试文件
 * 用于测试micro:bit语音识别扩展的各项功能
 */

// 测试状态变量
let testResults: string[] = [];
let currentTestIndex = 0;

// 测试初始化功能
function testInitialization(): void {
    basic.showString("INIT TEST");
    
    let success = voiceRecognition.initialize();
    if (success) {
        basic.showIcon(IconNames.Yes);
        testResults.push("INIT: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("INIT: FAIL");
    }
    
    basic.pause(1000);
}

// 测试采样率和录音时长设置
function testSettings(): void {
    basic.showString("SET TEST");
    
    voiceRecognition.setSampleRate(16000);
    voiceRecognition.setRecordingDuration(1000);
    
    let sampleRate = voiceRecognition.getSampleRate();
    let duration = voiceRecognition.getRecordingDuration();
    
    if (sampleRate === 16000 && duration === 1000) {
        basic.showIcon(IconNames.Yes);
        testResults.push("SETTINGS: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("SETTINGS: FAIL");
    }
    
    basic.showNumber(sampleRate / 1000); // 显示采样率(kHz)
    basic.pause(500);
    basic.showNumber(duration / 100); // 显示录音时长(100ms单位)
    
    basic.pause(1000);
}

// 测试音频数据处理
function testAudioProcessing(): void {
    basic.showString("AUDIO TEST");
    
    // 模拟音频数据
    let testData: number[] = [];
    for (let i = 0; i < 1000; i++) {
        testData.push(Math.randomRange(-100, 100));
    }
    
    // 测试特征提取
    let features = VoiceRecorder.extractFeatures(testData);
    
    if (features.length > 0) {
        basic.showIcon(IconNames.Yes);
        testResults.push("AUDIO: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("AUDIO: FAIL");
    }
    
    basic.showNumber(features.length);
    basic.pause(1000);
}

// 测试Edge Impulse分类
function testEdgeImpulseClassification(): void {
    basic.showString("EI TEST");
    
    if (!EdgeImpulseWrapper.isInitialized()) {
        basic.showString("NOT INIT");
        testResults.push("EI: FAIL - NOT INIT");
        return;
    }
    
    // 模拟音频数据
    let testData: number[] = [];
    for (let i = 0; i < 16000; i++) {
        testData.push(Math.randomRange(-1000, 1000));
    }
    
    let result = EdgeImpulseWrapper.classify(testData);
    
    if (result && result !== "CLASSIFICATION_ERROR") {
        basic.showIcon(IconNames.Yes);
        testResults.push("EI: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("EI: FAIL");
    }
    
    basic.showString(result);
    basic.pause(2000);
}

// 测试完整的语音识别流程
function testCompleteVoiceRecognition(): void {
    basic.showString("FULL TEST");
    
    let testCompleted = false;
    
    voiceRecognition.onRecognitionCompleted(() => {
        let result = voiceRecognition.getRecognitionResult();
        let audioBuffer = voiceRecognition.getAudioBuffer();
        
        if (result && audioBuffer.length > 0) {
            basic.showIcon(IconNames.Yes);
            testResults.push("FULL: PASS");
        } else {
            basic.showIcon(IconNames.No);
            testResults.push("FULL: FAIL");
        }
        
        basic.showString(result);
        basic.showNumber(audioBuffer.length);
        testCompleted = true;
    });
    
    voiceRecognition.startRecognition();
    
    // 等待测试完成或超时
    let timeout = 0;
    while (!testCompleted && timeout < 50) {
        basic.pause(100);
        timeout++;
    }
    
    if (!testCompleted) {
        testResults.push("FULL: TIMEOUT");
    }
}

// 测试性能
function testPerformance(): void {
    basic.showString("PERF TEST");
    
    let startTime = input.runningTime();
    
    // 执行一次完整的分类
    let testData: number[] = [];
    for (let i = 0; i < 16000; i++) {
        testData.push(Math.randomRange(-1000, 1000));
    }
    
    EdgeImpulseWrapper.classify(testData);
    
    let endTime = input.runningTime();
    let duration = endTime - startTime;
    
    if (duration < 5000) { // 如果处理时间少于5秒
        basic.showIcon(IconNames.Yes);
        testResults.push("PERF: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("PERF: SLOW");
    }
    
    basic.showNumber(duration); // 显示处理时间(ms)
    basic.pause(2000);
}

// 测试错误处理
function testErrorHandling(): void {
    basic.showString("ERR TEST");
    
    let errorCount = 0;
    
    // 测试空数据
    let result = EdgeImpulseWrapper.classify([]);
    if (result === "NO_DATA" || result === "CLASSIFICATION_ERROR") {
        errorCount++;
    }
    
    // 测试无效数据
    let invalidData = [NaN, Infinity, -Infinity];
    result = EdgeImpulseWrapper.classify(invalidData);
    if (result === "CLASSIFICATION_ERROR" || result === "unknown") {
        errorCount++;
    }
    
    if (errorCount >= 1) {
        basic.showIcon(IconNames.Yes);
        testResults.push("ERROR: PASS");
    } else {
        basic.showIcon(IconNames.No);
        testResults.push("ERROR: FAIL");
    }
    
    basic.showNumber(errorCount);
    basic.pause(2000);
}

// 显示测试结果
function showTestResults(): void {
    basic.showString("RESULTS");
    
    for (let i = 0; i < testResults.length; i++) {
        basic.showString(testResults[i]);
        basic.pause(1500);
    }
    
    // 统计通过的测试
    let passCount = 0;
    for (let result of testResults) {
        if (result.indexOf("PASS") >= 0) {
            passCount++;
        }
    }
    
    basic.showString(`${passCount}/${testResults.length} PASS`);
}

// 清除测试结果
function clearTestResults(): void {
    testResults = [];
    currentTestIndex = 0;
    basic.showString("CLEARED");
}

// 按钮A：运行基础测试
input.onButtonPressed(Button.A, () => {
    clearTestResults();
    testInitialization();
    testSettings();
    testAudioProcessing();
    showTestResults();
});

// 按钮B：运行高级测试
input.onButtonPressed(Button.B, () => {
    clearTestResults();
    testEdgeImpulseClassification();
    testCompleteVoiceRecognition();
    showTestResults();
});

// 按钮A+B：运行性能和错误测试
input.onButtonPressed(Button.AB, () => {
    clearTestResults();
    testPerformance();
    testErrorHandling();
    showTestResults();
});

// 摇晃：运行完整测试套件
input.onGesture(Gesture.Shake, () => {
    basic.showString("ALL TESTS");
    clearTestResults();
    
    testInitialization();
    testSettings();
    testAudioProcessing();
    testEdgeImpulseClassification();
    testPerformance();
    testErrorHandling();
    
    showTestResults();
    basic.showString("DONE");
});

// Logo按下：显示帮助信息
input.onLogoEvent(TouchButtonEvent.Pressed, () => {
    basic.showString("HELP: A=BASIC B=ADV AB=PERF SHAKE=ALL");
});

// 启动时显示测试说明
basic.showString("VOICE TEST");
basic.showString("A=BASIC B=ADV AB=PERF SHAKE=ALL");
basic.showIcon(IconNames.Happy);