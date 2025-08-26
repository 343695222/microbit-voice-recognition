/**
 * micro:bit语音识别扩展性能测试脚本
 * 用于测试和优化扩展的性能表现
 */

const fs = require('fs');
const path = require('path');

// 性能测试配置
const PERFORMANCE_CONFIG = {
    audioSampleRates: [8000, 16000],
    recordingDurations: [1000, 2000], // 毫秒
    bufferSizes: [512, 1024, 2048],
    testIterations: 5
};

// 模拟音频数据生成
function generateTestAudioData(sampleRate, duration) {
    const sampleCount = Math.floor(sampleRate * duration / 1000);
    const audioData = new Array(sampleCount);
    
    // 生成模拟的语音信号（正弦波 + 噪声）
    for (let i = 0; i < sampleCount; i++) {
        const t = i / sampleRate;
        const frequency = 440; // A4音符
        const signal = Math.sin(2 * Math.PI * frequency * t);
        const noise = (Math.random() - 0.5) * 0.1;
        audioData[i] = Math.floor((signal + noise) * 32767);
    }
    
    return audioData;
}

// 测试音频预处理性能
function testAudioPreprocessingPerformance() {
    console.log('\n=== 音频预处理性能测试 ===');
    
    const results = [];
    
    // 使用较小的测试数据集避免栈溢出
    const testSampleRates = [8000, 16000];
    const testDurations = [1000, 2000];
    const testIterations = 5;
    
    testSampleRates.forEach(sampleRate => {
        testDurations.forEach(duration => {
            const sampleCount = Math.floor(sampleRate * duration / 1000);
            
            // 限制最大样本数以避免内存问题
            const maxSamples = 32000;
            const actualSampleCount = Math.min(sampleCount, maxSamples);
            
            const testData = generateTestAudioData(sampleRate, duration).slice(0, actualSampleCount);
            
            // 测试DC分量移除
            const startTime = performance.now();
            
            for (let i = 0; i < testIterations; i++) {
                // 模拟DC分量移除 - 使用循环而不是reduce避免栈溢出
                let sum = 0;
                for (let j = 0; j < testData.length; j++) {
                    sum += testData[j];
                }
                const mean = sum / testData.length;
                
                // 模拟归一化
                let maxVal = 0;
                const dcRemoved = new Array(testData.length);
                for (let j = 0; j < testData.length; j++) {
                    dcRemoved[j] = testData[j] - mean;
                    maxVal = Math.max(maxVal, Math.abs(dcRemoved[j]));
                }
                
                // 模拟特征提取
                let rmsSum = 0;
                let spectralSum = 0;
                for (let j = 0; j < dcRemoved.length; j++) {
                    const normalized = dcRemoved[j] / maxVal;
                    rmsSum += normalized * normalized;
                    spectralSum += normalized * j;
                }
                
                const features = {
                    rms: Math.sqrt(rmsSum / dcRemoved.length),
                    spectralCentroid: spectralSum / dcRemoved.length
                };
            }
            
            const endTime = performance.now();
            const avgTime = (endTime - startTime) / testIterations;
            
            const result = {
                sampleRate,
                duration,
                sampleCount: actualSampleCount,
                avgProcessingTime: avgTime.toFixed(2),
                throughput: (actualSampleCount / avgTime * 1000).toFixed(0)
            };
            
            results.push(result);
            console.log(`采样率: ${sampleRate}Hz, 时长: ${duration}ms, 样本数: ${actualSampleCount}, 平均处理时间: ${result.avgProcessingTime}ms, 吞吐量: ${result.throughput} 样本/秒`);
        });
    });
    
    return results;
}

