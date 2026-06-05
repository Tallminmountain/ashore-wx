const storage = require('./utils/storage');
const util = require('./utils/util');
const taskUtil = require('./utils/task');

App({
  globalData: {
    userInfo: null,
    statusBarHeight: 0,
  },

  onLaunch() {
    // 获取系统信息
    const sysInfo = wx.getWindowInfo();
    this.globalData.statusBarHeight = sysInfo.statusBarHeight;

    // 加载用户信息
    this.globalData.userInfo = storage.getUserInfo();

    // 首次启动引导
    if (storage.isFirstLaunch()) {
      this._initFirstLaunch();
    }

    // 检查今日任务是否已生成
    this._ensureTodayTasks();
  },

  /**
   * 首次启动初始化
   */
  _initFirstLaunch() {
    storage.setLaunched();
    // 跳转到目标设置页
    setTimeout(() => {
      wx.navigateTo({ url: '/pages/goal-setup/goal-setup' });
    }, 500);
  },

  /**
   * 确保今日任务已生成
   */
  _ensureTodayTasks() {
    const today = util.today();
    const todayTasks = storage.getTasksByDate(today);
    if (todayTasks.length === 0) {
      const userInfo = this.globalData.userInfo;
      // 只有设置了目标才自动生成
      if (userInfo.gradTargetSchool || userInfo.ieltsTargetScore) {
        const newTasks = taskUtil.generateDailyTasks(today, userInfo);
        newTasks.forEach(t => storage.addTask(t));
      }
    }

    // 检查是否有延期任务需要处理
    this._handlePendingTasks(today);
  },

  /**
   * 处理昨天未完成的任务
   */
  _handlePendingTasks(today) {
    const yesterday = util.formatDateStr(new Date(Date.now() - 86400000));
    const pendingYesterday = storage.getTasksByDate(yesterday).filter(
      t => t.status === 'pending' || t.status === 'in_progress'
    );

    if (pendingYesterday.length > 0) {
      // 自动标记为延期
      pendingYesterday.forEach(t => {
        storage.updateTask(t.id, { status: 'postponed' });
      });
    }
  },

  /**
   * 刷新今日任务
   */
  refreshTodayTasks() {
    this._ensureTodayTasks();
  },
});
