/**
 * @content  新版监控视图
 * @author   Leon
 * @date     2022/11/04
 *
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import { Card, Select } from 'antd';
import TwTimePicker from '@/components/TwComponents/TwTimePicker';
import TwOverViewList from '@/components/TwComponents/TwOverViewList';
import MonitorOverView from './com/OverView';
import MonitorResource from './com/Resource';
import globalUtil from '@/utils/global';
import { getOverviewList } from '@/services/monitor';
import { connect } from 'dva';
import { tabList, overviewList, requestOption, getLineOption } from './conf';
import moment from 'moment';
import classNames from 'classnames';
import linkImg from '../../../../public/images/common/link.svg';
import styles from './index.less';

const Monitor = props => {
  const {
    dispatch,
    appAlias,
    appDetail,
    overviewLoading,
    ...otherProps
  } = props;
  const [activeKey, setActiveKey] = useState(1);
  const [pods, setPods] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  // 默认查询间隔是15分钟
  const [start, setStart] = useState(
    moment()
      .subtract('15', 'minute')
      .valueOf()
      .toString()
  );
  const [end, setEnd] = useState(
    moment()
      .valueOf()
      .toString()
  );
  // 存储时间范围的key
  const [timeKey, setTimeKey] = useState('last15min');
  // 存储实例value
  const [instanceValue, setInstance] = useState('all');
  // 轮询间隔key,因为轮询需要一个固定的值，所以用useRef存储
  const [pollingValue, setPolling] = useState('off');
  const pollingRef = useRef('off');
  const fetchOverviewListRef = useRef();
  const timeId = useRef();

  useEffect(() => {
    fetchPods();
  }, []);

  useEffect(() => {
    fetchOverviewListRef.current();
    return () => {
      if (timeId.current) {
        clearTimeout(timeId.current);
        timeId.current = null;
      }
    };
  }, [instanceValue, pollingValue, start, end]);

  const fetchPods = () => {
    dispatch({
      type: 'appControl/fetchPods',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: appAlias
      },
      callback: res => {
        if (res && res.status_code === 200) {
          setPods(res?.list?.new_pods);
        }
      }
    });
  };

  const fetchOverviewList = () => {
    console.log('coming');
    dispatch({
      type: 'monitor/fetchOverviewList',
      payload: {
        teamName: globalUtil.getCurrTeamName(),
        serviceAlias: appDetail?.service?.service_alias,
        pods: instanceValue
      },
      callback: res => {
        if (res) {
          const { bean } = res;
          setOverviewData(
            overviewList.map(item => {
              if (typeof bean[item.flag] === 'number') {
                item.number = bean[item.flag];
              }
              return item;
            })
          );
          if (pollingRef?.current !== 'off') {
            if (timeId.current) {
              clearTimeout(timeId.current);
              timeId.current = null;
            }

            timeId.current = setTimeout(() => {
              fetchOverviewListRef.current();
            }, Number(pollingRef?.current));
          }
        }
      }
    });
  };

  fetchOverviewListRef.current = fetchOverviewList;

  const handleClick = ({ e, index, isOutlink, key }) => {
    if (!isOutlink) setActiveKey(index);
    if (key === 'log') {
      dispatch({
        type: 'toolkit/showLog',
        payload: {
          isShowLog: true
        }
      });
    }
    if (key === 'trace') {
      dispatch({
        type: 'toolkit/showTrace',
        payload: {
          isShowTrace: true
        }
      });
    }
  };

  // timepicker 确定按钮事件，返回日期，轮询间隔，时间间隔的key
  const handleRangeChange = (dates, pollingValue, timeKey) => {
    if (dates) {
      let { start, end } = dates;
      start = start.valueOf();
      end = end.valueOf();
      setStart(String(start));
      setEnd(String(end));
    }
    if (pollingValue) {
      setPolling(pollingValue);
      pollingRef.current = pollingValue;
    }
    setTimeKey(timeKey);
  };

  // timepicker 时间范围选择确定时间，返回 时间间隔key和日期
  const handleTimeChange = (e, dates) => {
    setTimeKey(e);
    if (dates) {
      const { start, end } = dates;
      setStart(String(start));
      setEnd(String(end));
    }
  };

  const handleSelectChange = value => {
    // if (value === 'all') {
    //   setInstance(pods?.map(i => i.pod_name)?.join('|'));
    //   return;
    // }
    setInstance(value);
  };

  return (
    <>
      <Card bordered={false}>
        <div className={styles['monitor-header']}>
          <TwTimePicker
            onTimeRange={handleRangeChange}
            onTimeClick={handleTimeChange}
          />
          <div style={{ marginLeft: 16 }}>
            <span>运行实例</span>
            <Select
              style={{ width: 250, marginLeft: 16 }}
              placeholder="请选择实例"
              onChange={handleSelectChange}
              value={pods?.length > 0 ? instanceValue : undefined}
            >
              {pods?.length > 0 &&
                pods?.map(({ pod_name }) => (
                  <Option key={pod_name} value={pod_name}>
                    <span title={pod_name}>{pod_name}</span>
                  </Option>
                ))}
              {pods?.length > 0 && (
                <Option key="all" value="all">
                  全部
                </Option>
              )}
            </Select>
          </div>
        </div>
        <div className={styles['monitor-overview']}>
          <TwOverViewList list={overviewData} loading={overviewLoading} />
        </div>
      </Card>
      <div className={styles['monitor-tabs']}>
        {tabList.length > 0 &&
          tabList.map(
            ({ label, isOutlink, key, isHide }, index) =>
              !isHide && (
                <div
                  className={classNames(styles['monitor-tabs-pane'], {
                    [styles['pane-show']]: activeKey === index
                  })}
                  key={index}
                  onClick={e => handleClick({ e, index, isOutlink, key })}
                >
                  <span style={{ color: isOutlink ? '#2467F6' : 'inherit' }}>
                    {label}
                  </span>
                  {isOutlink && (
                    <img
                      src={linkImg}
                      className={styles['monitor-tabs-pane-img']}
                    />
                  )}
                </div>
              )
          )}
      </div>
      {/* {activeKey === 0 && (
        <>
          <MonitorOverView
            start={start}
            end={end}
            instance={instanceValue}
            pollingRef={pollingRef}
            timeKey={timeKey}
            {...otherProps}
            pods={pods}
          />
        </>
      )} */}
      {activeKey === 1 && (
        <>
          <MonitorResource
            start={start}
            end={end}
            instance={instanceValue}
            pollingValue={pollingValue}
            timeKey={timeKey}
            {...otherProps}
            pods={pods}
          />
        </>
      )}
    </>
  );
};

export default memo(
  connect(({ application, global, loading }) => ({
    appList: application.apps,
    teamList: global.teamInfo,
    overviewLoading: loading.effects['monitor/fetchOverviewList']
  }))(Monitor)
);
