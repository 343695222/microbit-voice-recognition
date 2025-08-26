@echo off
echo ========================================
echo micro:bit Voice Recognition Extension
echo Quick Publish to GitHub Script
echo ========================================
echo.

echo 可选操作: 更新Edge Impulse模型
echo ----------------------------------------
set /p update_model="是否要更新Edge Impulse模型? (y/n): "
if /i "%update_model%"=="y" (
    echo.
    echo 请提供新模型文件的完整路径:
    set /p model_path="模型文件路径: "
    if exist "update-model.bat" (
        call update-model.bat "%model_path%"
    ) else (
        echo 错误: update-model.bat 文件不存在
        echo 请确保模型更新工具已创建
    )
    echo.
)

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding any new changes...
git add .
echo.

echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update extension files
git commit -m "%commit_msg%"
echo.

echo Step 4: Pushing to GitHub...
echo Please make sure you have set up the remote repository first:
echo git remote add origin https://github.com/YOUR_USERNAME/microbit-voice-recognition.git
echo.
echo Current remotes:
git remote -v
echo.

set /p push_confirm="Do you want to push to GitHub now? (y/n): "
if /i "%push_confirm%"=="y" (
    echo Pushing to main branch...
    git push -u origin main
    echo.
    echo ========================================
    echo SUCCESS! Your extension has been pushed to GitHub.
    echo.
    echo Next steps:
    echo 1. Go to your GitHub repository
    echo 2. Create a new release (v1.0.0)
    echo 3. Add release notes from CHANGELOG.md
    echo 4. Test the extension in MakeCode
    echo.
    echo Your extension URL for MakeCode:
    echo https://github.com/YOUR_USERNAME/microbit-voice-recognition
    echo ========================================
) else (
    echo Push cancelled. You can push manually later with:
    echo git push -u origin main
)

echo.
echo Press any key to exit...
pause >nul