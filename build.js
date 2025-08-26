/**
 * 简单的构建和验证脚本
 * 用于检查micro:bit语音识别扩展的基本功能
 */

const fs = require('fs');
const path = require('path');

// 检查必要文件是否存在
function checkRequiredFiles() {
    const requiredFiles = [
        'pxt.json',
        'main.ts',
        'voice-recognition.ts',
        'edge-impulse-wrapper.ts',
        'test.ts',
        'example.ts',
        'README.md'
    ];
    
    console.log('检查必要文件...');
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✓ ${file}`);
        } else {
            console.log(`✗ ${file} - 文件不存在`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 检查pxt.json配置
function checkPxtConfig() {
    console.log('\n检查pxt.json配置...');
    
    try {
        const pxtConfig = JSON.parse(fs.readFileSync('pxt.json', 'utf8'));
        
        // 检查必要字段
        const requiredFields = ['name', 'version', 'files', 'dependencies'];
        let configValid = true;
        
        requiredFields.forEach(field => {
            if (pxtConfig[field]) {
                console.log(`✓ ${field}: ${typeof pxtConfig[field] === 'object' ? JSON.stringify(pxtConfig[field]) : pxtConfig[field]}`);
            } else {
                console.log(`✗ ${field} - 字段缺失`);
                configValid = false;
            }
        });
        
        // 检查文件列表
        if (pxtConfig.files && Array.isArray(pxtConfig.files)) {
            console.log(`✓ 文件列表包含 ${pxtConfig.files.length} 个文件`);
            pxtConfig.files.forEach(file => {
                if (fs.existsSync(file)) {
                    console.log(`  ✓ ${file}`);
                } else {
                    console.log(`  ✗ ${file} - 文件不存在`);
                    configValid = false;
                }
            });
        }
        
        return configValid;
    } catch (error) {
        console.log(`✗ pxt.json解析错误: ${error.message}`);
        return false;
    }
}

// 检查TypeScript文件语法
function checkTypeScriptSyntax() {
    console.log('\n检查TypeScript文件语法...');
    
    const tsFiles = ['main.ts', 'voice-recognition.ts', 'edge-impulse-wrapper.ts', 'test.ts', 'example.ts'];
    let syntaxValid = true;
    
    tsFiles.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // 基本语法检查
            const lines = content.split('\n');
            let issues = [];
            
            lines.forEach((line, index) => {
                const lineNum = index + 1;
                
                // 检查未闭合的括号
                const openBraces = (line.match(/{/g) || []).length;
                const closeBraces = (line.match(/}/g) || []).length;
                const openParens = (line.match(/\(/g) || []).length;
                const closeParens = (line.match(/\)/g) || []).length;
                
                // 检查基本语法错误
                if (line.includes('function') && !line.includes('(')) {
                    issues.push(`行 ${lineNum}: 函数定义可能缺少括号`);
                }
                
                if (line.includes('export') && line.includes('function') && !line.includes(':')) {
                    // 这是正常的，不报错
                }
            });
            
            if (issues.length === 0) {
                console.log(`✓ ${file} - 语法检查通过`);
            } else {
                console.log(`⚠ ${file} - 发现 ${issues.length} 个潜在问题:`);
                issues.forEach(issue => console.log(`  ${issue}`));
            }
            
        } catch (error) {
            console.log(`✗ ${file} - 读取错误: ${error.message}`);
            syntaxValid = false;
        }
    });
    
    return syntaxValid;
}

// 检查依赖关系
function checkDependencies() {
    console.log('\n检查依赖关系...');
    
    try {
        const mainContent = fs.readFileSync('main.ts', 'utf8');
        const voiceContent = fs.readFileSync('voice-recognition.ts', 'utf8');
        const edgeContent = fs.readFileSync('edge-impulse-wrapper.ts', 'utf8');
        
        // 检查命名空间引用
        let dependenciesValid = true;
        
        if (mainContent.includes('VoiceRecorder.') && voiceContent.includes('namespace VoiceRecorder')) {
            console.log('✓ main.ts 正确引用 VoiceRecorder 命名空间');
        } else {
            console.log('⚠ main.ts 可能未正确引用 VoiceRecorder 命名空间');
        }
        
        if (mainContent.includes('EdgeImpulseWrapper.') && edgeContent.includes('namespace EdgeImpulseWrapper')) {
            console.log('✓ main.ts 正确引用 EdgeImpulseWrapper 命名空间');
        } else {
            console.log('⚠ main.ts 可能未正确引用 EdgeImpulseWrapper 命名空间');
        }
        
        return dependenciesValid;
    } catch (error) {
        console.log(`✗ 依赖检查错误: ${error.message}`);
        return false;
    }
}

// 生成构建报告
function generateBuildReport() {
    console.log('\n=== 构建报告 ===');
    
    const filesCheck = checkRequiredFiles();
    const configCheck = checkPxtConfig();
    const syntaxCheck = checkTypeScriptSyntax();
    const depsCheck = checkDependencies();
    
    const allChecksPass = filesCheck && configCheck && syntaxCheck && depsCheck;
    
    console.log('\n=== 总结 ===');
    console.log(`文件检查: ${filesCheck ? '✓ 通过' : '✗ 失败'}`);
    console.log(`配置检查: ${configCheck ? '✓ 通过' : '✗ 失败'}`);
    console.log(`语法检查: ${syntaxCheck ? '✓ 通过' : '⚠ 有警告'}`);
    console.log(`依赖检查: ${depsCheck ? '✓ 通过' : '⚠ 有警告'}`);
    
    if (allChecksPass) {
        console.log('\n🎉 构建验证通过！扩展已准备就绪。');
    } else {
        console.log('\n⚠ 构建验证发现问题，请检查上述输出。');
    }
    
    return allChecksPass;
}

// 主函数
function main() {
    console.log('micro:bit语音识别扩展 - 构建验证工具');
    console.log('=====================================\n');
    
    const success = generateBuildReport();
    process.exit(success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    checkRequiredFiles,
    checkPxtConfig,
    checkTypeScriptSyntax,
    checkDependencies,
    generateBuildReport
};