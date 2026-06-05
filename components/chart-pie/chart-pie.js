Component({
  properties: {
    data: {
      type: Array,
      value: [], // [{label, value, color}]
    },
    size: {
      type: Number,
      value: 200,
    },
  },

  data: {
    segments: [],
    total: 0,
  },

  observers: {
    'data': function(data) {
      if (!data || data.length === 0) return;
      const total = data.reduce((sum, d) => sum + d.value, 0);
      if (total === 0) return;

      let cumulative = 0;
      const segments = data.map(d => {
        const percent = (d.value / total) * 100;
        const startAngle = cumulative;
        cumulative += percent;
        return {
          ...d,
          percent: Math.round(percent),
          startAngle,
          endAngle: cumulative,
        };
      });

      this.setData({ segments, total });
    },
  },
});
