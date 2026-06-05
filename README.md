# 上岸计划 · Ashore

一款面向考研 & 雅思备考学生的学习管理微信小程序，帮助你科学规划学习任务、追踪学习进度、高效利用每一分钟。

## 功能特性

### 🏠 首页
- 考研 / 雅思考试倒计时
- 今日学习进度概览（任务完成率、学习时长）
- 每日鼓励语
- 一键打卡

### 🎯 目标设置
- 三步引导式设置：考研目标 → 雅思目标 → 学习时间
- 考研：设置目标院校、专业、考试时间、考试科目
- 雅思：设置目标分数、当前水平、学习计划（听力/阅读/写作/口语）

### 📋 任务计划
- 根据目标自动生成每日学习任务
- 任务类型涵盖考研科目 & 雅思四项
- 任务状态管理：待开始 → 进行中 → 已完成 / 已延期

### ⏱️ 学习计时
- **正向计时**：自由记录学习时长
- **番茄钟**：专注 + 休息循环，提升学习效率
- 可关联具体任务，自动记录学习数据
- 环形进度动画

### 📊 数据统计
- 今日 / 本周 / 本月学习时长
- 连续打卡天数
- 任务完成率统计
- 每周学习时长柱状图
- 科目学习占比饼图
- 雅思四项练习次数统计

### 👤 个人中心
- 查看和编辑个人信息
- 学习目标管理

## 项目结构

```
├── app.js / app.json / app.wxss    # 应用入口
├── pages/
│   ├── home/            # 首页
│   ├── plan/            # 计划页
│   ├── timer/           # 计时页
│   ├── stats/           # 数据统计页
│   ├── profile/         # 个人中心
│   ├── checkin/         # 打卡页
│   ├── countdown/       # 倒计时页
│   ├── goal-setup/      # 目标设置页
│   └── task-detail/     # 任务详情页
├── components/
│   ├── navigation-bar/  # 自定义导航栏
│   ├── tab-bar/         # 自定义底部标签栏
│   ├── task-card/       # 任务卡片
│   ├── timer-ring/      # 环形计时器
│   ├── countdown-card/  # 倒计时卡片
│   ├── progress-bar/    # 进度条
│   ├── chart-bar/       # 柱状图
│   ├── chart-pie/       # 饼图
│   └── empty-state/     # 空状态占位
├── custom-tab-bar/      # 自定义 TabBar
└── utils/
    ├── storage.js       # 本地存储封装
    ├── task.js          # 任务生成逻辑
    └── util.js          # 工具函数
```

## 技术栈

- **框架**：微信小程序原生开发
- **渲染引擎**：Skyline
- **组件框架**：glass-easel
- **数据存储**：wx.setStorageSync / wx.getStorageSync（本地存储）

## 使用方式

1. 克隆项目
   ```bash
   git clone https://github.com/Tallminmountain/ashore-wx.git
   ```
2. 使用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 导入项目
3. 在 `project.config.json` 中确认 AppID 或使用测试号
4. 编译运行即可

## 截图

> 欢迎补充小程序截图

## License

MIT
