const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    userInfo: {},
    avatarUrl: '',
    pomodoroText: '25/5分钟',
    consecutiveDays: 0,
    totalStudyMinutes: 0,
    totalTasks: 0,
    completedTasks: 0,
  },

  onShow() {
    this._loadData();
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 4 });
    }
  },

  _loadData() {
    const userInfo = storage.getUserInfo();
    const consecutiveDays = storage.getConsecutiveDays();
    const allRecords = storage.getAllRecords();
    const totalStudyMinutes = allRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
    const allTasks = storage.getAllTasks();
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;

    const timerSettings = storage.getTimerSettings();

    this.setData({
      userInfo,
      avatarUrl: userInfo.avatarUrl || '',
      pomodoroText: `${timerSettings.pomodoroWorkMinutes}/${timerSettings.pomodoroRestMinutes}分钟`,
      consecutiveDays,
      totalStudyMinutes,
      totalTasks: allTasks.length,
      completedTasks,
    });
  },

  // 更换头像
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        // 保存到本地持久化
        try {
          const fs = wx.getFileSystemManager();
          const fileName = 'avatar_' + Date.now() + '.jpg';
          const savedPath = `${wx.env.USER_DATA_PATH}/${fileName}`;
          fs.saveFile({
            tempFilePath: tempPath,
            filePath: savedPath,
            success: () => {
              const userInfo = this.data.userInfo;
              userInfo.avatarUrl = savedPath;
              storage.setUserInfo(userInfo);
              this.setData({ avatarUrl: savedPath, userInfo });
              wx.showToast({ title: '头像已更新', icon: 'success' });
            },
            fail: () => {
              // 保存失败时直接使用临时路径（重启后会失效，但至少能显示）
              const userInfo = this.data.userInfo;
              userInfo.avatarUrl = tempPath;
              storage.setUserInfo(userInfo);
              this.setData({ avatarUrl: tempPath, userInfo });
            },
          });
        } catch (e) {
          const userInfo = this.data.userInfo;
          userInfo.avatarUrl = tempPath;
          storage.setUserInfo(userInfo);
          this.setData({ avatarUrl: tempPath, userInfo });
        }
      },
    });
  },

  // 设置目标
  goGoalSetup() {
    wx.navigateTo({ url: '/pages/goal-setup/goal-setup' });
  },

  // 编辑昵称
  editNickname() {
    wx.showModal({
      title: '设置昵称',
      editable: true,
      placeholderText: '输入你的昵称',
      content: this.data.userInfo.nickname || '',
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = this.data.userInfo;
          userInfo.nickname = res.content;
          storage.setUserInfo(userInfo);
          this.setData({ userInfo });
        }
      },
    });
  },

  // 修改每日学习时间
  editDailyHours() {
    wx.showActionSheet({
      itemList: ['2小时', '3小时', '4小时', '5小时', '6小时', '8小时'],
      success: (res) => {
        const hours = [2, 3, 4, 5, 6, 8][res.tapIndex];
        const userInfo = this.data.userInfo;
        userInfo.dailyStudyHours = hours;
        storage.setUserInfo(userInfo);
        this.setData({ userInfo });
        wx.showToast({ title: `已设为每天${hours}小时`, icon: 'none' });
      },
    });
  },

  // 修改雅思学习时间
  editIeltsHours() {
    wx.showActionSheet({
      itemList: ['0.5小时', '1小时', '1.5小时', '2小时', '3小时'],
      success: (res) => {
        const hours = [0.5, 1, 1.5, 2, 3][res.tapIndex];
        const userInfo = this.data.userInfo;
        userInfo.dailyIeltsHours = hours;
        storage.setUserInfo(userInfo);
        this.setData({ userInfo });
        wx.showToast({ title: `已设为每天${hours}小时雅思`, icon: 'none' });
      },
    });
  },

  // 番茄钟设置
  editPomodoro() {
    wx.showActionSheet({
      itemList: ['15分钟工作/3分钟休息', '20分钟工作/5分钟休息', '25分钟工作/5分钟休息', '30分钟工作/5分钟休息', '45分钟工作/10分钟休息'],
      success: (res) => {
        const presets = [
          { work: 15, rest: 3 },
          { work: 20, rest: 5 },
          { work: 25, rest: 5 },
          { work: 30, rest: 5 },
          { work: 45, rest: 10 },
        ];
        const setting = presets[res.tapIndex];
        storage.setTimerSettings({
          pomodoroWorkMinutes: setting.work,
          pomodoroRestMinutes: setting.rest,
        });
        this.setData({ pomodoroText: `${setting.work}/${setting.rest}分钟` });
        wx.showToast({ title: `已设为${setting.work}/${setting.rest}分钟`, icon: 'none' });
      },
    });
  },

  // 清除数据
  clearData() {
    wx.showModal({
      title: '清除所有数据',
      content: '确定要清除所有学习数据吗？此操作不可恢复。',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '数据已清除', icon: 'success' });
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/home/home' });
          }, 1000);
        }
      },
    });
  },
});
