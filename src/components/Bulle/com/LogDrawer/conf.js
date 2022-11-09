export const teamOptionList = [
  {
    label: 'Paas',
    key: 'paas'
  },
  {
    label: 'Iot',
    key: 'iot'
  }
];

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

export const formatTime = {
  last30min: {
    count: 30,
    unit: 'minute'
  },
  last1hour: {
    count: 1,
    unit: 'hour'
  },
  last12hour: {
    count: 12,
    unit: 'hour'
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

export let logList = [
  {
    text:
      '2022-09-21 09:52:48 2022-09-21 01:52:48.383+0000[id=15178] INFO hudson.modelAsyncPeriodicWork#lambdaSdoRunS1: Finished Periodic background build discarder.0 ms',
    level: 'cirtical',
    traceId: '13650'
  },
  {
    text:
      '2022-10-18 09:52:13.973  WARN [log-test-demo,e99826af45ee8baa07d3dcc991bd3931,08c010147ea452e6] 7 --- [nio-8080-exec-6] com.demo.controller.LogController        : 1666057933973:即便粗略地看一眼这个四国机制的程序和范围，也会发现拜登政府是在故意大力推动和投资这个俱乐部，以抗衡中国在该地区日益增强的影响力。 \n',
    level: 'error'
  },
  {
    text:
      '2022-09-21 09:52:48 2022-09-21 01:52:48.383+0000[id=15178] INFO hudson.modelAsyncPeriodicWork#lambdaSdoRunS1: Finished Periodic background build discarder.0 ms',
    level: 'warning'
  },
  {
    text:
      '2022-09-21 09:52:48 2022-09-21 01:52:48.383+0000[id=15178] INFO hudson.modelAsyncPeriodicWork#lambdaSdoRunS1: Finished Periodic background build discarder.0 ms \n \n dsajkfkeadsjfjke \n 金克拉四大皆空方可了\br 看电视剧加快了付款了\t,mkmdasfjne \nkljjkldsajklfkjl',
    level: 'info',
    traceId: '1330'
  },
  {
    text:
      '2022-10-18 09:52:13.973  WARN [log-test-demo,e99826af45ee8baa07d3dcc991bd3931,08c010147ea452e6] 7 --- [nio-8080-exec-6] com.demo.controller.LogController        : 1666057933973:即便粗略地看一眼这个四国机制的程序和范围，也会发现拜登政府是在故意大力推动和投资这个俱乐部，以抗衡中国在该地区日益增强的影响力。 \n',
    level: 'info',
    traceId: '12330'
  },
  {
    text: '2022-09-21 09:52:23',
    level: 'debug'
  },
  {
    text: '2022-09-21 09:52:23 Consider the following:',
    level: 'trace'
  },
  {
    text: '2022-09-21 09:52 23 ***************************',
    level: 'unknown'
  },
  {
    text: '2022-09-21 09:52:23 APPLICATION FAILED TO START',
    level: 'unknown'
  },
  {
    text: '2022-09-21 09:52 23 ***************************',
    level: 'unknown'
  },
  {
    text:
      'c1967093098b:==> Parameters: 1580092876424257538(String), 2(Integer), 区域信息-列表查询(String), org.jeecg.modules.system.controller.SysCnareaController.listArea()(String), 1(Integer),   parentCode: 430000000000  level: 1(String), 222.247.54.24, 100.125.70.20, 10.244.1.0(String), luoyong(String), 罗勇(String), 6(Long), 2022-10-12 07:07:53.102(Timestamp), /traffic/dataanalysis/blackAnalysis(String), jeecg-system(String), 1000001(String), 1000001(String)',
    level: 'trace'
  }
];

const LogLevel = {
  emerg: 'critical',
  fatal: 'critical',
  alert: 'critical',
  crit: 'critical',
  critical: 'critical',
  warn: 'warning',
  warning: 'warning',
  err: 'error',
  eror: 'error',
  error: 'error',
  info: 'info',
  information: 'info',
  informational: 'info',
  notice: 'info',
  dbug: 'debug',
  debug: 'debug',
  trace: 'trace',
  unknown: 'unknown'
};

export const logLevelColor = {
  cirtical: 'purple',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'lightblue',
  unknown: 'grey'
};

export const timeObject = {
  '5s': 5000,
  '10s': 10000,
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
  '30m': 1800000
};

export const filterList = [
  {
    label: 'app',
    key: 'app',
    children: [
      {
        label: 'menhu',
        key: 'menhu'
      },
      {
        label: 'test',
        key: 'test'
      }
    ]
  },
  {
    label: 'services',
    key: 'services',
    children: [
      {
        label: 'idaas',
        key: 'idaas'
      },
      {
        label: 'paas',
        key: 'paas'
      }
    ]
  },
  {
    label: 'error_level',
    key: 'error_level',
    children: [
      {
        label: 'SUCCESS',
        key: 'SUCCESS'
      },
      {
        label: 'WARN',
        key: 'WARN'
      },
      {
        label: 'ERROR',
        key: 'ERROR'
      }
    ]
  },
  {
    label: 'status_code',
    key: 'status_code',
    children: [
      {
        label: '200',
        key: '200'
      },
      {
        label: '300',
        key: '300'
      },
      {
        label: '400',
        key: '400'
      }
    ]
  }
];

export const filterTermList = ['=', '=~', '!=', '!~'];

export const getTraceId = (line, params) => {
  let result = null;
  if (!line) {
    return result;
  }
  const regexp = new RegExp(`${params}=(\\w+)`);
  //const regexp = new RegExp(`${params}-(\\w+)`);
  result = regexp.exec(line);
  return result ? result[1] : result;
};

export const getLogLevel = line => {
  if (!line) {
    return LogLevel.unknown;
  }
  let level = LogLevel.unknown;
  let currentIndex = undefined;

  for (const key of Object.keys(LogLevel)) {
    // const regexp = new RegExp(`\\[.+,(.+),.+\\]`);
    const regexp = new RegExp(`\\b${key}\\b`, 'i');
    const result = regexp.exec(line);

    if (result) {
      if (currentIndex === undefined || result.index < currentIndex) {
        level = LogLevel[key];
        currentIndex = result.index;
      }
    }
  }
  return level;
};

export const getUrlParams = (url, params) => {
  const regexp = new RegExp(`${params}/(\\w+)/?`);
  const result = regexp.exec(url);
  return result ? result[1] : undefined;
};

export const tagName = {
  container: '组件',
  pod: '实例',
  filename: '日志文件',
  app: '业务应用',
  level: '日志等级',
  thread: '线程',
  logger: '日志记录器',
  traceId: '链路标识'
};
