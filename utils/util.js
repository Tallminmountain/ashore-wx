/**
 * 通用工具函数
 */

/**
 * 格式化秒数为 HH:MM:SS
 */
function formatSeconds(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * 格式化秒数为可读时长，如 "1小时20分钟"
 */
function formatDuration(minutes) {
  if (minutes < 1) return '不足1分钟';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}分钟`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分钟`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function today() {
  return formatDateStr(new Date());
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}

/**
 * 获取中文星期
 */
function getWeekDay(date) {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return '周' + days[date.getDay()];
}

/**
 * 格式化日期为中文
 */
function formatDateCN(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 计算两个日期之间的天数差
 */
function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * 获取本周的起止日期（周一到周日）
 */
function getWeekRange(date) {
  const d = new Date(date || new Date());
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // 周一为起始
  const monday = new Date(d.getTime() - diff * 86400000);
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  return {
    start: formatDateStr(monday),
    end: formatDateStr(sunday),
  };
}

/**
 * 获取本月的起止日期
 */
function getMonthRange(date) {
  const d = new Date(date || new Date());
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: formatDateStr(first),
    end: formatDateStr(last),
  };
}

/**
 * 计算百分比
 */
function percentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * 随机鼓励语
 */
function getRandomEncouragement() {
  const list = [
    '今天又离上岸近了一步 🎯',
    '坚持不是突然爆发，而是每天多学一点 💪',
    '完成今天的任务，就是赢过昨天的自己 ⭐',
    '日拱一卒，功不唐捐 📚',
    '你现在的努力，是未来的底气 🌟',
    '不积跬步，无以至千里 🚀',
    '学习是最好的投资，坚持就是最大的天赋 ✨',
    '每一个今天都是你余生中最年轻的一天 🌈',
    '比起天赋，坚持更难得 🔥',
    '稳住节奏，你能行！💫',
  ];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * 生成提醒文案
 */
function getReminderText(type, data) {
  const reminders = {
    dailyStart: [
      '今天的学习任务还没开始，要不要先完成一个小任务？',
      '新的一天开始了，先看看今天的安排吧 ☀️',
      '早起的鸟儿有虫吃，先打开今天的学习计划～',
    ],
    unfinished: [
      '今天还有任务没完成哦，加油冲一把！',
      '剩下的任务不多了，再坚持一下 💪',
      '完成今天的计划再休息吧～',
    ],
    checkin: [
      '今天还没有打卡，别忘了记录你的努力哦！',
      '打卡是对自己最好的认可，今天记得打卡～',
    ],
    countdown: [
      `距离考研还有 ${data?.days || '?'} 天，今天也要稳住节奏。`,
      `考研倒计时 ${data?.days || '?'} 天，每一天都很重要。`,
    ],
    ieltsCountdown: [
      `雅思考试还有 ${data?.days || '?'} 天，保持练习频率。`,
    ],
    noStudy: [
      '已经几天没学习了，今天可以从简单的任务开始 🌱',
      '休息够了的话，回来继续吧，上岸在等你。',
    ],
    lowCompletion: [
      `最近${data?.subject || ''}任务完成率较低，建议今天优先安排。`,
    ],
  };
  const list = reminders[type] || reminders.dailyStart;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  formatSeconds,
  formatDuration,
  pad,
  today,
  formatDateStr,
  getWeekDay,
  formatDateCN,
  daysBetween,
  getWeekRange,
  getMonthRange,
  percentage,
  getRandomEncouragement,
  getReminderText,
};
