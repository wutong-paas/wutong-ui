import { DefaultFooter } from '@ant-design/pro-layout';
import { Icon } from 'antd';
import React from 'react';
import styles from './PageHeaderLayout.less';

export default () => (
  <DefaultFooter
    className={styles.customFooter}
    copyright="2022 湖南高速信息科技有限公司出品"
    links={[
      {
        key: 'PaaS',
        title: '官网',
        href: 'http://www.hngs.net/',
        blankTarget: true
      }
      // {
      //   key: 'poc',
      //   title: '联系我们',
      //   href: 'https://www.talkweb.com.cn/contact',
      //   blankTarget: true
      // }
    ]}
  />
);
