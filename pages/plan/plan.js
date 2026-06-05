const storage = require('../../utils/storage');
const util = require('../../utils/util');
const taskUtil = require('../../utils/task');

Page({
  data: {
    currentTab: 'today', // today | week | grad | ielts
    todayDate: '',
    todayTasks: [],
    weekDays: [],
    gradTasks: [],
    ieltsTasks: [],
    postponedTasks: [],
    hasGoal: false,
  },

  onShow() {
    this._loadData();
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 1 });
    }
  },

  _loadData() {
    const today = util.today();
    const userInfo = storage.getUserInfo();

    // 今日任务
    const todayTasks = storage.getTasksByDate(today);

    // 本周数据
    const { start, end } = util.getWeekRange(today);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date(start).getTime() + i * 86400000);
      const dateStr = util.formatDateStr(d);
      const dayTasks = storage.getTasksByDate(dateStr);
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      weekDays.push({
        date: dateStr,
        dayNum: d.getDate(),
        weekDay: util.getWeekDay(d),
        isToday: dateStr === today,
        total: dayTasks.length,
        completed,
        rate: util.percentage(completed, dayTasks.length),
      });
    }

    // 考研/雅思分类
    const allTasks = storage.getAllTasks();
    const gradTasks = allTasks.filter(t => t.type === 'grad').slice(-20);
    const ieltsTasks = allTasks.filter(t => t.type === 'ielts').slice(-20);

    // 延期任务
    const postponedTasks = allTasks.filter(t => t.status === 'postponed');

    this.setData({
      todayDate: today,
      todayTasks,
      weekDays,
      gradTasks,
      ieltsTasks,
      postponedTasks,
      hasGoal: !!(userInfo.gradTargetSchool || userInfo.ieltsTargetScore),
    });
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  onTaskTap(e) {
    const { task } = e.detail;
    wx.navigateTo({ url: `/pages/task-detail/task-detail?id=${task.id}` });
  },

  onTaskStart(e) {
    const { task } = e.detail;
    storage.updateTask(task.id, { status: 'in_progress' });
    wx.navigateTo({ url: `/pages/timer/timer?taskId=${task.id}` });
  },

  // 手动添加任务
  addTask() {
    wx.showActionSheet({
      itemList: ['添加考研任务', '添加雅思任务'],
      success: (res) => {
        const type = res.tapIndex === 0 ? 'grad' : 'ielts';
        this._showAddTaskDialog(type);
      },
    });
  },

  _showAddTaskDialog(type) {
    wx.navigateTo({
      url: `/pages/task-detail/task-detail?mode=add&type=${type}`,
    });
  },

  // 延期任务处理
  handlePostponed() {
    const tasks = this.data.postponedTasks;
    if (tasks.length === 0) return;

    wx.showModal({
      title: '延期任务处理',
      content: `有 ${tasks.length} 个延期任务，是否移到今天？`,
      success: (res) => {
        if (res.confirm) {
          const today = util.today();
          tasks.forEach(t => {
            storage.updateTask(t.id, { date: today, status: 'pending' });
          });
          wx.showToast({ title: '已移到今天', icon: 'success' });
          this._loadData();
        }
      },
    });
  },
});
