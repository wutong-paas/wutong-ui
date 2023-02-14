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