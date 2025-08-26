/**
 * Voice Recognition Extension for micro:bit
 * Provides voice recognition capabilities using Edge Impulse models
 */

//% color=#FF6B35 icon="\uf130" block="Voice Recognition" weight=100
namespace voiceRecognition {
    // 全局变量
    let isInitialized = false;
    let currentSampleRate = 16000;
    let currentRecordingDuration = 1000;
    let audioBuffer: number[] = [];
    let recognitionResult = "";
    let recognitionCompletedHandler: () => void = null;
    let debugMode = false;

    /**
     * 初始化语音识别模块
     * @returns 是否初始化成功
     */
    //% block="initialize voice recognition"
    //% group="Setup"
    //% weight=100
    //% blockId=voice_init
    export function initialize(): boolean {
        if (isInitialized) {
            return true;
        }
        
        try {
            // 初始化Edge Impulse模块
            EdgeImpulseWrapper.initialize();
            
            // 设置默认参数
            VoiceRecorder.setSampleRate(currentSampleRate);
            VoiceRecorder.setRecordingDuration(currentRecordingDuration);
            
            isInitialized = true;
            
            if (debugMode) {
                basic.showString("INIT OK");
            }
            
            return true;
        } catch (error) {
            if (debugMode) {
                basic.showString("INIT ERR");
            }
            return false;
        }
    }

    /**
     * 设置采样率
     * @param rate 采样率 (Hz)
     */
    //% block="set sample rate to %rate Hz"
    //% rate.min=8000 rate.max=44100 rate.defl=16000
    //% group="Setup"
    //% weight=90
    //% blockId=voice_sample_rate
    export function setSampleRate(rate: number): void {
        currentSampleRate = rate;
        if (isInitialized) {
            VoiceRecorder.setSampleRate(rate);
        }
    }

    /**
     * 设置录音时长
     * @param duration 录音时长 (毫秒)
     */
    //% block="set recording duration to %duration ms"
    //% duration.min=500 duration.max=5000 duration.defl=1000
    //% group="Setup"
    //% weight=85
    //% blockId=voice_duration
    export function setRecordingDuration(duration: number): void {
        currentRecordingDuration = duration;
        if (isInitialized) {
            VoiceRecorder.setRecordingDuration(duration);
        }
    }

    /**
     * 开始语音识别
     */
    //% block="start voice recognition"
    //% group="Recognition"
    //% weight=80
    //% blockId=voice_start
    export function startRecognition(): void {
        if (!isInitialized) {
            if (debugMode) {
                basic.showString("NOT INIT");
            }
            return;
        }
        
        if (VoiceRecorder.getRecordingStatus()) {
            if (debugMode) {
                basic.showString("RECORDING");
            }
            return;
        }
        
        // 设置录音完成回调
        VoiceRecorder.setRecordingCompletedCallback(() => {
            // 获取音频数据
            audioBuffer = VoiceRecorder.getAudioData();
            
            // 进行分类
            recognitionResult = EdgeImpulseWrapper.classify(audioBuffer);
            
            // 调用用户设置的回调
            if (recognitionCompletedHandler) {
                recognitionCompletedHandler();
            }
        });
        
        // 开始录音
        VoiceRecorder.startRecording();
    }

    /**
     * 停止录音
     */
    //% block="stop recording"
    //% group="Recognition"
    //% weight=75
    //% blockId=voice_stop
    export function stopRecording(): void {
        VoiceRecorder.stopRecording();
    }

    /**
     * 获取识别结果
     * @returns 识别结果字符串
     */
    //% block="recognition result"
    //% group="Results"
    //% weight=70
    //% blockId=voice_result
    export function getRecognitionResult(): string {
        return recognitionResult;
    }

    /**
     * 检查识别结果是否为指定关键词
     * @param keyword 要检查的关键词
     * @returns 是否匹配
     */
    //% block="recognition result is %keyword"
    //% group="Results"
    //% weight=65
    //% blockId=voice_is_keyword
    export function isKeyword(keyword: string): boolean {
        return recognitionResult.toLowerCase() === keyword.toLowerCase();
    }

