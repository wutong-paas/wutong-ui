import React, { Fragment } from 'react';
import globalUtil from '../utils/global';
import { connect } from 'dva';
import { Layout, Icon, message, notification, Modal, Button } from 'antd';
import { routerRedux } from 'dva/router';

// 提示充值或购买资源
@connect()
export default class PayTip extends React.PureComponent {
  handleCancel = () => {
    this.props.dispatch({
      type: 'global/hidePayTip'
    });
  };
  handleClick = () => {
    window.open('https://www.wutong.com/spa/#/personalCenter/my/recharge');
    this.handleCancel();
  };
  getRegionId = () => {
    const regionName = globalUtil.getCurrRegionName();
    let regionId = '';
    if (regionName == 'ali-hz') {
      regionId = 2;
    }
    if (regionName == 'ali-sh') {
      regionId = 1;
    }
    return regionId;
  };
  handleBuySource = () => {
    const regionId = this.getRegionId();
    if (regionId) {
      const url = `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/finance`;
      this.props.dispatch(routerRedux.push(url));
    } else {
      notification.warning({ message: '当前集群不可购买' });
    }
    this.handleCancel();
  };
  componentDidMount() {}
  render() {
    const regionId = this.getRegionId();
    return (
      <Modal
        visible
        title="提示"
        onCancel={this.handleCancel}
        footer={[
          regionId ? (
            <Button onClick={this.handleBuySource} type="primary" size="sm">
              购买资源
            </Button>
          ) : null
        ]}
      >
        <h4 style={{ textAlign: 'center' }}>资源不足</h4>
      </Modal>
    );
  }
}
