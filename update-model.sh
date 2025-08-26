#!/bin/bash

echo "========================================"
echo "Edge Impulse 模型更新工具"
echo "========================================"
echo

# 检查是否提供了模型文件路径
if [ $# -eq 0 ]; then
    echo "用法: ./update-model.sh <新模型文件路径>"
    echo "例如: ./update-model.sh /path/to/new-model.js"
    exit 1
fi

NEW_MODEL="$1"

# 检查文件是否存在
if [ ! -f "$NEW_MODEL" ]; then
    echo "错误: 文件不存在 - $NEW_MODEL"
    exit 1
fi

# 备份当前模型文件
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

if [ -f "edge-impulse-standalone.js" ]; then
    cp "edge-impulse-standalone.js" "edge-impulse-standalone.js.backup.$TIMESTAMP"
    echo "已备份当前模型文件"
fi

if [ -f "edge-impulse-standalone.wasm" ]; then
    cp "edge-impulse-standalone.wasm" "edge-impulse-standalone.wasm.backup.$TIMESTAMP"
    echo "已备份当前WASM文件"
fi

# 复制新模型文件
cp "$NEW_MODEL" "edge-impulse-standalone.js"

# 尝试查找对应的WASM文件
WASM_FILE="${NEW_MODEL%.*}.wasm"
if [ -f "$WASM_FILE" ]; then
    cp "$WASM_FILE" "edge-impulse-standalone.wasm"
    echo "已更新WASM文件"
fi

echo
echo "========================================"
echo "模型更新完成！"
echo "========================================"
echo
echo "下一步操作建议："
echo "1. 运行测试脚本验证新模型: npm test"
echo "2. 更新版本号: 修改pxt.json中的版本号"
echo "3. 提交更改: git add . && git commit -m '更新Edge Impulse模型'"
echo "4. 发布新版本: git tag vX.Y.Z && git push origin vX.Y.Z"
echo