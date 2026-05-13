#!/bin/bash
# UNIO AROMA 部署前验证脚本
# 每次 deploy 前执行，避免上线后出现空白页

set -e

echo "🔍 ===== 部署前验证 ====="

# 1. 检查 git 分支
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 当前分支: $BRANCH"
if [ "$BRANCH" != "main" ]; then
    echo "⚠️  不在 main 分支！"
fi

# 2. 确保工作区干净
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ 工作区有未提交的改动！请先 commit"
    exit 1
fi

# 3. 检查是否往 package.json 添加了不必要的依赖
NEW_DEPS=$(git diff HEAD~1 -- package.json 2>/dev/null | grep '^+ ' | grep -v '+++' | grep -v '^+   "' | head -5)
if [ -n "$NEW_DEPS" ]; then
    echo "⚠️  最近有新增依赖（可能影响构建缓存）："
    echo "$NEW_DEPS"
fi

# 4. 构建
echo "📦 构建中..."
npm run build 2>&1 | tail -3

# 5. 检查 dist 中是否包含正确的 index.html
if [ ! -f "dist/index.html" ]; then
    echo "❌ 构建产物缺少 index.html"
    exit 1
fi

# 6. 检查 dist 中是否有 JS 文件且不为空
JS_FILES=$(find dist/assets -name '*.js' -type f | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    echo "❌ 构建产物中无 JS 文件"
    exit 1
fi

echo "✅ JS 文件数: $JS_FILES"

# 7. 检查 index.html 是否正确引用了 JS
if ! grep -q 'src="/assets/index-' dist/index.html 2>/dev/null && ! grep -q 'src="assets/index-' dist/index.html 2>/dev/null; then
    echo "❌ index.html 未正确引用 JS 文件"
    cat dist/index.html | head -20
    exit 1
fi

echo "✅ index.html 校验通过"

# 8. 启动本地预览并验证首页能渲染
echo "🌐 启动本地预览..."
npx vite preview --port 3000 &
PREVIEW_PID=$!
sleep 3

# 检查 HTTP 200
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "000")
kill $PREVIEW_PID 2>/dev/null

if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ 本地预览返回 $HTTP_CODE (期望200)"
    exit 1
fi

echo "✅ 本地预览 HTTP 200"

echo ""
echo "🎉 ===== 验证通过，可以部署！====="
