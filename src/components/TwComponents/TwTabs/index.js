/**
 * @content 自定义tabs，表格使用
 * @author  Leon
 * @date    2022/08/02
 *
 */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.less';

const TwTabs = props => {
  const { tabPaneList = [], onTabChange, activeKey: propsActiveKey } = props;
  const [activeKey, setActiveKey] = useState(propsActiveKey || 0);

  const handleChange = key => setActiveKey(key);

  useEffect(() => {
    if (propsActiveKey) {
      setActiveKey(propsActiveKey);
    }
  }, [propsActiveKey]);

  return (
    <div className={styles.wrap}>
      {tabPaneList.map((item, index) => {
        const { keys, title, badge } = item;
        return (
          <div
            onClick={e => {
              if (
                !['undefined', 'null'].includes(typeof propsActiveKey) &&
                onTabChange &&
                Object.prototype.toString.call(onTabChange) ===
                  '[object Function]'
              ) {
                onTabChange(keys ? keys : index);
                return;
              }
              handleChange(keys ? keys : index);
            }}
            key={keys ? keys : index}
            className={classNames(styles.tabpane, {
              [styles.active]: activeKey === keys || activeKey === index
            })}
          >
            <div>{title}</div>
            {badge && <div className={styles.badge}>{badge}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default TwTabs;
