const { STATUS_TEXT, STATUS_COLOR } = require('../../utils/task');
const { formatDuration } = require('../../utils/util');

Component({
  properties: {
    task: {
      type: Object,
      value: {},
    },
    showActions: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    statusText: '',
    statusColor: '',
    timeText: '',
  },

  observers: {
    'task': function(task) {
      if (task && task.status) {
        this.setData({
          statusText: STATUS_TEXT[task.status] || '未知',
          statusColor: STATUS_COLOR[task.status] || '#8E8E93',
          timeText: formatDuration(task.plannedMinutes || 0),
        });
      }
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { task: this.data.task });
    },
    onStart() {
      this.triggerEvent('start', { task: this.data.task });
    },
    onComplete() {
      this.triggerEvent('complete', { task: this.data.task });
    },
  },
});
