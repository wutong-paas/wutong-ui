/**
 * @content 调用链路列表页
 * @author  leon
 * @date    2022/10/08
 *
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  DatePicker,
  Input,
  Dropdown,
  Menu,
  Button,
  Icon,
  Table,
  message
} from 'antd';
import TeamCondition from '../../../TeamCondition';
import {
  columns,
  data,
  teamOptionList,
  timeOptionList,
  timeObject
} from './conf';
import { getUrlParams } from '../../../LogDrawer/conf';
import { connect } from 'dva';
import moment from 'moment';
import styles from './index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;
const ButtonGroup = Button.Group;

const Trace = props => {
  const {
    onActivityKeyChange,
    teamList,
    location: { pathname },
    tarceLoading,
    onTraceIdClick,
    visible
  } = props;
  const [queryText, setQueryText] = useState('0');
  const [timeRange, setTimeRange] = useState({
    start: moment()
      .subtract('1', 'hour')
      .valueOf(),
    end: moment().valueOf()
  });
  const [nameSpace, setNamespace] = useState(getUrlParams(pathname, 'team'));
  const [dataSource, setDataSource] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [methodList, setMethodList] = useState([]);
  const [minDuration, setMinDuration] = useState();
  const [filteValue, setFilterValue] = useState({
    serviceValue: undefined,
    methodValue: undefined
  });
  const [limit, setLimit] = useState('20');
  const didMountRef = useRef(false);
  const timeId = useRef(null);
  const queryTextCurrent = useRef('0');

  useEffect(() => {
    if (didMountRef.current) {
      fetchTraceList();
    } else {
      didMountRef.current = true;
    }
  }, [limit]);

  useEffect(() => {
    if (visible) fetchFilterList();
  }, [visible]);

  useEffect(() => {
    if (pathname) {
      const teamIndex = teamList.findIndex(
        i => i.team_name === getUrlParams(pathname, 'team')
      );
      const teamName = teamList[teamIndex]?.namespace;
      if (teamName && !nameSpace) setNamespace(teamName);
    }
  }, [pathname, teamList]);

  const menu = (
    <Menu
      onClick={e => {
        e.domEvent.stopPropagation();
        setQueryText(e.key);
        queryTextCurrent.current = e.key;
        if (e.key === '0') {
          console.log(timeId.current, 'timeId');
          clearTimeout(timeId.current);
          timeId.current = null;
          return;
        }
        if (e.key !== queryText) {
          clearTimeout(timeId.current);
          timeId.current = null;
        }
        timeId.current = setTimeout(() => {
          fetchTraceList();
        }, timeObject[e.key]);
      }}
    >
      <Menu.Item key="0"> off </Menu.Item>
      <Menu.Item key="5s">5s</Menu.Item>
      <Menu.Item key="10s">10s</Menu.Item>
      <Menu.Item key="30s">30s</Menu.Item>
      <Menu.Item key="1m">1min</Menu.Item>
      <Menu.Item key="5m">5min</Menu.Item>
      <Menu.Item key="30m">30min</Menu.Item>
      <Menu.Item key="1h">1h</Menu.Item>
      <Menu.Item key="2h">2h</Menu.Item>
      <Menu.Item key="1d">1d</Menu.Item>
    </Menu>
  );

  const onTimeChange = ({ start, end }) => {
    setTimeRange({ start, end });
  };

  const onTeamChange = e => {
    setNamespace(e);
  };

  const fetchTraceList = () => {
    const { dispatch } = props;
    const { start, end } = timeRange;
    const { serviceValue, methodValue } = filteValue;
    let list = [];
    list.push(`namespace=${nameSpace}`);
    if (serviceValue) {
      list.push(`service.name=${serviceValue}`);
    }
    if (methodValue) {
      list.push(`name=${methodValue}`);
    }
    dispatch({
      type: 'toolkit/fetchTraceList',
      payload: {
        start,
        end,
        limit,
        minDuration: minDuration ? minDuration + 'ms' : undefined,
        tags: list.length > 0 ? list.join(' ') : undefined
      },
      callback: res => {
        const { list } = res;
        setDataSource(list);
        if (queryTextCurrent?.current !== '0') {
          timeId.current = setTimeout(() => {
            fetchTraceList();
          }, timeObject[(queryTextCurrent?.current)]);
        }
      }
    });
  };

  const handleQuery = () => {
    if (!nameSpace) {
      message.warning('请先选择团队!');
      return;
    }
    fetchTraceList();
  };

  const handleSizeChange = e => {
    setLimit(e);
  };

  const fetchFilterList = () => {
    const { dispatch } = props;
    dispatch({
      type: 'toolkit/fetchServiceList',
      callback: res => {
        const { list } = res;
        setServiceList(list);
      }
    });
    dispatch({
      type: 'toolkit/fetchComponentList',
      callback: res => {
        const { list } = res;
        setMethodList(list);
      }
    });
  };

  const handleInputChange = e => {
    setMinDuration(e.target.value);
  };

  const handleFilterChange = ({ e, flag }) => {
    const { serviceValue, methodValue } = filteValue;
    if (flag === 'service') {
      setFilterValue({ serviceValue: e, methodValue });
      return;
    }
    setFilterValue({ serviceValue, methodValue: e });
  };

  return (
    <div className={styles.wrap}>
      <TeamCondition
        teamOptionList={teamList}
        timeOptionList={timeOptionList}
        onTimeChange={onTimeChange}
        onRangeChange={onTimeChange}
        onTeamChange={onTeamChange}
        nameSpace={nameSpace}
      />
      <div className={styles.filter}>
        {/* <Input
          style={{ width: 186, marginRight: 24 }}
          placeholder="请输入traceId"
        /> */}
        <Select
          style={{ width: 186, marginRight: 24 }}
          placeholder="链路节点名称"
          onChange={e => handleFilterChange({ e, flag: 'method' })}
          value={filteValue.methodValue}
          allowClear
        >
          {methodList?.map((item, index) => (
            <Option key={index} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 186, marginRight: 24 }}
          placeholder="服务名称"
          onChange={e => handleFilterChange({ e, flag: 'service' })}
          value={filteValue.serviceValue}
          allowClear
        >
          {serviceList?.map((item, index) => (
            <Option key={index} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <Input
          style={{ width: 186, marginRight: 24 }}
          placeholder="耗时大于（ms）"
          value={minDuration}
          onChange={handleInputChange}
        />
        {/* <Input style={{ width: 186, marginRight: 24 }} placeholder="响应码" /> */}
        <div>
          <ButtonGroup>
            <Button type="primary" onClick={handleQuery} loading={tarceLoading}>
              <span>查询</span>
            </Button>
            <Dropdown overlay={menu}>
              <Button type="primary">
                <span style={{ zIndex: '2' }}>
                  <span>{queryText === '0' ? 'off' : queryText}</span>
                  <Icon type="down" />
                </span>
              </Button>
            </Dropdown>
          </ButtonGroup>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.page}>
          {data.length > 0 && (
            <div
              className={styles.total}
            >{`共查询到${dataSource.length}条`}</div>
          )}
          <Select
            onChange={handleSizeChange}
            value={limit}
            style={{ marginLeft: 10 }}
          >
            {['10', '20', '50', '100', '500'].map((item, index) => (
              <Option key={index} value={item}>
                {item}条
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <Table
            columns={columns(
              onActivityKeyChange,
              onTraceIdClick,
              timeRange.start,
              timeRange.end
            )}
            rowKey="traceId"
            dataSource={dataSource}
            loading={tarceLoading}
            pagination={{
              hideOnSinglePage: true,
              pageSize: limit
            }}
            //onChange={handleTableChange}
          />
        </div>
      </div>
    </div>
  );
};

export default connect(({ loading }) => ({
  tarceLoading: loading.effects['toolkit/fetchTraceList']
}))(Trace);
