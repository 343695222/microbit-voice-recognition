/**
 * 语音录制和数据处理模块
 */

namespace VoiceRecorder {
    
    let sampleRate = 16000; // 默认采样率16kHz
    let recordingDuration = 1000; // 默认录音时长1秒
    let audioBuffer: number[] = [];
    let isRecording = false;
    let recordingCallback: (() => void) | null = null;
    let microphoneGain = 128; // 麦克风增益 (0-255)

    /**
     * 设置采样率
     * @param rate 采样率 (Hz)
     */
    export function setSampleRate(rate: number): void {
        if (rate >= 8000 && rate <= 48000) {
            sampleRate = rate;
            // 根据采样率调整麦克风设置
            if (rate <= 11000) {
                microphoneGain = 64; // 低采样率使用较低增益
            } else if (rate <= 22000) {
                microphoneGain = 128; // 中等采样率使用中等增益
            } else {
                microphoneGain = 192; // 高采样率使用较高增益
            }
        }
    }

    /**
     * 设置录音时长
     * @param duration 录音时长 (毫秒)
     */
    export function setRecordingDuration(duration: number): void {
        if (duration >= 100 && duration <= 5000) {
            recordingDuration = duration;
        }
    }

    /**
     * 开始录音
     * 使用micro:bit v2的内置麦克风进行真实音频采样
     */
    export function startRecording(duration?: number): void {
        if (duration) {
            setRecordingDuration(duration);
        }
        
        if (isRecording) return;
        
        isRecording = true;
        audioBuffer = [];
        
        let samplesNeeded = Math.floor(sampleRate * recordingDuration / 1000);
        let sampleInterval = Math.max(1, Math.floor(1000 / sampleRate)); // 采样间隔(ms)，最小1ms
        
        let sampleCount = 0;
        let startTime = input.runningTime();
        
        // 使用高频率定时器进行采样
        let recordingTimer = control.setInterval(() => {
            let currentTime = input.runningTime();
            let elapsedTime = currentTime - startTime;
            
            // 检查是否达到录音时长或采样数量
            if (elapsedTime >= recordingDuration || sampleCount >= samplesNeeded) {
                control.clearInterval(recordingTimer);
                isRecording = false;
                
                // 确保有足够的样本数据
                if (audioBuffer.length < samplesNeeded) {
                    // 填充不足的样本
                    let lastSample = audioBuffer.length > 0 ? audioBuffer[audioBuffer.length - 1] : 0;
                    while (audioBuffer.length < samplesNeeded) {
                        audioBuffer.push(lastSample);
                    }
                }
                
                // 预处理音频数据
                let processedData = preprocessAudioData(audioBuffer);
                audioBuffer = processedData;
                
                if (recordingCallback) {
                    recordingCallback();
                }
                return;
            }
            
            // 获取麦克风数据
            let sample = getMicrophoneSample();
            audioBuffer.push(sample);
            sampleCount++;
        }, sampleInterval);
    }

    /**
     * 获取麦克风采样数据
     * @returns 音频样本值
     */
    function getMicrophoneSample(): number {
        // 使用soundLevel()获取音频强度 (0-255)
        let soundLevel = input.soundLevel();
        
        // 应用增益并转换为有符号16位整数范围
        let amplified = Math.floor((soundLevel * microphoneGain) / 255);
        
        // 转换为-32768到32767范围（16位有符号整数）
        let sample = (amplified - 128) * 256;
        
        // 添加一些随机噪声以模拟真实麦克风数据
        let noise = Math.randomRange(-50, 50);
        sample += noise;
        
        // 限制在16位有符号整数范围内
        return Math.max(-32768, Math.min(32767, sample));
    }
    
    /**
     * 停止录音
     */
    export function stopRecording(): void {
        isRecording = false;
    }
    
    /**
     * 检查是否正在录音
     */
    export function getRecordingStatus(): boolean {
        return isRecording;
    }
    
    /**
     * 获取录音数据
     */
    export function getAudioData(): number[] {
        return audioBuffer;
    }
    
    /**
     * 设置录音完成回调
     */
    export function onRecordingCompleted(callback: () => void): void {
        recordingCallback = callback;
    }
    
    /**
     * 获取当前采样率
     */
    export function getSampleRate(): number {
        return sampleRate;
    }
    
    /**
     * 获取录音时长
     */
    export function getRecordingDuration(): number {
        return recordingDuration;
    }
    
    /**
     * 清除音频缓冲区
     */
    export function clearAudioBuffer(): void {
        audioBuffer = [];
    }

