import React, { PureComponent } from 'react';
import { Modal, Button } from 'antd';
import { connect } from 'dva';
import styles from '../CreateTeam/index.less';

@connect(({ user, global }) => ({
  currUser: user.currentUser,
  wutongInfo: global.wutongInfo
}))
export default class AppStore extends PureComponent {
  handleSubmit = () => {
    const { wutongInfo, eid } = this.props;
    const domain =
      wutongInfo && wutongInfo.market_url && wutongInfo.market_url.enable
        ? wutongInfo.market_url.value
        : 'https://market.wutong.com';
    const callback = window.location.href;
    const version =
      wutongInfo && wutongInfo.version && wutongInfo.version.enable
        ? wutongInfo.version.value
        : '';
    const url = `${domain}/manage/jointcloud?join_id=${eid}&callback_url=${callback}&rbd_version=${version}`;
    window.location.href = url;
  };

  render() {
    const { onCancel } = this.props;
    return (
      <Modal
        title="绑定云端应用商店"
        visible
        className={styles.TelescopicModal}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        footer={[
          <Button onClick={onCancel}> 取消 </Button>,
          <Button type="primary" onClick={this.handleSubmit}>
            绑定
          </Button>
        ]}
      />
    );
  }
}
