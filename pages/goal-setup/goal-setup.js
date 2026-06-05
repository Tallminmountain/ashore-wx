const storage = require('../../utils/storage');
const { GRAD_SUBJECTS } = require('../../utils/task');

Page({
  data: {
    step: 1, // 1=考研, 2=雅思, 3=时间
    // 考研
    gradTargetSchool: '',
    gradTargetMajor: '',
    gradExamDate: '',
    gradSubjects: [],
    allGradSubjects: GRAD_SUBJECTS,
    // 雅思
    ieltsTargetScore: '',
    ieltsCurrentLevel: '',
    ieltsExamDate: '',
    ieltsPlan: {
      listening: true,
      reading: true,
      writing: false,
      speaking: false,
    },
    // 时间
    dailyStudyHours: 4,
    dailyIeltsHours: 1,
    // 预设选项
    scoreOptions: ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0'],
    levelOptions: ['四级水平', '六级水平', '专四水平', '雅思5分基础', '雅思5.5分基础', '雅思6分基础'],
    hourOptions: [2, 3, 4, 5, 6, 8],
    ieltsHourOptions: [0.5, 1, 1.5, 2, 3],
  },

  onLoad() {
    const info = storage.getUserInfo();
    this.setData({
      gradTargetSchool: info.gradTargetSchool || '',
      gradTargetMajor: info.gradTargetMajor || '',
      gradExamDate: info.gradExamDate || '',
      gradSubjects: info.gradSubjects || [],
      ieltsTargetScore: info.ieltsTargetScore || '',
      ieltsCurrentLevel: info.ieltsCurrentLevel || '',
      ieltsExamDate: info.ieltsExamDate || '',
      ieltsPlan: info.ieltsPlan || { listening: true, reading: true, writing: false, speaking: false },
      dailyStudyHours: info.dailyStudyHours || 4,
      dailyIeltsHours: info.dailyIeltsHours || 1,
    });
  },

  // 输入绑定（兼容文本输入和选项芯片点击）
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.currentTarget.dataset.value !== undefined
      ? e.currentTarget.dataset.value
      : e.detail.value;
    this.setData({ [field]: value });
  },

  // 选择考研科目
  toggleSubject(e) {
    const name = e.currentTarget.dataset.name;
    let subjects = [...this.data.gradSubjects];
    const idx = subjects.indexOf(name);
    if (idx === -1) {
      subjects.push(name);
    } else {
      subjects.splice(idx, 1);
    }
    this.setData({ gradSubjects: subjects });
  },

  // 切换雅思计划
  toggleIeltsPlan(e) {
    const skill = e.currentTarget.dataset.skill;
    const plan = { ...this.data.ieltsPlan };
    plan[skill] = !plan[skill];
    this.setData({ ieltsPlan: plan });
  },

  // 选择日期
  onDateChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  // 选择分数
  selectScore(e) {
    this.setData({ ieltsTargetScore: e.currentTarget.dataset.value });
  },

  // 选择基础
  selectLevel(e) {
    this.setData({ ieltsCurrentLevel: e.currentTarget.dataset.value });
  },

  // 步骤切换
  nextStep() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
    }
  },

  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 });
    }
  },

  // 跳过
  skip() {
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 });
    } else {
      this._save();
    }
  },

  // 保存
  save() {
    this._save();
  },

  _save() {
    const info = storage.getUserInfo();
    const updated = {
      ...info,
      gradTargetSchool: this.data.gradTargetSchool,
      gradTargetMajor: this.data.gradTargetMajor,
      gradExamDate: this.data.gradExamDate,
      gradSubjects: this.data.gradSubjects,
      ieltsTargetScore: this.data.ieltsTargetScore,
      ieltsCurrentLevel: this.data.ieltsCurrentLevel,
      ieltsExamDate: this.data.ieltsExamDate,
      ieltsPlan: this.data.ieltsPlan,
      dailyStudyHours: this.data.dailyStudyHours,
      dailyIeltsHours: this.data.dailyIeltsHours,
    };

    storage.setUserInfo(updated);
    const app = getApp();
    app.globalData.userInfo = updated;
    app.refreshTodayTasks();

    wx.showToast({ title: '目标设置完成！', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },
});
