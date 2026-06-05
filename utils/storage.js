/**
 * 本地存储工具 - 基于 wx.setStorageSync / wx.getStorageSync
 * 所有数据存储在本地，适合个人使用场景
 */

const KEYS = {
  USER_INFO: 'ashore_user_info',
  TASKS: 'ashore_tasks',
  STUDY_RECORDS: 'ashore_study_records',
  CHECKIN_RECORDS: 'ashore_checkin_records',
  TIMER_SETTINGS: 'ashore_timer_settings',
  FIRST_LAUNCH: 'ashore_first_launch',
};

// ========== 通用读写 ==========

function get(key, defaultValue) {
  try {
    const val = wx.getStorageSync(key);
    return val !== '' && val !== undefined ? val : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error('存储写入失败:', key, e);
  }
}

// ========== 用户信息 ==========

function getUserInfo() {
  return get(KEYS.USER_INFO, {
    nickname: '',
    avatarUrl: '',
    gradTargetSchool: '',
    gradTargetMajor: '',
    gradExamDate: '',
    gradSubjects: [],
    ieltsTargetScore: '',
    ieltsCurrentLevel: '',
    ieltsExamDate: '',
    ieltsPlan: { listening: '', reading: '', writing: '', speaking: '' },
    dailyStudyHours: 4,
    dailyIeltsHours: 1,
  });
}

function setUserInfo(info) {
  set(KEYS.USER_INFO, info);
}

// ========== 任务管理 ==========

function getAllTasks() {
  return get(KEYS.TASKS, []);
}

function setAllTasks(tasks) {
  set(KEYS.TASKS, tasks);
}

function getTasksByDate(dateStr) {
  const all = getAllTasks();
  return all.filter(t => t.date === dateStr);
}

function addTask(task) {
  const all = getAllTasks();
  task.id = task.id || generateId();
  task.createdAt = task.createdAt || Date.now();
  task.updatedAt = Date.now();
  all.push(task);
  setAllTasks(all);
  return task;
}

function updateTask(taskId, updates) {
  const all = getAllTasks();
  const idx = all.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates, updatedAt: Date.now() };
    setAllTasks(all);
    return all[idx];
  }
  return null;
}

function deleteTask(taskId) {
  const all = getAllTasks();
  const filtered = all.filter(t => t.id !== taskId);
  setAllTasks(filtered);
}

function getPendingTasks() {
  const all = getAllTasks();
  return all.filter(t => t.status === 'pending' || t.status === 'postponed');
}

// ========== 学习记录 ==========

function getAllRecords() {
  return get(KEYS.STUDY_RECORDS, []);
}

function addRecord(record) {
  const all = getAllRecords();
  record.id = record.id || generateId();
  record.createdAt = Date.now();
  all.push(record);
  set(KEYS.STUDY_RECORDS, all);
  return record;
}

function getRecordsByDate(dateStr) {
  const all = getAllRecords();
  return all.filter(r => r.date === dateStr);
}

function getRecordsByRange(startDate, endDate) {
  const all = getAllRecords();
  return all.filter(r => r.date >= startDate && r.date <= endDate);
}

// ========== 打卡记录 ==========

function getAllCheckins() {
  return get(KEYS.CHECKIN_RECORDS, []);
}

function addCheckin(record) {
  const all = getAllCheckins();
  record.id = record.id || generateId();
  all.push(record);
  set(KEYS.CHECKIN_RECORDS, all);
  return record;
}

function getCheckinByDate(dateStr) {
  const all = getAllCheckins();
  return all.find(c => c.date === dateStr) || null;
}

function getConsecutiveDays() {
  const all = getAllCheckins();
  if (all.length === 0) return 0;

  const dates = all.map(c => c.date).sort().reverse();
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // 从今天或昨天开始算连续天数
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let count = 1;
  let current = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(current.getTime() - 86400000);
    const prevStr = formatDate(prev);
    if (dates[i] === prevStr) {
      count++;
      current = prev;
    } else {
      break;
    }
  }
  return count;
}

// ========== 计时器设置 ==========

function getTimerSettings() {
  return get(KEYS.TIMER_SETTINGS, {
    pomodoroWorkMinutes: 25,
    pomodoroRestMinutes: 5,
  });
}

function setTimerSettings(settings) {
  set(KEYS.TIMER_SETTINGS, settings);
}

// ========== 辅助函数 ==========

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isFirstLaunch() {
  return get(KEYS.FIRST_LAUNCH, true);
}

function setLaunched() {
  set(KEYS.FIRST_LAUNCH, false);
}

module.exports = {
  KEYS,
  getUserInfo,
  setUserInfo,
  getAllTasks,
  setAllTasks,
  getTasksByDate,
  addTask,
  updateTask,
  deleteTask,
  getPendingTasks,
  getAllRecords,
  addRecord,
  getRecordsByDate,
  getRecordsByRange,
  getAllCheckins,
  addCheckin,
  getCheckinByDate,
  getConsecutiveDays,
  getTimerSettings,
  setTimerSettings,
  generateId,
  formatDate,
  isFirstLaunch,
  setLaunched,
};
