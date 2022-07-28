import React from 'react';
import { Spin } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport
export default () => {
  const antIcon = (
    <Loading3QuartersOutlined style={{ fontSize: 24, color: '#08153A' }} spin />
  );
  return (
    <div style={{ height: '100vh', lineHeight: '100vh', textAlign: 'center' }}>
      <Spin
        size="large"
        indicator={antIcon}
        tip={<span style={{ color: '#08153A' }}>loading</span>}
      />
    </div>
  );
};
