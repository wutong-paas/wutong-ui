import moment from 'moment';
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

export const columns = (onActivityKeyChange, onTraceIdClick, start, end) => [
  {
    title: 'Trace ID',
    dataIndex: 'traceID',
    render: (text, record) => (
      <span
        style={{ color: '#2467F6', cursor: 'pointer' }}
        onClick={() => {
          onActivityKeyChange('add');
          onTraceIdClick({ traceId: text, start, end });
        }}
      >
        {text}
      </span>
    )
  },
  {
    title: '产生日志时间',
    dataIndex: 'startTimeUnixNano',
    render: (text, record) => {
      return moment(Number(text.toString().slice(0, 13))).format(
        'YYYY-MM-DD HH:MM:SS.SSS'
      );
    }
  },
  {
    title: '链路根节点',
    dataIndex: 'rootTraceName'
  },
  {
    title: '服务名称',
    dataIndex: 'rootServiceName'
  },
  {
    title: '耗时',
    dataIndex: 'durationMs',
    sorter: (a, b) => a.durationMs - b.durationMs,
    render: (text, record) => text + 'ms'
  }
];

export const data = [
  {
    traceId: '1247b69662a9cc57',
    createdTime: '2022-09-20 12:44:30',
    serviceName: '/product/toy/1ad0c031-7862-4f68-adb6-4206a4a74a01',
    componentName: 'productservice',
    time: 4
  },
  {
    traceId: '1247b69662a9c357',
    createdTime: '2022-09-20 12:44:30',
    serviceName: '/product/toy/1ad0c031-7862-4f68-adb6-4206a4a74a01',
    componentName: 'productservice',
    time: 4
  },
  {
    traceId: '1247b69662a9c=157',
    createdTime: '2022-09-20 12:44:30',
    serviceName: '/product/toy/1ad0c031-7862-4f68-adb6-4206a4a74a01',
    componentName: 'productservice',
    time: 4
  },
  {
    traceId: '1247b69662a9c5c57',
    createdTime: '2022-09-20 12:44:30',
    serviceName: '/product/toy/1ad0c031-7862-4f68-adb6-4206a4a74a01',
    componentName: 'productservice',
    time: 4
  }
];


export const timeObject = {
  '5s': 5000,
  '10s': 10000,
  '30s': 30000,
  '1m': 60000,
  '5m': 300000,
  '30m': 1800000
};
