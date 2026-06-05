const storage = require('../../utils/storage');
const util = require('../../utils/util');
const taskUtil = require('../../utils/task');

Page({
  data: {
    today: '',
    todayCN: '',
    weekDay: '',
    encouragement: '',
    tasks: [],
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    totalPlannedMinutes: 0,
    studiedMinutes: 0,
    gradExamDate: '',
    ieltsExamDate: '',
    gradCountdown: 0,
    ieltsCountdown: 0,
    hasGoal: false,
  },

  onShow() {
    this._loadData();
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 0 });
    }
  },

  _loadData() {
    const now = new Date();
    const today = util.today();
    const userInfo = storage.getUserInfo();

    // 日期信息
    this.setData({
      today,
      todayCN: `${now.getMonth() + 1}月${now.getDate()}日`,
      weekDay: util.getWeekDay(now),
      encouragement: util.getRandomEncouragement(),
      hasGoal: !!(userInfo.gradTargetSchool || userInfo.ieltsTargetScore),
      gradExamDate: userInfo.gradExamDate || '',
      ieltsExamDate: userInfo.ieltsExamDate || '',
    });

    // 倒计时
    if (userInfo.gradExamDate) {
      this.setData({ gradCountdown: Math.max(0, util.daysBetween(today, userInfo.gradExamDate)) });
    }
    if (userInfo.ieltsExamDate) {
      this.setData({ ieltsCountdown: Math.max(0, util.daysBetween(today, userInfo.ieltsExamDate)) });
    }

    // 今日任务
    let tasks = storage.getTasksByDate(today);

    // 如果没有任务且有目标，自动生成
    if (tasks.length === 0 && userInfo.gradTargetSchool) {
      const newTasks = taskUtil.generateDailyTasks(today, userInfo);
      newTasks.forEach(t => storage.addTask(t));
      tasks = storage.getTasksByDate(today);
    }

    // 统计
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalPlannedMinutes = tasks.reduce((sum, t) => sum + (t.plannedMinutes || 0), 0);
    const studiedMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);

    this.setData({
      tasks,
      totalTasks,
      completedTasks,
      completionRate: util.percentage(completedTasks, totalTasks),
      totalPlannedMinutes,
      studiedMinutes,
    });
  },

  // 点击任务卡片
  onTaskTap(e) {
    const { task } = e.detail;
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?id=${task.id}`,
    });
  },

  // 开始学习任务
  onTaskStart(e) {
    const { task } = e.detail;
    // 更新任务状态为进行中
    storage.updateTask(task.id, { status: 'in_progress' });
    // 跳转到计时页面
    wx.navigateTo({
      url: `/pages/timer/timer?taskId=${task.id}`,
    });
  },

  // 完成任务
  onTaskComplete(e) {
    const { task } = e.detail;
    storage.updateTask(task.id, {
      status: 'completed',
      actualMinutes: task.actualMinutes || task.plannedMinutes,
    });
    wx.showToast({ title: '已完成 ✅', icon: 'none' });
    this._loadData();
  },

  // 去设置目标
  goGoalSetup() {
    wx.navigateTo({ url: '/pages/goal-setup/goal-setup' });
  },

  // 去打卡
  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/checkin' });
  },

  // 查看倒计时
  goCountdown() {
    wx.navigateTo({ url: '/pages/countdown/countdown' });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this._loadData();
    wx.stopPullDownRefresh();
  },
});
