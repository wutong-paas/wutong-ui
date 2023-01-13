export const timeOptionList = [
  {
    label: '最近30分钟',
    key: 'last30min'
  },
  {
    label: '最近1小时',
    key: 'last1hour'
  },
  {
    label: '最近12小时',
    key: 'last12hour'
  },
  {
    label: '今天',
    key: 'today'
  },
  {
    label: '最近3天',
    key: 'last3day'
  },
  {
    label: '最近7天',
    key: 'last7day'
  },
  {
    label: '自定义',
    key: 'custom'
  }
];

export const hourList = [
  {
    label: '最近半小时',
    key: 'last30min'
  },
  {
    label: '最近1小时',
    key: 'last1hour'
  },
  {
    label: '最近6小时',
    key: 'last6hour'
  }
];

export const minList = [
  {
    label: '最近5分钟',
    key: 'last5min'
  },
  {
    label: '最近10分钟',
    key: 'last10min'
  },
  {
    label: '最近15分钟',
    key: 'last15min'
  }
];

export const dayList = [
  {
    label: '最近1天',
    key: 'last1day'
  },
  {
    label: '最近三天',
    key: 'last3day'
  },
  {
    label: '最近7天',
    key: 'last7day'
  }
];

export const timeObject = [
  {
    label: 'off',
    key: 'off'
  },
  {
    label: '5s',
    key: 5000
  },
  {
    label: '10s',
    key: 10000
  },
  {
    label: '30s',
    key: 30000
  },
  {
    label: '1m',
    key: 60000
  },
  {
    label: '5m',
    key: 300000
  },
  {
    label: '30m',
    key: 1800000
  }
];

export const formatTime = {
  last5min: {
    count: 5,
    unit: 'minute'
  },
  last10min: {
    count: 10,
    unit: 'minute'
  },
  last15min: {
    count: 15,
    unit: 'minute'
  },
  last30min: {
    count: 30,
    unit: 'minute'
  },
  last05hour: {
    count: 0.5,
    unit: 'hour'
  },
  last1hour: {
    count: 1,
    unit: 'hour'
  },
  last6hour: {
    count: 6,
    unit: 'hour'
  },
  last1day: {
    count: 1,
    unit: 'day'
  },
  last3day: {
    count: 3,
    unit: 'day'
  },
  last7day: {
    count: 7,
    unit: 'day'
  }
};