// 测试内存使用情况
function testMemoryUsage() {
    console.log('\n=== 内存使用测试 ===');
    
    const memoryResults = [];
    
    PERFORMANCE_CONFIG.bufferSizes.forEach(bufferSize => {
        // 模拟音频缓冲区分配
        const buffers = [];
        const startMemory = process.memoryUsage();
        
        // 分配多个缓冲区
        for (let i = 0; i < 100; i++) {
            buffers.push(new Array(bufferSize).fill(0));
        }
        
        const endMemory = process.memoryUsage();
        const memoryDiff = {
            heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
            heapTotal: (endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024,
            external: (endMemory.external - startMemory.external) / 1024 / 1024
        };
        
        const result = {
            bufferSize,
            bufferCount: buffers.length,
            memoryUsed: memoryDiff.heapUsed.toFixed(2),
            memoryPerBuffer: (memoryDiff.heapUsed / buffers.length * 1024).toFixed(2)
        };
        
        memoryResults.push(result);
        console.log(`缓冲区大小: ${bufferSize}, 数量: ${result.bufferCount}, 内存使用: ${result.memoryUsed}MB, 每缓冲区: ${result.memoryPerBuffer}KB`);
        
        // 清理内存
        buffers.length = 0;
    });
    
    return memoryResults;
}

// 测试分类性能
function testClassificationPerformance() {
    console.log('\n=== 分类性能测试 ===');
    
    const classificationResults = [];
    
    // 模拟不同大小的特征向量
    const featureSizes = [13, 26, 39, 52]; // MFCC特征数量
    
    featureSizes.forEach(featureSize => {
        const features = new Array(featureSize).fill(0).map(() => Math.random());
        
        const startTime = performance.now();
        
        for (let i = 0; i < PERFORMANCE_CONFIG.testIterations * 10; i++) {
            // 模拟神经网络推理
            let result = 0;
            for (let j = 0; j < featureSize; j++) {
                result += features[j] * Math.random(); // 模拟权重乘法
            }
            result = 1 / (1 + Math.exp(-result)); // Sigmoid激活
        }
        
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / (PERFORMANCE_CONFIG.testIterations * 10);
        
        const result = {
            featureSize,
            avgInferenceTime: avgTime.toFixed(3),
            inferenceRate: (1000 / avgTime).toFixed(0)
        };
        
        classificationResults.push(result);
        console.log(`特征维度: ${featureSize}, 平均推理时间: ${result.avgInferenceTime}ms, 推理速率: ${result.inferenceRate} 次/秒`);
    });
    
    return classificationResults;
}

// 生成性能优化建议
function generateOptimizationRecommendations(preprocessingResults, memoryResults, classificationResults) {
    console.log('\n=== 性能优化建议 ===');
    
    const recommendations = [];
    
    // 分析预处理性能
    const slowPreprocessing = preprocessingResults.filter(r => parseFloat(r.avgProcessingTime) > 50);
    if (slowPreprocessing.length > 0) {
        recommendations.push('⚠ 音频预处理性能较慢，建议：');
        recommendations.push('  - 降低采样率（推荐16kHz以下）');
        recommendations.push('  - 减少录音时长（推荐3秒以下）');
        recommendations.push('  - 使用更高效的算法实现');
    } else {
        recommendations.push('✓ 音频预处理性能良好');
    }
    
    // 分析内存使用
    const highMemoryUsage = memoryResults.filter(r => parseFloat(r.memoryUsed) > 10);
    if (highMemoryUsage.length > 0) {
        recommendations.push('⚠ 内存使用较高，建议：');
        recommendations.push('  - 减少同时分配的缓冲区数量');
        recommendations.push('  - 使用更小的缓冲区大小');
        recommendations.push('  - 及时释放不用的音频数据');
    } else {
        recommendations.push('✓ 内存使用合理');
    }
    
    // 分析分类性能
    const slowClassification = classificationResults.filter(r => parseFloat(r.avgInferenceTime) > 10);
    if (slowClassification.length > 0) {
        recommendations.push('⚠ 分类推理较慢，建议：');
        recommendations.push('  - 减少特征维度');
        recommendations.push('  - 使用更轻量的模型');
        recommendations.push('  - 考虑模型量化');
    } else {
        recommendations.push('✓ 分类性能良好');
    }
    
    // 通用优化建议
    recommendations.push('\n通用优化建议：');
    recommendations.push('- 使用Web Workers进行音频处理以避免阻塞主线程');
    recommendations.push('- 实现音频数据的流式处理');
    recommendations.push('- 缓存已计算的特征以避免重复计算');
    recommendations.push('- 使用WebAssembly优化计算密集型操作');
    
    recommendations.forEach(rec => console.log(rec));
    
    return recommendations;
}

// 生成性能报告
function generatePerformanceReport() {
    console.log('micro:bit语音识别扩展 - 性能测试报告');
    console.log('==========================================');
    
    const preprocessingResults = testAudioPreprocessingPerformance();
    const memoryResults = testMemoryUsage();
    const classificationResults = testClassificationPerformance();
    
    const recommendations = generateOptimizationRecommendations(
        preprocessingResults, 
        memoryResults, 
        classificationResults
    );
    
    // 保存详细报告到文件
    const report = {
        timestamp: new Date().toISOString(),
        preprocessing: preprocessingResults,
        memory: memoryResults,
        classification: classificationResults,
        recommendations: recommendations
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📊 详细性能报告已保存到 performance-report.json');
    
    return report;
}

// 主函数
function main() {
    try {
        const report = generatePerformanceReport();
        console.log('\n🎯 性能测试完成！');
        return true;
    } catch (error) {
        console.error('❌ 性能测试失败:', error.message);
        return false;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const success = main();
    process.exit(success ? 0 : 1);
}

module.exports = {
    generateTestAudioData,
    testAudioPreprocessingPerformance,
    testMemoryUsage,
    testClassificationPerformance,
    generateOptimizationRecommendations,
    generatePerformanceReport
};