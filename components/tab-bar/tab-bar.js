Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: '🏠', iconSelected: '🏠' },
      { pagePath: '/pages/plan/plan', text: '计划', icon: '📋', iconSelected: '📋' },
      { pagePath: '/pages/timer/timer', text: '计时', icon: '⏱️', iconSelected: '⏱️' },
      { pagePath: '/pages/stats/stats', text: '数据', icon: '📊', iconSelected: '📊' },
      { pagePath: '/pages/profile/profile', text: '我的', icon: '👤', iconSelected: '👤' },
    ],
  },

  methods: {
    switchTab(e) {
      const idx = e.currentTarget.dataset.index;
      const url = this.data.list[idx].pagePath;
      wx.switchTab({ url });
    },
  },
});
