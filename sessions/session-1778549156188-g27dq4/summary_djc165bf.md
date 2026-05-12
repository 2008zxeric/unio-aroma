## 任务背景
用户对已生成的UNIO AROMA视频制作指南v1不满意，要求：1）将所有AI视频提示词精简至原长度的约一半；2）首帧（Frame 1）和尾帧（Frame 9）升级为更具高级感的设计语言。

## 执行过程
1. 读取v1文件，理解原有9帧结构与提示词风格
2. 提炼模特一致性锚定核心短句（保留关键特征，删减冗余描述）
3. Frame 1升级设计：晨雾+神光穿透+水面镜像对称构图+水墨晕染LOGO显现
4. Frame 9升级设计：极简纯色背景+品牌名渐显+柔和光晕+极慢淡出
5. 其余帧按场景精简提示词，保留镜头参数与核心视觉描述
6. 调用qclaw-text-file技能脚本写入v2文件

## 关键结果
- [Generated file: /Users/EricMac/.qclaw/workspace-ppxchnormoherynj/UNIO_AROMA_Video_Guide_v2.md]
- v2相比v1：提示词长度缩减约50%，首尾帧新增高级设计元素（神光、水墨晕染、镜像对称、极简收尾）
- 模特锚定句简化为：`same Asian female model, chin-length black bob haircut, natural matte skin, serene expression, consistent throughout all frames`

## 结论建议
v2文档已生成，提示词更简洁、首尾帧更高级。建议下一步在AI工具中测试单帧效果，根据输出质量再微调提示词。