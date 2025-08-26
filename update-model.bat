@echo off
echo ========================================
echo Edge Impulse 模型更新工具
echo ========================================
echo.

REM 检查是否提供了模型文件路径
if "%1"=="" (
    echo 用法: update-model.bat "新模型文件路径"
    echo 例如: update-model.bat "C:\path\to\new-model.js"
    pause
    exit /b 1
)

set "NEW_MODEL=%1"

REM 检查文件是否存在
if not exist "%NEW_MODEL%" (
    echo 错误: 文件不存在 - %NEW_MODEL%
    pause
    exit /b 1
)

REM 备份当前模型文件
if exist "edge-impulse-standalone.js" (
    copy "edge-impulse-standalone.js" "edge-impulse-standalone.js.backup.%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
    echo 已备份当前模型文件
)

if exist "edge-impulse-standalone.wasm" (
    copy "edge-impulse-standalone.wasm" "edge-impulse-standalone.wasm.backup.%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
    echo 已备份当前WASM文件
)

REM 复制新模型文件
copy "%NEW_MODEL%" "edge-impulse-standalone.js"

REM 尝试查找对应的WASM文件
set "WASM_FILE=%~dpn1.wasm"
if exist "%WASM_FILE%" (
    copy "%WASM_FILE%" "edge-impulse-standalone.wasm"
    echo 已更新WASM文件
)

echo.
echo ========================================
echo 模型更新完成！
echo ========================================
echo.
echo 下一步操作建议：
echo 1. 运行测试脚本验证新模型: npm test
echo 2. 更新版本号: 修改pxt.json中的版本号
echo 3. 提交更改: git add . && git commit -m "更新Edge Impulse模型"
echo 4. 发布新版本: git tag vX.Y.Z && git push origin vX.Y.Z
echo.

pause