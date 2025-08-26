/**
 * MakeCode Extension Validation Script
 * 验证扩展是否符合MakeCode发布要求
 */

const fs = require('fs');
const path = require('path');

// 验证结果
let validationResults = {
    passed: [],
    warnings: [],
    errors: [],
    score: 0,
    maxScore: 0
};

// 添加验证结果
function addResult(type, message, points = 1) {
    validationResults[type].push(message);
    if (type === 'passed') {
        validationResults.score += points;
    }
    validationResults.maxScore += points;
}

// 检查文件是否存在
function checkFileExists(filePath, description, required = true) {
    const exists = fs.existsSync(filePath);
    if (exists) {
        addResult('passed', `✓ ${description}: ${path.basename(filePath)}`);
        return true;
    } else {
        const type = required ? 'errors' : 'warnings';
        addResult(type, `✗ ${description}: ${path.basename(filePath)} 不存在`);
        return false;
    }
}

// 验证JSON文件格式
function validateJsonFile(filePath, description) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        addResult('passed', `✓ ${description}: JSON格式正确`);
        return json;
    } catch (error) {
        addResult('errors', `✗ ${description}: JSON格式错误 - ${error.message}`);
        return null;
    }
}

// 验证pxt.json配置
function validatePxtJson() {
    console.log('\n=== 验证 pxt.json 配置 ===');
    
    const pxtPath = 'pxt.json';
    if (!checkFileExists(pxtPath, 'pxt.json配置文件')) {
        return;
    }
    
    const pxtJson = validateJsonFile(pxtPath, 'pxt.json');
    if (!pxtJson) return;
    
    // 检查必需字段
    const requiredFields = ['name', 'version', 'description', 'files', 'supportedTargets'];
    requiredFields.forEach(field => {
        if (pxtJson[field]) {
            addResult('passed', `✓ pxt.json包含必需字段: ${field}`);
        } else {
            addResult('errors', `✗ pxt.json缺少必需字段: ${field}`);
        }
    });
    
    // 检查版本格式
    if (pxtJson.version && /^\d+\.\d+\.\d+$/.test(pxtJson.version)) {
        addResult('passed', `✓ 版本号格式正确: ${pxtJson.version}`);
    } else {
        addResult('errors', `✗ 版本号格式错误，应为 x.y.z 格式`);
    }
    
    // 检查支持的目标
    if (pxtJson.supportedTargets && pxtJson.supportedTargets.includes('microbit')) {
        addResult('passed', '✓ 支持micro:bit目标平台');
    } else {
        addResult('errors', '✗ 未指定支持micro:bit目标平台');
    }
    
    // 检查文件列表
    if (pxtJson.files && Array.isArray(pxtJson.files)) {
        addResult('passed', `✓ 文件列表包含 ${pxtJson.files.length} 个文件`);
        
        // 验证列出的文件是否存在
        pxtJson.files.forEach(file => {
            if (fs.existsSync(file)) {
                addResult('passed', `✓ 文件存在: ${file}`);
            } else {
                addResult('errors', `✗ 列出的文件不存在: ${file}`);
            }
        });
    }
}

// 验证TypeScript文件
function validateTypeScriptFiles() {
    console.log('\n=== 验证 TypeScript 文件 ===');
    
    const tsFiles = ['main.ts', 'voice-recognition.ts', 'edge-impulse-wrapper.ts'];
    
    tsFiles.forEach(file => {
        if (checkFileExists(file, `TypeScript文件: ${file}`)) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                
                // 基本语法检查
                if (content.includes('namespace') || content.includes('function') || content.includes('class')) {
                    addResult('passed', `✓ ${file}: 包含有效的TypeScript结构`);
                } else {
                    addResult('warnings', `⚠ ${file}: 可能缺少主要的TypeScript结构`);
                }
                
                // 检查导出
                if (content.includes('//% ') || content.includes('//%')) {
                    addResult('passed', `✓ ${file}: 包含MakeCode注解`);
                } else {
                    addResult('warnings', `⚠ ${file}: 可能缺少MakeCode可视化块注解`);
                }
                
            } catch (error) {
                addResult('errors', `✗ ${file}: 读取文件时出错 - ${error.message}`);
            }
        }
    });
}

