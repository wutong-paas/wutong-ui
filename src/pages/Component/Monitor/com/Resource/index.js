/**
 * @content  监控-资源
 * @date     2022/11/08
 *@author    Leon
 *
 */

import React, { memo, useEffect, useState, useRef } from 'react';
import { Row, Col, Empty, Card, Spin } from 'antd';
import {
  getCpuUsage,
  getMemoryUsage,
  getNetworkReceived,
  getNetworkSend,
  getDiskRead,
  getDiskWrite
} from '@/services/monitor';
import { chartsInfoList2, useCharts } from '../../conf';
import { formatTime } from '@/components/TwComponents/TwTimePicker/conf';
import {
  getUrlParams,
  timeObject
} from '@/components/Bulle/com/LogDrawer/conf';
import moment from 'moment';
import styles from '../../index.less';

const Resource = props => {
  const {
    appList,
    teamList,
    start,
    end,
    pods,
    instance,
    pollingRef,
    timeKey,
    location: { pathname }
  } = props;
  const [loading, setLoading] = useState(false);
  const [listData, setData] = useState([]);
  const timeId = useRef(null);
  const getChartsDataRef = useRef();

  //如果有定时器，依赖改变时需要先清理，再调用请求
  useEffect(() => {
    if (timeId.current) {
      clearTimeout(timeId.current);
      timeId.current = null;
    }
    if (pods.length > 0) getChartsData.current();
    return () => {
      if (timeId.current) {
        clearTimeout(timeId.current);
        timeId.current = null;
      }
    };
  }, [start, end, instance, pods]);

  // 轮询间隔改变时单独处理
  useEffect(() => {
    if (timeId.current) {
      clearTimeout(timeId.current);
      timeId.current = null;
      if (pollingRef?.current !== 'off') {
        getChartsData.current();
      }
    }
  }, [pollingRef]);

  //初始化图表hooks
  useCharts(listData, timeKey);

  //获取图表数据，生成listData
  const getChartsData = async () => {
    const teamIndex = teamList?.findIndex(
      i => i.team_name === getUrlParams(pathname, 'team')
    );
    const serviceIndex = appList?.findIndex(
      i => i.service_id === getUrlParams(pathname, 'service_id')
    );
    const teamName = teamList[teamIndex]?.namespace;
    const serviceName = appList[serviceIndex]?.k8s_component_name;
    setLoading(true);
    let res = null;
    let endTimeOfKey,
      startTimeOfKey = 0;
    // 非自定义时间需要自己处理
    // 再此处处理时间是因为轮询时需要最新的时间间隔
    if (timeKey !== 'custom') {
      endTimeOfKey = moment()
        .valueOf()
        .toString();
      startTimeOfKey = moment()
        .subtract(
          formatTime[timeKey].count.toString(),
          formatTime[timeKey].unit
        )
        .valueOf()
        .toString();
    }
    const params = {
      namespace: teamName,
      component: serviceName,
      instance:
        instance === 'all' ? pods?.map(i => i.pod_name)?.join('|') : instance,
      start: timeKey !== 'custom' ? startTimeOfKey : start,
      end: timeKey !== 'custom' ? endTimeOfKey : end
    };
    try {
      res = await Promise.allSettled([
        getCpuUsage(params),
        getMemoryUsage(params),
        getNetworkReceived(params),
        getNetworkSend(params),
        getDiskRead(params),
        getDiskWrite(params)
      ]);
      res = res
        .map(i => {
          if (i.status === 'fulfilled' && i.value) {
            return {
              flag: i.value?.flag,
              timestamps: i.value?.timestamps,
              seriesData: i.value?.list,
              name: i.value?.name,
              unit: i.value?.unit
            };
          }
        })
        .filter(i => !!i);
      setData(res);
      //轮询
      if (pollingRef?.current !== 'off') {
        if (timeId.current) {
          clearTimeout(timeId.current);
          timeId.current = null;
        }

        timeId.current = setTimeout(() => {
          getChartsData.current();
        }, Number(pollingRef?.current));
      }
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
    return res;
  };

  getChartsData.current = getChartsData;

  return (
    <>
      <Spin spinning={loading}>
        <Row gutter={16}>
          {listData?.length > 0 ? (
            listData.map(
              ({ flag, name, unit, seriesData, timestamps }, index) => {
                return (
                  <Col
                    span={12}
                    key={flag}
                    style={{ marginTop: index > 1 ? 16 : 0 }}
                  >
                    <Card bordered={false}>
                      <div className={styles['monitor-resource-title']}>
                        {`${name}`}
                        {unit ? `（${unit}）` : ''}
                      </div>
                      {seriesData?.length === 0 || timestamps?.length === 0 ? (
                        <Empty style={{ height: 276 }} />
                      ) : (
                        <div
                          id={flag}
                          className={styles['monitor-resource-charts']}
                        >
                        </div>
                      )}
                    </Card>
                  </Col>
                );
              }
            )
          ) : (
            <Empty />
          )}
        </Row>
      </Spin>
    </>
  );
};

export default memo(Resource);
