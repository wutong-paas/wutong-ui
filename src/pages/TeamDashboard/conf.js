import AppImg from '../../../public/images/common/app.svg';
import VisterBtn from '../../components/visitBtnForAlllink';
import { Divider } from 'antd';
const handlUnit = (num, unit) => {
  if (num || unit) {
    let nums = num;
    let units = unit;
    if (nums >= 1024) {
      nums = num / 1024;
      units = 'GB';
    }
    return unit ? units : nums.toFixed(1);
  }
  return num;
};
const statusObj = {
  RUNNING: {
    title: '运行中',
    color: 'rgba(8, 199, 127, 1)',
    shadow: 'rgba(8,199,127,0.8000)'
  },
  NIL: {
    title: '闲置',
    color: 'rgba(255, 191, 119, 1)',
    shadow: 'rgba(255, 191, 119, 0.8)'
  },
  CLOSED: {
    title: '关闭',
    color: 'rgba(133, 137, 150, 1)',
    shadow: 'rgba(133, 137, 150, 0.8)'
  },
  ABNORMAL: {
    title: '异常',
    color: 'rgba(253, 106, 106, 1)',
    shadow: 'rgba(253, 106, 106, 0.8)'
  }
};
export const listColunms = handleGotoApplication => {
  return [
    {
      title: '应用名称',
      dataIndex: 'group_name',
      key: 'group_name',
      render: (text, record) => {
        const { logo } = record;
        return (
          <>
            <img
              src={logo ? logo : AppImg}
              style={{ marginRight: 12, width: 24, height: 24 }}
            />
            <a
              onClick={() => handleGotoApplication(record)}
              href="javascript:;void(0)"
              title="点击可跳转至应用管理页面"
            >
              {text}
            </a>
          </>
        );
      }
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        return (
          <>
            {statusObj[text]?.color && (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: `${statusObj[text]?.color}`,
                  width: 8,
                  height: 8,
                  borderRadius: 8,
                  width: 8,
                  boxShadow: `0px 0px 6px 0px ${statusObj[text]?.shadow}`,
                  marginRight: 12
                }}
              ></span>
            )}
            <span>{statusObj[text]?.title}</span>
          </>
        );
      }
    },
    {
      title: '资源使用',
      dataIndex: 'used_mem',
      key: 'used_mem',
      render: (text, record) => {
        return (
          <>
            <p style={{ marginBottom: '0px' }}>
              内存：
              {handlUnit(text || 0)}
              {handlUnit(text || 0, 'MB')}
            </p>
          </>
        );
      }
    },
    {
      title: '组件数',
      dataIndex: 'services_num',
      key: 'services_num',
      render: text => `${text ?? '-'}个`
    },
    {
      title: '时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: text => {
        if (text && text.split('T')[0]) {
          return text.split('T')[0];
        }
        return '-';
      }
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 140,
      render: (text, item) => {
        return (
          <div>
            <a onClick={() => handleGotoApplication(item)}>管理</a>
            {item.accesses.length > 0 && item.status === 'RUNNING' && (
              <Divider type="vertical" />
            )}
            {item.accesses.length > 0 && item.status === 'RUNNING' && (
              <VisterBtn linkList={item.accesses} type="link" />
            )}
          </div>
        );
      }
    }
  ];
};
