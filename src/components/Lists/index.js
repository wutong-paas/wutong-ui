import { Card, Col, Dropdown, Icon, Row } from 'antd';
import React, { PureComponent } from 'react';
import styles from './index.less';

export default class EnterpriseTeams extends PureComponent {
  render() {
    const { stylePro = { marginBottom: '10px' }, Cols, overlay } = this.props;
    const moreSvg = () => (
      <svg
        t="1581212425061"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1314"
        width="32"
        height="32"
      >
        <path
          d="M512 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1315"
          fill="#999999"
        />
        <path
          d="M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1316"
          fill="#999999"
        />
        <path
          d="M512 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1317"
          fill="#999999"
        />
      </svg>
    );

    return (
      <div className={styles.item}>
        <Card
          style={stylePro}
          hoverable
          bodyStyle={{ padding: 0 }}
          bordered={false}
        >
          <Row type="flex" align="middle" className={styles.pl24}>
            <Col span={overlay ? 23 : 24}>{Cols || ''}</Col>
            {overlay && (
              <Col span={1} className={styles.bor}>
                <Dropdown overlay={overlay} placement="bottomLeft">
                  <Icon component={moreSvg} style={{ width: '100%' }} />
                </Dropdown>
              </Col>
            )}
          </Row>
        </Card>
      </div>
    );
  }
}
