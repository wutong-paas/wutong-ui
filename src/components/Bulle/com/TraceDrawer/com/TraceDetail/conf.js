import { time } from 'echarts';
import moment, { max } from 'moment';

const statusColor = ['#FD6A6A', '#08C77F', '#858996'];

export const columns = (onActivityKeyChange, onServiceClick) => {
  return [
    {
      title: '链路节点名称',
      dataIndex: 'componentName',
      key: 'componentName'
    },
    {
      title: '日志产生时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (text, record) => moment(text).format('YYYY-MM-DD HH:MM:SS.SSS')
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         width: 10,
    //         height: 10,
    //         background: `${statusColor[text]}CC`,
    //         boxShadow: `0px 0px 6px 0px  ${statusColor[text]}CC`,
    //         borderRadius: 10
    //       }}
    //     ></div>
    //   )
    // },
    // {
    //   title: 'ip地址',
    //   dataIndex: 'ipAdress',
    //   key: 'ipAdress'
    // },
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text, record) => (
        <span
          style={{ color: '#2467F6', cursor: 'pointer' }}
          onClick={() => {
            onActivityKeyChange('add');
            onServiceClick(record);
          }}
        >
          {text}
        </span>
      )
    },
    {
      title: '时间轴（ms）',
      dataIndex: 'timeLine',
      width: '40%',
      key: 'timeLine',
      render: (
        text,
        { total, children, max, timeLine, maxTime, createdTime }
      ) => {
        return (
          <div
            style={{
              backgroundColor: children ? '#2467F6' : '#08C77F',
              height: 22,
              borderRadius: 4,
              width: text === 0 ? 2 : `${((text / max) * 100).toFixed(2)}%`,
              marginLeft: `${(((createdTime - maxTime) / max) * 100).toFixed(
                2
              )}%`
            }}
          >
            <span
              style={{
                marginLeft: 8,
                display: 'inline-block',
                color: 'black'
                // color: '#b9abab'
                //mixBlendMode: 'difference'
              }}
            >
              {text.toFixed(2)}ms
            </span>
          </div>
        );
      }
    }
  ];
};

export const data = [
  {
    key: 1,
    componentName: 'frontend',
    createdTime: '2022-10-08 13:34:32',
    status: 0,
    ipAdress: '172.20.0.241',
    serviceName: '/tb/api/getProductinfo',
    timeLine: 7,
    max: 7,
    children: [
      {
        key: 2,
        componentName: 'productservice',
        createdTime: '2022-10-08 13:44:32',
        status: 0,
        ipAdress: '172.20.0.114',
        serviceName: '/product/toy/ddddd',
        timeLine: 4,
        max: 4,
        total: 7,
        children: [
          {
            key: 3,
            componentName: 'cartservice',
            createdTime: '2022-10-08 13:44:32',
            status: 1,
            ipAdress: '172.20.0.54',
            serviceName: 'Recv Topic@first-topic',
            timeLine: 0,
            max: 3,
            total: 7
          },
          {
            key: 4,
            componentName: 'productservice',
            createdTime: '2022-10-08 13:44:32',
            status: 0,
            ipAdress: '172.20.0.54',
            serviceName: 'Recv Topic@first-topic',
            timeLine: 3,
            max: 3,
            total: 7
          },
          {
            key: 5,
            componentName: 'clothservice',
            createdTime: '2022-10-08 13:44:32',
            status: 1,
            ipAdress: '172.20.0.23',
            serviceName: 'Recv Topic@first-topic',
            timeLine: 1,
            max: 3,
            total: 7
          }
        ]
      }
    ]
  }
];

export const data1 = [
  {
    key: '59e7d3f40dcbf4bf',
    parentKey: 'root',
    componentName: '/log',
    createdTime: 1666078779839.7954,
    status: 0,
    ipAddress: '',
    serviceName: 'test-log-java',
    timeLine: 5.253073,
    max: 5.253073,
    maxTime: 1666078779839.7954,
    children: [
      {
        key: '7c850b2a2a84f145',
        parentKey: '59e7d3f40dcbf4bf',
        componentName: 'LogController.pringLog',
        createdTime: 1666078779840.416,
        status: 0,
        ipAddress: '',
        serviceName: 'test-log-java',
        timeLine: 4.430662,
        max: 5.253073,
        maxTime: 1666078779839.7954,
        children: [
          {
            key: 'bf87645e04bfab3f',
            parentKey: '7c850b2a2a84f145',
            componentName: 'KEYS',
            createdTime: 1666078779840.8953,
            status: 0,
            ipAddress: '',
            serviceName: 'test-log-java',
            timeLine: 0.395924,
            max: 5.253073,
            maxTime: 1666078779839.7954,
            children: []
          },
          {
            key: '083dc88a08d1e6d9',
            parentKey: '7c850b2a2a84f145',
            componentName: 'SET',
            createdTime: 1666078779841.9233,
            status: 0,
            ipAddress: '',
            serviceName: 'test-log-java',
            timeLine: 0.780131,
            max: 5.253073,
            maxTime: 1666078779839.7954,
            children: []
          },
          {
            key: '1d77681c15fff0e7',
            parentKey: '7c850b2a2a84f145',
            componentName: 'SET',
            createdTime: 1666078779842.9746,
            status: 0,
            ipAddress: '',
            serviceName: 'test-log-java',
            timeLine: 0.345627,
            max: 5.253073,
            maxTime: 1666078779839.7954,
            children: []
          },
          {
            key: 'd1d2fa100824cb60',
            parentKey: '7c850b2a2a84f145',
            componentName: 'SET',
            createdTime: 1666078779843.5308,
            status: 0,
            ipAddress: '',
            serviceName: 'test-log-java',
            timeLine: 0.260376,
            max: 5.253073,
            maxTime: 1666078779839.7954,
            children: []
          },
          {
            key: 'dfa3a8974c39db82',
            parentKey: '7c850b2a2a84f145',
            componentName: 'SET',
            createdTime: 1666078779843.9365,
            status: 0,
            ipAddress: '',
            serviceName: 'test-log-java',
            timeLine: 0.227699,
            max: 5.253073,
            maxTime: 1666078779839.7954,
            children: []
          }
        ]
      }
    ]
  }
];

export const loopData = (data, maxTime) => {
  return data.map(item => {
    item.maxTime = maxTime;
    if (item.children && item.children.length > 0) {
      loopData(item.children, maxTime);
    } else {
      item.children = null;
    }
    return item;
  });
};

export const flatten = origin => {
  let result = [];
  for (let i = 0; i < origin.length; i++) {
    let item = origin[i];
    result.push(item);
    if (Array.isArray(item.children)) {
      result = result.concat(flatten(item.children));
    }
  }
  return result;
};