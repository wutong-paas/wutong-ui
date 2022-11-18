import React from 'react';
import { Popover, Icon, message } from 'antd';
const statusColor = ['#FD6A6A', '#08C77F', '#858996'];

export const columns = () => {
  return [
    {
      title: '调用方法',
      dataIndex: 'callMethod',
      key: 'callMethod'
    },
    {
      title: '行号',
      dataIndex: 'rowIndex',
      key: 'rowIndex'
    },
    {
      title: '扩展信息',
      dataIndex: 'expandInfo',
      key: 'expandInfo',
      render: (text, record) => (
        <Popover
          content={
            <div>
              <div
                style={{ color: 'blue', cursor: 'pointer' }}
                onClick={() => {
                  navigator.clipboard
                    .writeText(text)
                    .catch(e => message.error(e));
                  message.success('复制成功！');
                }}
              >
                点击复制 <Icon type="copy" />
              </div>
              <div>{text}</div>
            </div>
          }
        >
          {text}
        </Popover>
      )
    },
    {
      title: '时间轴',
      dataIndex: 'timeLine',
      width: '40%',
      key: 'timeLine',
      render: (text, { total, children, max }) => {
        return (
          <div
            style={{
              backgroundColor: children ? '#2467F6' : '#08C77F',
              height: 22,
              borderRadius: 4,
              width: text === 0 ? 2 : `${((text / total) * 100).toFixed(2)}%`
              //marginLeft: `${((1 - max / total) * 100).toFixed(2)}%`
            }}
          >
            <span
              style={{
                marginLeft: 8,
                display: 'inline-block',
                color: text === 0 ? 'black' : 'white'
              }}
            >
              {text}ms
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
    callMethod: 'Tomact Servlet Process',
    rowIndex: '',
    expandInfo: '',
    timeLine: 7,
    max: 7,
    children: [
      {
        key: 2,
        callMethod:
          'org.apache.catalina.core.StandardHostValve（org.apache.catalina.core.StandardHostValve）',
        rowIndex: '111',
        expandInfo: '172.20.0.241',
        timeLine: 7,
        max: 7,
        total: 7,
        children: [
          {
            key: 3,
            callMethod:
              'org.apache.catalina.core.servelet.FrameworkServlet.doGet（javax.servelt.HttpServletRequest.request,javax.servlet.http）',
            rowIndex: '897',
            expandInfo: '172.20.0.241',
            timeLine: 6,
            max: 6,
            total: 7,
            children: [
              {
                key: 4,
                callMethod:
                  'com.alibabacloud.hipstershop.api.ApiController.getProductInfo()',
                rowIndex: '180',
                expandInfo: '172.20.0.241',
                timeLine: 6,
                max: 6,
                total: 7,
                children: [
                  {
                    key: 5,
                    callMethod:
                      'com.alibabacloud.hipstershop/config.LaunchDarkService.getBooleanFlag',
                    rowIndex: '21',
                    expandInfo: '172.20.0.241',
                    timeLine: 0,
                    max: 6,
                    total: 7
                  },
                  {
                    key: 6,
                    callMethod:
                      'com.alibabacloud.hipstershop/config.LaunchDarkService.getBooleanFlag',
                    rowIndex: '21',
                    expandInfo: '172.20.0.241',
                    timeLine: 6,
                    max: 6,
                    total: 7
                  }
                ]
              },
              {
                key: 7,
                callMethod: 'com.alibabacloud.hipstershop.api.dao.ProductDao()',
                rowIndex: '18',
                expandInfo: '172.20.0.241',
                timeLine: 1,
                max: 6,
                total: 7
              }
            ]
          }
        ]
      }
    ]
  }
];

export const lableList = [
  // {
  //   label: '组件名称',
  //   key: 'componentName'
  // },
  {
    label: '服务名称',
    key: 'serviceName'
  },
  {
    label: '耗时',
    key: 'timeLine'
  },
  // {
  //   label: 'Ip地址',
  //   key: 'ipAdress'
  // },
  // {
  //   label: 'TraceId',
  //   key: 'TraceId'
  // },
  {
    label: '起始时间',
    key: 'createdTime'
  }
];

export const traceDetailTitle = {
  logs: '事件',
  serviceTags: '资源',
  tags: '属性'
};
