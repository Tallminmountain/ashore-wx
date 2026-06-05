const { formatSeconds } = require('../../utils/util');

Component({
  properties: {
    seconds: {
      type: Number,
      value: 0,
    },
    totalSeconds: {
      type: Number,
      value: 0, // 0 = 正向计时模式，>0 = 番茄钟模式
    },
    running: {
      type: Boolean,
      value: false,
    },
    label: {
      type: String,
      value: '',
    },
  },

  data: {
    timeDisplay: '00:00',
    progress: 0, // 0~1
    circumference: 2 * Math.PI * 120,
    strokeDashoffset: 0,
  },

  observers: {
    'seconds, totalSeconds': function(seconds, totalSeconds) {
      this.setData({
        timeDisplay: formatSeconds(seconds),
      });

      if (totalSeconds > 0) {
        const progress = Math.min(seconds / totalSeconds, 1);
        const offset = this.data.circumference * (1 - progress);
        this.setData({ progress, strokeDashoffset: offset });
      } else {
        // 正向计时：一直转圈
        const progress = (seconds % 60) / 60;
        const offset = this.data.circumference * (1 - progress);
        this.setData({ progress, strokeDashoffset: offset });
      }
    },
  },
});
