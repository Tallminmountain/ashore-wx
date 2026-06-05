const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    gradDays: 0,
    gradDate: '',
    gradSchool: '',
    gradMajor: '',
    ieltsDays: 0,
    ieltsDate: '',
    ieltsScore: '',
    hasGrad: false,
    hasIelts: false,
  },

  onLoad() {
    const today = util.today();
    const info = storage.getUserInfo();

    const data = {};

    if (info.gradExamDate) {
      data.gradDays = Math.max(0, util.daysBetween(today, info.gradExamDate));
      data.gradDate = info.gradExamDate;
      data.gradSchool = info.gradTargetSchool || '目标院校';
      data.gradMajor = info.gradTargetMajor || '';
      data.hasGrad = true;
    }

    if (info.ieltsExamDate) {
      data.ieltsDays = Math.max(0, util.daysBetween(today, info.ieltsExamDate));
      data.ieltsDate = info.ieltsExamDate;
      data.ieltsScore = info.ieltsTargetScore || '';
      data.hasIelts = true;
    }

    this.setData(data);
  },

  editGradDate() {
    wx.showModal({
      title: '修改考研日期',
      editable: true,
      placeholderText: 'YYYY-MM-DD',
      content: this.data.gradDate,
      success: (res) => {
        if (res.confirm && res.content) {
          const info = storage.getUserInfo();
          info.gradExamDate = res.content;
          storage.setUserInfo(info);
          const today = util.today();
          this.setData({
            gradDate: res.content,
            gradDays: Math.max(0, util.daysBetween(today, res.content)),
          });
        }
      },
    });
  },

  editIeltsDate() {
    wx.showModal({
      title: '修改雅思考试日期',
      editable: true,
      placeholderText: 'YYYY-MM-DD',
      content: this.data.ieltsDate,
      success: (res) => {
        if (res.confirm && res.content) {
          const info = storage.getUserInfo();
          info.ieltsExamDate = res.content;
          storage.setUserInfo(info);
          const today = util.today();
          this.setData({
            ieltsDate: res.content,
            ieltsDays: Math.max(0, util.daysBetween(today, res.content)),
          });
        }
      },
    });
  },
});
