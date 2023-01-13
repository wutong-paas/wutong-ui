/**
 * @content  视图总览列表组件
 * @author   Leon
 * @date     2022/11/04
 *
 */
import React, { memo } from 'react';
import { Empty, Spin } from 'antd';
import styles from './index.less';

const TwOverViewList = props => {
  const { list = [], loading = false } = props;
  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.wrap}>
          {list.length > 0 ? (
            list.map(({ number, unit, title }, index) => (
              <div className={styles.info} key={index}>
                <div className={styles.top}>
                  <span className={styles.count}>{number}</span>
                  <span className={styles.unit}>{unit}</span>
                </div>
                <div>
                  <span className={styles.title}>{title}</span>
                </div>
              </div>
            ))
          ) : (
            <Empty
              description="暂无数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Spin>
    </>
  );
};

export default memo(TwOverViewList);
