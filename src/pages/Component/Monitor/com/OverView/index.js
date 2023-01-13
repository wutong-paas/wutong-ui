/**
 * @content  监控总览
 * @date     2022/11/08
 * @author   Leon
 *
 */

import React, { memo, useEffect, useRef } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';
import { getLineOption, chartsInfoList, useCharts } from '../../conf.js';
import styles from '../../index.less';

const MonitorOverView = props => {
  const { chartsInstance } = useCharts(chartsInfoList);

  return (
    <>
      <div className={styles['monitor-oveview']}>
        <div>
          <Card bordered={false}>
            <div className={styles['monitor-overview-title']}>
              请求数/每分钟
            </div>
            <div
              id="request"
              className={styles['monitor-overview-charts']}
            ></div>
          </Card>
        </div>
        <div style={{ marginTop: 16 }}>
          <Card bordered={false}>
            <div className={styles['monitor-overview-title']}>
              响应时间/每分钟
            </div>
            <div
              id="response"
              className={styles['monitor-overview-charts']}
            ></div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default memo(MonitorOverView);
