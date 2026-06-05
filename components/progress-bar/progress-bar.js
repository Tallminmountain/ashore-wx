Component({
  properties: {
    percent: {
      type: Number,
      value: 0,
    },
    height: {
      type: Number,
      value: 16,
    },
    color: {
      type: String,
      value: '',
    },
    showText: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    barColor: '',
  },

  observers: {
    'percent, color': function(percent, color) {
      let c = color;
      if (!c) {
        if (percent >= 80) c = 'var(--success)';
        else if (percent >= 50) c = 'var(--primary)';
        else if (percent >= 30) c = 'var(--warning)';
        else c = 'var(--danger)';
      }
      this.setData({ barColor: c });
    },
  },
});
