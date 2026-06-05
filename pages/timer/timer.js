const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    mode: 'forward', // forward | pomodoro
    running: false,
    paused: false,
    seconds: 0,
    totalSeconds: 0, // 番茄钟总秒数
    currentTask: null,
    taskList: [],
    pomodoroWorkMinutes: 25,
    pomodoroRestMinutes: 5,
    isResting: false,
    roundCount: 0, // 番茄钟轮数
  },

  _timer: null,
  _taskId: '',

  onLoad(options) {
    const settings = storage.getTimerSettings();
    this.setData({
      pomodoroWorkMinutes: settings.pomodoroWorkMinutes,
      pomodoroRestMinutes: settings.pomodoroRestMinutes,
    });

    if (options.taskId) {
      this._taskId = options.taskId;
      const task = storage.getAllTasks().find(t => t.id === options.taskId);
      if (task) {
        this.setData({
          currentTask: task,
          mode: 'forward',
        });
        this._startTimer();
      }
    }

    this._loadTaskList();
  },

  onShow() {
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 2 });
    }
  },

  onUnload() {
    this._stopTimer();
  },

  _loadTaskList() {
    const today = util.today();
    const tasks = storage.getTasksByDate(today).filter(
      t => t.status === 'pending' || t.status === 'postponed'
    );
    this.setData({ taskList: tasks });
  },

  // 切换模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (this.data.running) {
      wx.showModal({
        title: '切换模式',
        content: '切换模式将停止当前计时，确定吗？',
        success: (res) => {
          if (res.confirm) {
            this._stopTimer();
            this.setData({ mode, seconds: 0, totalSeconds: 0, isResting: false });
            if (mode === 'pomodoro') {
              this.setData({ totalSeconds: this.data.pomodoroWorkMinutes * 60 });
            }
          }
        },
      });
    } else {
      this.setData({ mode, seconds: 0, isResting: false });
      if (mode === 'pomodoro') {
        this.setData({ totalSeconds: this.data.pomodoroWorkMinutes * 60 });
      } else {
        this.setData({ totalSeconds: 0 });
      }
    }
  },

  // 选择任务
  selectTask(e) {
    const idx = e.currentTarget.dataset.index;
    const task = this.data.taskList[idx];
    this._taskId = task.id;
    this.setData({ currentTask: task });
    storage.updateTask(task.id, { status: 'in_progress' });
  },

  // 开始/暂停
  toggleTimer() {
    if (this.data.running) {
      this._pauseTimer();
    } else {
      this._startTimer();
    }
  },

  _startTimer() {
    this.setData({ running: true, paused: false });
    this._timer = setInterval(() => {
      let seconds = this.data.seconds + 1;
      this.setData({ seconds });

      // 番茄钟模式：时间到
      if (this.data.mode === 'pomodoro' && seconds >= this.data.totalSeconds) {
        this._onPomodoroComplete();
      }
    }, 1000);
  },

  _pauseTimer() {
    this.setData({ running: false, paused: true });
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  _stopTimer() {
    this.setData({ running: false, paused: false });
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  // 番茄钟完成
  _onPomodoroComplete() {
    this._stopTimer();
    const roundCount = this.data.roundCount + 1;
    this.setData({ roundCount });

    if (this.data.isResting) {
      // 休息结束，开始下一轮工作
      wx.showToast({ title: '休息结束，开始下一轮！', icon: 'none' });
      this.setData({
        isResting: false,
        seconds: 0,
        totalSeconds: this.data.pomodoroWorkMinutes * 60,
      });
    } else {
      // 工作结束，进入休息
      wx.showToast({ title: `第${roundCount}个番茄完成！休息一下~`, icon: 'none' });
      this._playSound();
      this.setData({
        isResting: true,
        seconds: 0,
        totalSeconds: this.data.pomodoroRestMinutes * 60,
      });
    }
  },

  _playSound() {
    // 振动提醒
    wx.vibrateShort({ type: 'heavy' });
    setTimeout(() => wx.vibrateShort({ type: 'heavy' }), 500);
  },

  // 结束计时
  finishTimer() {
    if (this.data.seconds === 0) {
      wx.showToast({ title: '还没有开始计时', icon: 'none' });
      return;
    }

    this._pauseTimer();
    const minutes = Math.ceil(this.data.seconds / 60);

    wx.showActionSheet({
      itemList: ['✅ 已完成', '⏳ 未完成', '📅 延后完成', '❌ 放弃任务'],
      success: (res) => {
        const statusMap = ['completed', 'pending', 'postponed', 'abandoned'];
        const status = statusMap[res.tapIndex];

        if (this._taskId) {
          // 更新任务状态和实际时长
          const task = storage.getAllTasks().find(t => t.id === this._taskId);
          const prevMinutes = task ? (task.actualMinutes || 0) : 0;
          storage.updateTask(this._taskId, {
            status,
            actualMinutes: prevMinutes + minutes,
          });

          // 记录学习记录
          storage.addRecord({
            taskId: this._taskId,
            date: util.today(),
            duration: minutes,
            mode: this.data.mode,
            note: this.data.mode === 'pomodoro' ? `${this.data.roundCount}个番茄` : '',
          });
        }

        const messages = ['太棒了！继续加油 💪', '没关系，下次继续', '已延后，别忘了哦', '已放弃'];
        wx.showToast({ title: messages[res.tapIndex], icon: 'none' });

        this.setData({
          seconds: 0,
          roundCount: 0,
          currentTask: null,
          isResting: false,
        });
        this._taskId = '';
        this._loadTaskList();
      },
    });
  },

  // 重置计时
  resetTimer() {
    this._stopTimer();
    this.setData({ seconds: 0, isResting: false, roundCount: 0 });
    if (this.data.mode === 'pomodoro') {
      this.setData({ totalSeconds: this.data.pomodoroWorkMinutes * 60 });
    }
  },
});