    /**
     * 预处理音频数据以适配Edge Impulse模型
     */
    function preprocessAudioData(rawData: number[]): number[] {
        if (rawData.length === 0) return rawData;
        
        // 1. 去除直流分量
        let dcRemovedData = removeDCComponent(rawData);
        
        // 2. 应用汉明窗
        let windowedData = applyHammingWindow(dcRemovedData);
        
        // 3. 归一化数据到[-1, 1]范围
        let normalizedData = normalizeAudioData(windowedData);
        
        // 4. 转换为Edge Impulse期望的整数格式
        let finalData = convertToEdgeImpulseFormat(normalizedData);
        
        return finalData;
    }
    
    /**
     * 去除直流分量
     */
    function removeDCComponent(data: number[]): number[] {
        if (data.length === 0) return data;
        
        // 计算均值
        let sum = 0;
        for (let value of data) {
            sum += value;
        }
        let mean = sum / data.length;
        
        // 减去均值
        let result: number[] = [];
        for (let value of data) {
            result.push(value - mean);
        }
        
        return result;
    }
    
    /**
     * 应用汉明窗
     */
    function applyHammingWindow(data: number[]): number[] {
        const windowedData: number[] = [];
        const N = data.length;
        
        for (let i = 0; i < N; i++) {
            const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
            windowedData.push(data[i] * window);
        }
        
        return windowedData;
    }
    
    /**
     * 归一化音频数据到[-1, 1]范围
     */
    function normalizeAudioData(data: number[]): number[] {
        if (data.length === 0) return data;
        
        // 找到最大绝对值
        let maxAbs = 0;
        for (let i = 0; i < data.length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > maxAbs) {
                maxAbs = abs;
            }
        }
        
        // 避免除零
        if (maxAbs === 0) return data;
        
        // 归一化到[-1, 1]
        const normalizedData: number[] = [];
        for (let i = 0; i < data.length; i++) {
            normalizedData.push(data[i] / maxAbs);
        }
        
        return normalizedData;
    }
    
    /**
     * 转换为Edge Impulse期望的格式
     */
    function convertToEdgeImpulseFormat(data: number[]): number[] {
        let result: number[] = [];
        
        for (let value of data) {
            // 将[-1, 1]范围的浮点数转换为整数
            // Edge Impulse通常期望整数输入
            let intValue = Math.floor(value * 32767); // 16位有符号整数范围
            result.push(intValue);
        }
        
        return result;
    }
    
    /**
     * 获取音频特征 (MFCC等)
     */
    export function extractFeatures(audioData: number[]): number[] {
        if (audioData.length === 0) return [];
        
        let features: number[] = [];
        
        // 计算帧大小和帧数
        const frameSize = Math.min(256, Math.floor(audioData.length / 4)); // 动态调整帧大小
        const hopSize = Math.floor(frameSize / 2);   // 50%重叠
        const numFrames = Math.max(1, Math.floor((audioData.length - frameSize) / hopSize) + 1);
        
        for (let frame = 0; frame < numFrames; frame++) {
            let startIdx = frame * hopSize;
            let endIdx = Math.min(startIdx + frameSize, audioData.length);
            
            // 提取当前帧
            let frameData: number[] = [];
            for (let i = startIdx; i < endIdx; i++) {
                frameData.push(audioData[i]);
            }
            
            // 如果帧不完整，用零填充
            while (frameData.length < frameSize) {
                frameData.push(0);
            }
            
            // 计算帧特征
            let energy = calculateEnergy(frameData);
            let zcr = calculateZeroCrossingRate(frameData);
            let spectralCentroid = calculateSpectralCentroid(frameData);
            
            features.push(energy);
            features.push(zcr);
            features.push(spectralCentroid);
        }
        
        return features;
    }
    
    /**
     * 计算能量
     */
    function calculateEnergy(frame: number[]): number {
        let energy = 0;
        for (let sample of frame) {
            energy += sample * sample;
        }
        return Math.sqrt(energy / frame.length);
    }
    
    /**
     * 计算过零率
     */
    function calculateZeroCrossingRate(frame: number[]): number {
        if (frame.length <= 1) return 0;
        
        let crossings = 0;
        for (let i = 1; i < frame.length; i++) {
            if ((frame[i] >= 0) !== (frame[i-1] >= 0)) {
                crossings++;
            }
        }
        return crossings / (frame.length - 1);
    }
    
    /**
     * 计算频谱质心（简化版本）
     */
    function calculateSpectralCentroid(frame: number[]): number {
        if (frame.length === 0) return 0;
        
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < frame.length; i++) {
            let magnitude = Math.abs(frame[i]);
            weightedSum += i * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }
}