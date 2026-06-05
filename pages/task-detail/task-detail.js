const storage = require('../../utils/storage');
const util = require('../../utils/util');
const { STATUS_TEXT, STATUS_COLOR, createTask } = require('../../utils/task');

Page({
  data: {
    mode: 'view', // view | add
    taskId: '',   // 任务 ID 存入 data，避免 Skyline 下私有变量时序问题
    task: null,
    statusText: '',
    statusColor: '',
    timeText: '',
    // 添加模式
    taskType: 'grad',
    title: '',
    content: '',
    plannedMinutes: 30,
    minuteOptions: [15, 20, 30, 40, 50, 60, 90, 120],
  },

  onLoad(options) {
    if (options.mode === 'add') {
      this.setData({
        mode: 'add',
        taskType: options.type || 'grad',
      });
    } else if (options.id) {
      this.setData({ taskId: options.id });
      this._loadTask(options.id);
    }
  },

  onShow() {
    // 从计时页返回时刷新任务状态
    if (this.data.taskId) {
      this._loadTask(this.data.taskId);
    }
  },

  _loadTask(id) {
    const task = storage.getAllTasks().find(t => t.id === id);
    if (task) {
      this.setData({
        task,
        statusText: STATUS_TEXT[task.status] || '',
        statusColor: STATUS_COLOR[task.status] || '',
        timeText: util.formatDuration(task.plannedMinutes),
      });
    }
  },

  // 添加模式：输入（兼容文本输入和选项芯片点击）
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.currentTarget.dataset.value !== undefined
      ? e.currentTarget.dataset.value
      : e.detail.value;
    this.setData({ [field]: value });
  },

  selectMinutes(e) {
    this.setData({ plannedMinutes: parseInt(e.currentTarget.dataset.value) });
  },

  // 保存新任务
  saveTask() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none' });
      return;
    }

    const task = createTask({
      date: util.today(),
      type: this.data.taskType,
      subject: this.data.taskType === 'grad' ? this.data.title : '雅思',
      title: this.data.title,
      content: this.data.content,
      plannedMinutes: this.data.plannedMinutes,
      icon: this.data.taskType === 'grad' ? '📋' : '🌍',
    });

    storage.addTask(task);
    wx.showToast({ title: '任务已添加', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  // 开始学习
  startStudy() {
    const id = this.data.taskId;
    storage.updateTask(id, { status: 'in_progress' });
    wx.navigateTo({ url: `/pages/timer/timer?taskId=${id}` });
  },

  // 完成任务
  completeTask() {
    const task = this.data.task;
    storage.updateTask(this.data.taskId, {
      status: 'completed',
      actualMinutes: task.actualMinutes || task.plannedMinutes,
    });
    wx.showToast({ title: '已完成 ✅', icon: 'none' });
    this._loadTask(this.data.taskId);
  },

  // 延期到明天
  postponeTask() {
    const tomorrow = util.formatDateStr(new Date(Date.now() + 86400000));
    storage.updateTask(this.data.taskId, { date: tomorrow, status: 'pending' });
    wx.showToast({ title: '已延期到明天', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  // 跳过任务
  skipTask() {
    storage.updateTask(this.data.taskId, { status: 'skipped' });
    wx.showToast({ title: '已跳过', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  // 删除任务
  deleteTask() {
    wx.showModal({
      title: '删除任务',
      content: '确定要删除这个任务吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTask(this.data.taskId);
          wx.showToast({ title: '已删除', icon: 'none' });
          setTimeout(() => wx.navigateBack(), 800);
        }
      },
    });
  },

  // 修改时长
  editMinutes() {
    const taskId = this.data.taskId;
    if (!taskId) {
      wx.showToast({ title: '任务ID无效', icon: 'none' });
      return;
    }
    wx.showActionSheet({
      itemList: this.data.minuteOptions.map(m => `${m}分钟`),
      success: (res) => {
        const minutes = this.data.minuteOptions[res.tapIndex];
        storage.updateTask(taskId, { plannedMinutes: minutes });
        this._loadTask(taskId);
        wx.showToast({ title: `已改为${minutes}分钟`, icon: 'none' });
      },
    });
  },
});
