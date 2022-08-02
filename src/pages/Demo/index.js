import React, { useState } from 'react';
import TwTabs from '../../components/TwComponents/TwTabs';

const tabPaneList = [
  {
    title: '运行中',
    keys: 0,
    badge: '10'
  },
  {
    title: '异常',
    keys: 1,
    badge: '10'
  },
  {
    title: '闲置',
    keys: 2,
    badge: '10'
  },
  {
    title: '故障',
    keys: 3,
    badge: '10'
  }
];

export default () => {
  const [activeKey, setActiveKey] = useState(3);
  const handleTabChange = key => setActiveKey(key);
  return (
    <>
      <TwTabs
        tabPaneList={tabPaneList}
        onTabChange={handleTabChange}
        activeKey={activeKey}
      />
    </>
  );
};
