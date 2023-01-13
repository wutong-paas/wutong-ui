/**
 * @content 自定义tab组件，全局使用
 * @author  Leon
 * @date    2022/11/07
 *
 */

import React, { memo, useState } from 'react';

const TwTab = () => {
  const [activeKey, setActiveKey] = useState(0);

  const handleClick = ({ e, index, isOutlink }) => {
    if (!isOutlink) setActiveKey(index);
  };

  return (
    <>
      <div className={styles['tw-tabs']}>
        {tabList.length > 0 &&
          tabList.map(({ label, isOutlink }, index) => (
            <div
              className={classNames(styles['tw-tabs-pane'], {
                [styles['pane-show']]: activeKey === index
              })}
              key={index}
              onClick={e => handleClick({ e, index, isOutlink })}
            >
              {label}
            </div>
          ))}
      </div>
    </>
  );
};

export default memo(TwTab);
