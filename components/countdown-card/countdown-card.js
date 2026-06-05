const { daysBetween } = require('../../utils/util');

Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    targetDate: {
      type: String,
      value: '',
    },
    icon: {
      type: String,
      value: '📅',
    },
    color: {
      type: String,
      value: 'var(--primary)',
    },
  },

  data: {
    days: 0,
    expired: false,
  },

  lifetimes: {
    attached() {
      this._updateDays();
    },
  },

  observers: {
    'targetDate': function() {
      this._updateDays();
    },
  },

  methods: {
    _updateDays() {
      if (!this.data.targetDate) return;
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const days = daysBetween(todayStr, this.data.targetDate);
      this.setData({
        days: Math.max(0, days),
        expired: days < 0,
      });
    },
    onTap() {
      this.triggerEvent('tap');
    },
  },
});
