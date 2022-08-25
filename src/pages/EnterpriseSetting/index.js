import { Tabs } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import userUtil from '../../utils/user';
import BackupManage from './backup';
import Infrastructure from './infrastructure';
import Management from './management';
import styles from './index.less';

const { TabPane } = Tabs;

@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
  wutongInfo: global.wutongInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  certificateLongin: loading.effects['global/putCertificateType'],
  overviewInfo: index.overviewInfo
}))
export default class EnterpriseSetting extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      adminer,
      activeKey: 'infrastructure'
    };
  }
  UNSAFE_componentWillMount() {
    const { adminer } = this.state;
    const { dispatch } = this.props;
    if (!adminer) {
      dispatch(routerRedux.push(`/`));
    }
  }
  onChange = key => {
    this.setState({ activeKey: key });
  };

  render() {
    const { adminer, activeKey } = this.state;
    return (
      <PageHeaderLayout
        title="企业设置"
        content="支持用户注册、Oauth2.0集成等企业设置功能，更丰富的企业管理资源管理功能在企业资源管理平台提供。"
      >
        <div className={styles.setting}>
          <Tabs onChange={this.onChange} activeKey={activeKey}>
            <TabPane tab={<div>基础设置</div>} key="infrastructure">
              <Infrastructure {...this.props} />
            </TabPane>
            {adminer && (
              <TabPane tab={<div>企业管理员管理</div>} key="management">
                <Management {...this.props} />
              </TabPane>
            )}
            {/*todo 数据备份功能*/}
            {/*{adminer && (
            <TabPane tab={<div>数据备份</div>} key="backup">
              <BackupManage {...this.props} />
            </TabPane>
          )}*/}
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}
