/**
 * 任务模板与生成逻辑
 */

// 考研默认科目模板
const GRAD_SUBJECTS = [
  { name: '高等数学', icon: '📐', category: 'math' },
  { name: '线性代数', icon: '📊', category: 'math' },
  { name: '概率论', icon: '🎲', category: 'math' },
  { name: '数据结构', icon: '🌲', category: 'cs' },
  { name: '计算机网络', icon: '🌐', category: 'cs' },
  { name: '操作系统', icon: '💻', category: 'cs' },
  { name: '计算机组成原理', icon: '🔧', category: 'cs' },
  { name: '英语单词', icon: '📖', category: 'english' },
  { name: '英语阅读', icon: '📰', category: 'english' },
  { name: '英语写作', icon: '✏️', category: 'english' },
  { name: '政治知识点', icon: '📕', category: 'politics' },
  { name: '政治刷题', icon: '📝', category: 'politics' },
];

// 雅思默认任务模板
const IELTS_TASKS = [
  { name: '雅思听力练习', skill: 'listening', icon: '🎧', defaultMinutes: 40 },
  { name: '雅思阅读精读', skill: 'reading', icon: '📖', defaultMinutes: 50 },
  { name: '雅思口语练习', skill: 'speaking', icon: '🗣️', defaultMinutes: 30 },
  { name: '雅思作文练习', skill: 'writing', icon: '✍️', defaultMinutes: 40 },
  { name: '雅思单词积累', skill: 'vocabulary', icon: '📚', defaultMinutes: 20 },
];

// 任务状态定义
const TASK_STATUS = {
  PENDING: 'pending',      // 未开始
  IN_PROGRESS: 'in_progress', // 进行中
  COMPLETED: 'completed',   // 已完成
  POSTPONED: 'postponed',   // 已延期
  SKIPPED: 'skipped',       // 已跳过
  ABANDONED: 'abandoned',   // 已放弃
};

// 任务状态中文映射
const STATUS_TEXT = {
  pending: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  postponed: '已延期',
  skipped: '已跳过',
  abandoned: '已放弃',
};

// 任务状态颜色映射
const STATUS_COLOR = {
  pending: '#8E8E93',
  in_progress: '#007AFF',
  completed: '#34C759',
  postponed: '#FF9500',
  skipped: '#AF52DE',
  abandoned: '#FF3B30',
};

/**
 * 创建一个任务对象
 */
function createTask(options) {
  return {
    id: options.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    date: options.date || '',
    type: options.type || 'grad', // 'grad' | 'ielts'
    subject: options.subject || '',
    skill: options.skill || '', // 雅思技能: listening/reading/writing/speaking/vocabulary
    title: options.title || '',
    content: options.content || '',
    icon: options.icon || '📋',
    plannedMinutes: options.plannedMinutes || 30,
    actualMinutes: 0,
    status: TASK_STATUS.PENDING,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * 生成每日默认任务（基于用户目标）
 */
function generateDailyTasks(dateStr, userInfo) {
  const tasks = [];
  const dailyHours = (userInfo.dailyStudyHours || 4) * 60; // 转为分钟
  const ieltsHours = (userInfo.dailyIeltsHours || 1) * 60;

  // 考研任务
  const gradSubjects = userInfo.gradSubjects && userInfo.gradSubjects.length > 0
    ? userInfo.gradSubjects
    : ['高等数学', '数据结构', '英语单词', '政治知识点'];

  const gradMinutesEach = Math.floor(dailyHours / gradSubjects.length);

  gradSubjects.forEach(subject => {
    const template = GRAD_SUBJECTS.find(s => s.name === subject);
    tasks.push(createTask({
      date: dateStr,
      type: 'grad',
      subject: subject,
      title: subject,
      icon: template ? template.icon : '📋',
      plannedMinutes: gradMinutesEach,
    }));
  });

  // 雅思任务 - 每天安排2-3项
  const ieltsPlan = userInfo.ieltsPlan || {};
  const dailyIelts = [];

  if (ieltsPlan.listening) dailyIelts.push(IELTS_TASKS[0]);
  if (ieltsPlan.reading) dailyIelts.push(IELTS_TASKS[1]);
  if (ieltsPlan.speaking) dailyIelts.push(IELTS_TASKS[2]);
  if (ieltsPlan.writing) dailyIelts.push(IELTS_TASKS[3]);

  // 至少安排听力和阅读
  if (dailyIelts.length === 0) {
    dailyIelts.push(IELTS_TASKS[0], IELTS_TASKS[1]);
  }

  // 总是加上单词积累
  dailyIelts.push(IELTS_TASKS[4]);

  const ieltsMinutesEach = Math.floor(ieltsHours / dailyIelts.length);

  dailyIelts.forEach(item => {
    tasks.push(createTask({
      date: dateStr,
      type: 'ielts',
      subject: '雅思',
      skill: item.skill,
      title: item.name,
      icon: item.icon,
      plannedMinutes: ieltsMinutesEach || item.defaultMinutes,
    }));
  });

  return tasks;
}

/**
 * 将延期任务移到新的一天
 */
function postponeTasks(taskIds, newDate) {
  const storage = require('./storage');
  taskIds.forEach(id => {
    storage.updateTask(id, {
      date: newDate,
      status: TASK_STATUS.PENDING,
    });
  });
}

module.exports = {
  GRAD_SUBJECTS,
  IELTS_TASKS,
  TASK_STATUS,
  STATUS_TEXT,
  STATUS_COLOR,
  createTask,
  generateDailyTasks,
  postponeTasks,
};
