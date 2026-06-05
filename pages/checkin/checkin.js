const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    today: '',
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    totalMinutes: 0,
    isAllDone: false,
    feeling: '',
    checkedIn: false,
    encouragement: '',
    consecutiveDays: 0,
    feelings: ['😊 很充实', '😤 有点累但值得', '😐 一般般', '🥱 有点划水', '🔥 状态超好'],
  },

  onLoad() {
    this._loadData();
  },

  _loadData() {
    const today = util.today();
    const tasks = storage.getTasksByDate(today);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
    const existingCheckin = storage.getCheckinByDate(today);

    this.setData({
      today,
      totalTasks,
      completedTasks,
      completionRate: util.percentage(completedTasks, totalTasks),
      totalMinutes,
      isAllDone: completedTasks === totalTasks && totalTasks > 0,
      checkedIn: !!existingCheckin,
      encouragement: util.getRandomEncouragement(),
      consecutiveDays: storage.getConsecutiveDays(),
    });
  },

  selectFeeling(e) {
    this.setData({ feeling: e.currentTarget.dataset.value });
  },

  doCheckin() {
    const today = util.today();
    const existing = storage.getCheckinByDate(today);
    if (existing) {
      wx.showToast({ title: '今天已经打卡了', icon: 'none' });
      return;
    }

    const consecutiveDays = storage.getConsecutiveDays() + 1;

    storage.addCheckin({
      date: today,
      completedTasks: this.data.completedTasks,
      totalTasks: this.data.totalTasks,
      totalMinutes: this.data.totalMinutes,
      completionRate: this.data.completionRate,
      feeling: this.data.feeling,
      consecutiveDays,
    });

    this.setData({
      checkedIn: true,
      consecutiveDays,
    });

    wx.showToast({ title: '打卡成功！', icon: 'success' });
  },
});
