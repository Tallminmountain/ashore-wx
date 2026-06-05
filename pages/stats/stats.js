const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    currentPeriod: 'week', // week | month
    // 总览数据
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    consecutiveDays: 0,
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    unfinishedCount: 0,
    postponedCount: 0,
    // 图表数据
    weeklyBarData: [],
    subjectPieData: [],
    ieltsSkills: {
      listening: 0,
      reading: 0,
      writing: 0,
      speaking: 0,
    },
    hasData: false,
  },

  onShow() {
    this._loadData();
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().setData({ selected: 3 });
    }
  },

  _loadData() {
    const today = util.today();
    const { start: weekStart, end: weekEnd } = util.getWeekRange(today);
    const { start: monthStart, end: monthEnd } = util.getMonthRange(today);

    // 今日统计
    const todayRecords = storage.getRecordsByDate(today);
    const todayMinutes = todayRecords.reduce((sum, r) => sum + (r.duration || 0), 0);

    // 本周统计
    const weekRecords = storage.getRecordsByRange(weekStart, weekEnd);
    const weekMinutes = weekRecords.reduce((sum, r) => sum + (r.duration || 0), 0);

    // 本月统计
    const monthRecords = storage.getRecordsByRange(monthStart, monthEnd);
    const monthMinutes = monthRecords.reduce((sum, r) => sum + (r.duration || 0), 0);

    // 连续打卡天数
    const consecutiveDays = storage.getConsecutiveDays();

    // 任务统计
    const allTasks = storage.getAllTasks();
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const unfinishedCount = allTasks.filter(t => t.status === 'pending').length;
    const postponedCount = allTasks.filter(t => t.status === 'postponed').length;

    // 每周柱状图数据
    const weeklyBarData = [];
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(new Date(weekStart).getTime() + i * 86400000);
      const dateStr = util.formatDateStr(d);
      const dayRecords = storage.getRecordsByDate(dateStr);
      const minutes = dayRecords.reduce((sum, r) => sum + (r.duration || 0), 0);
      weeklyBarData.push({
        label: weekDays[i],
        value: minutes,
        color: i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) ? 'var(--primary)' : 'var(--primary-light)',
      });
    }

    // 科目占比饼图
    const subjectMap = {};
    allTasks.filter(t => t.status === 'completed').forEach(t => {
      const key = t.subject || t.title;
      subjectMap[key] = (subjectMap[key] || 0) + (t.actualMinutes || t.plannedMinutes || 0);
    });
    const subjectColors = ['#4A90D9', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#00C9DB', '#FF6B9D'];
    const subjectPieData = Object.entries(subjectMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value], idx) => ({
        label,
        value,
        color: subjectColors[idx % subjectColors.length],
      }));

    // 雅思四项统计
    const ieltsTasks = allTasks.filter(t => t.type === 'ielts' && t.status === 'completed');
    const ieltsSkills = {
      listening: ieltsTasks.filter(t => t.skill === 'listening').length,
      reading: ieltsTasks.filter(t => t.skill === 'reading').length,
      writing: ieltsTasks.filter(t => t.skill === 'writing').length,
      speaking: ieltsTasks.filter(t => t.skill === 'speaking').length,
    };

    this.setData({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      consecutiveDays,
      totalTasks,
      completedTasks,
      completionRate: util.percentage(completedTasks, totalTasks),
      unfinishedCount,
      postponedCount,
      weeklyBarData,
      subjectPieData,
      ieltsSkills,
      hasData: totalTasks > 0,
    });
  },

  switchPeriod(e) {
    this.setData({ currentPeriod: e.currentTarget.dataset.period });
  },
});
