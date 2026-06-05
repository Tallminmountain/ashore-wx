Component({
  properties: {
    data: {
      type: Array,
      value: [], // [{label, value, color}]
    },
    maxValue: {
      type: Number,
      value: 0,
    },
    height: {
      type: Number,
      value: 240,
    },
    showLabel: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    chartData: [],
    computedMax: 0,
  },

  observers: {
    'data, maxValue': function(data, maxValue) {
      if (!data || data.length === 0) return;
      const max = maxValue || Math.max(...data.map(d => d.value), 1);
      const chartData = data.map(d => ({
        ...d,
        barHeight: Math.round((d.value / max) * 100),
      }));
      this.setData({ chartData, computedMax: max });
    },
  },
});
