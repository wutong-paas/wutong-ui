import { Button, Col, Modal, Row } from 'antd';
import React, { PureComponent } from 'react';
import styles from '../CreateTeam/index.less';
import styless from './index.less';

export default class PlatformIntroduced extends PureComponent {
  render() {
    const { onCancel } = this.props;

    return (
      <Modal
        width={600}
        centered
        keyboard={false}
        maskClosable={false}
        footer={false}
        visible
        className={styles.TelescopicModal}
        onOk={onCancel}
        onCancel={onCancel}
      >
        <h2 className={styless.initTitle}>欢迎您！</h2>
        <p style={{ textAlign: 'center' }}>
          我们将引导您完成第一次应用安装，体验平台最基础的能力。
        </p>
        <p style={{ textAlign: 'center', padding: '16px 0' }}>
          <Button onClick={onCancel} type="primary">
            马上开始
          </Button>
        </p>
      </Modal>
    );
  }
}