// 验证资源文件
function validateAssets() {
    console.log('\n=== 验证资源文件 ===');
    
    // 检查图标
    checkFileExists('icon.png', 'Extension图标', false);
    
    // 检查Edge Impulse文件
    checkFileExists('edge-impulse-standalone.js', 'Edge Impulse JS文件');
    checkFileExists('edge-impulse-standalone.wasm', 'Edge Impulse WASM文件');
    
    // 检查示例和测试文件
    checkFileExists('example.ts', '示例代码文件');
    checkFileExists('test.ts', '测试文件');
}

// 验证文档
function validateDocumentation() {
    console.log('\n=== 验证文档 ===');
    
    checkFileExists('README.md', 'README文档');
    checkFileExists('CHANGELOG.md', '更新日志', false);
    checkFileExists('LICENSE', '许可证文件', false);
    
    // 检查README内容
    if (fs.existsSync('README.md')) {
        const readme = fs.readFileSync('README.md', 'utf8');
        if (readme.length > 500) {
            addResult('passed', '✓ README.md: 内容详细充实');
        } else {
            addResult('warnings', '⚠ README.md: 内容可能过于简单');
        }
        
        if (readme.includes('## ') || readme.includes('### ')) {
            addResult('passed', '✓ README.md: 包含结构化标题');
        } else {
            addResult('warnings', '⚠ README.md: 缺少结构化标题');
        }
    }
}

// 验证Git配置
function validateGitSetup() {
    console.log('\n=== 验证 Git 配置 ===');
    
    checkFileExists('.git', 'Git仓库', true);
    checkFileExists('.gitignore', 'Git忽略文件', false);
    
    // 检查是否有提交
    try {
        const { execSync } = require('child_process');
        const commits = execSync('git log --oneline', { encoding: 'utf8' });
        if (commits.trim()) {
            addResult('passed', '✓ Git: 包含提交历史');
        } else {
            addResult('warnings', '⚠ Git: 没有提交历史');
        }
    } catch (error) {
        addResult('warnings', '⚠ Git: 无法检查提交历史');
    }
}

// 生成验证报告
function generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('           MakeCode扩展验证报告');
    console.log('='.repeat(50));
    
    console.log(`\n📊 总体评分: ${validationResults.score}/${validationResults.maxScore} (${Math.round(validationResults.score/validationResults.maxScore*100)}%)`);
    
    if (validationResults.passed.length > 0) {
        console.log('\n✅ 通过的检查:');
        validationResults.passed.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (validationResults.warnings.length > 0) {
        console.log('\n⚠️  警告:');
        validationResults.warnings.forEach(msg => console.log(`   ${msg}`));
    }
    
    if (validationResults.errors.length > 0) {
        console.log('\n❌ 错误:');
        validationResults.errors.forEach(msg => console.log(`   ${msg}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    // 给出建议
    const scorePercentage = validationResults.score / validationResults.maxScore;
    if (scorePercentage >= 0.9) {
        console.log('🎉 优秀! 您的扩展已准备好发布到GitHub!');
    } else if (scorePercentage >= 0.7) {
        console.log('👍 良好! 建议修复警告后再发布。');
    } else if (scorePercentage >= 0.5) {
        console.log('⚠️  需要改进! 请修复错误和警告后再发布。');
    } else {
        console.log('❌ 需要大量改进! 请修复所有错误后再考虑发布。');
    }
    
    console.log('\n📝 发布检查清单:');
    console.log('   □ 修复所有错误');
    console.log('   □ 处理重要警告');
    console.log('   □ 创建GitHub仓库');
    console.log('   □ 推送代码到GitHub');
    console.log('   □ 创建Release版本');
    console.log('   □ 在MakeCode中测试扩展');
    
    console.log('\n🔗 有用的链接:');
    console.log('   • MakeCode扩展文档: https://makecode.com/extensions');
    console.log('   • GitHub发布指南: ./publish-to-github.md');
    console.log('   • 快速发布脚本: ./quick-publish.bat');
    
    console.log('\n' + '='.repeat(50));
}

// 主验证函数
function runValidation() {
    console.log('开始验证micro:bit语音识别扩展...');
    
    validatePxtJson();
    validateTypeScriptFiles();
    validateAssets();
    validateDocumentation();
    validateGitSetup();
    
    generateReport();
    
    // 保存验证报告
    const reportData = {
        timestamp: new Date().toISOString(),
        score: validationResults.score,
        maxScore: validationResults.maxScore,
        percentage: Math.round(validationResults.score/validationResults.maxScore*100),
        results: validationResults
    };
    
    fs.writeFileSync('validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 详细报告已保存到: validation-report.json');
}

// 运行验证
if (require.main === module) {
    runValidation();
}

module.exports = { runValidation, validationResults };