    /**
     * 检查识别结果是否包含指定文本
     * @param text 要检查的文本
     * @returns 是否包含
     */
    //% block="recognition result contains %text"
    //% group="Results"
    //% weight=60
    //% blockId=voice_contains
    export function containsText(text: string): boolean {
        return recognitionResult.toLowerCase().indexOf(text.toLowerCase()) >= 0;
    }

    /**
     * 设置识别完成事件处理器
     * @param handler 事件处理函数
     */
    //% block="on recognition completed"
    //% group="Events"
    //% weight=55
    //% blockId=voice_on_completed
    export function onRecognitionCompleted(handler: () => void): void {
        recognitionCompletedHandler = handler;
    }

    /**
     * 检查是否正在录音
     * @returns 是否正在录音
     */
    //% block="is currently recording"
    //% group="Status"
    //% weight=50
    //% blockId=voice_is_recording
    export function isCurrentlyRecording(): boolean {
        return VoiceRecorder.getRecordingStatus();
    }

    /**
     * 检查是否已初始化
     * @returns 是否已初始化
     */
    //% block="is initialized"
    //% group="Status"
    //% weight=45
    //% blockId=voice_is_init
    export function isInitialized(): boolean {
        return isInitialized;
    }

    /**
     * 获取音频缓冲区长度
     * @returns 音频数据长度
     */
    //% block="audio buffer length"
    //% group="Advanced"
    //% weight=40
    //% blockId=voice_buffer_length
    export function getAudioBufferLength(): number {
        return audioBuffer.length;
    }

    /**
     * 获取音频缓冲区
     * @returns 音频数据数组
     */
    //% block="audio buffer"
    //% group="Advanced"
    //% weight=35
    //% blockId=voice_buffer
    //% advanced=true
    export function getAudioBuffer(): number[] {
        return audioBuffer;
    }

    /**
     * 清除音频缓冲区
     */
    //% block="clear audio buffer"
    //% group="Advanced"
    //% weight=30
    //% blockId=voice_clear_buffer
    //% advanced=true
    export function clearAudioBuffer(): void {
        audioBuffer = [];
        VoiceRecorder.clearAudioBuffer();
    }

    /**
     * 获取当前采样率
     * @returns 当前采样率
     */
    //% block="current sample rate"
    //% group="Advanced"
    //% weight=25
    //% blockId=voice_get_sample_rate
    //% advanced=true
    export function getSampleRate(): number {
        return VoiceRecorder.getSampleRate();
    }

    /**
     * 获取当前录音时长
     * @returns 当前录音时长
     */
    //% block="current recording duration"
    //% group="Advanced"
    //% weight=20
    //% blockId=voice_get_duration
    //% advanced=true
    export function getRecordingDuration(): number {
        return VoiceRecorder.getRecordingDuration();
    }

    /**
     * 获取模型信息
     * @returns 模型信息字符串
     */
    //% block="model info"
    //% group="Advanced"
    //% weight=15
    //% blockId=voice_model_info
    //% advanced=true
    export function getModelInfo(): string {
        const props = EdgeImpulseWrapper.getModelProperties();
        return `${props.modelName} (${props.classCount} classes)`;
    }

    /**
     * 获取详细分类结果
     * @returns 详细分类结果
     */
    //% block="detailed classification"
    //% group="Advanced"
    //% weight=10
    //% blockId=voice_detailed_result
    //% advanced=true
    export function getDetailedClassification(): string {
        return EdgeImpulseWrapper.getDetailedClassification(audioBuffer);
    }

    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    //% block="set debug mode %enabled"
    //% group="Advanced"
    //% weight=5
    //% blockId=voice_debug
    //% advanced=true
    export function setDebugMode(enabled: boolean): void {
        debugMode = enabled;
    }
}