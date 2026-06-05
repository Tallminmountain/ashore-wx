Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: '🏠' },
      { pagePath: '/pages/plan/plan', text: '计划', icon: '📋' },
      { pagePath: '/pages/timer/timer', text: '计时', icon: '⏱️' },
      { pagePath: '/pages/stats/stats', text: '数据', icon: '📊' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤' },
    ],
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = this.data.list[data.index].pagePath;
      wx.switchTab({ url });
    },
  },
});
