import { connect } from 'dva';
import { Link } from 'dva/router';
import React from 'react';
import cloud from '../../public/cloud.png';
import logo from '../../public/white-logo.png';
import globalUtil from '../utils/global';
import oauthUtil from '../utils/oauth';
import wutongUtil from '../utils/wutong';
import CustomFooter from './CustomFooter';
import styles from './UserLayout.less';

class UserLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRender: false
    };
  }
  UNSAFE_componentWillMount() {
    const { dispatch } = this.props;
    // 初始化 获取RainbondInfo信息
    dispatch({
      type: 'global/fetchRainbondInfo',
      callback: info => {
        if (info) {
          // globalUtil.putLog(info);
          const { query } = this.props.location;
          const isLogin = this.props.location.pathname === '/user/login';
          if (isLogin) {
            const { redirect } = query;
            if (redirect) {
              window.localStorage.setItem('redirect', redirect);
            }
          }
          // check auto login
          const isOauth =
            wutongUtil.OauthbEnable(info) ||
            wutongUtil.OauthEnterpriseEnable(info);
          let oauthInfo =
            info.enterprise_center_oauth && info.enterprise_center_oauth.value;
          if (!oauthInfo && info.oauth_services && info.oauth_services.value) {
            info.oauth_services.value.map(item => {
              if (item.is_auto_login) {
                oauthInfo = item;
              }
              return null;
            });
          }
          const isDisableAutoLogin = query && query.disable_auto_login;
          if (
            isOauth &&
            oauthInfo &&
            isLogin &&
            oauthInfo.is_auto_login &&
            isDisableAutoLogin !== 'true'
          ) {
            globalUtil.removeCookie();
            window.location.href = oauthUtil.getAuthredictURL(oauthInfo);
          } else {
            this.isRender(true);
          }
        }
      }
    });
  }
  isRender = isRender => {
    this.setState({
      isRender
    });
  };
  render() {
    const { rainbondInfo, children } = this.props;
    const { isRender } = this.state;
    const fetchLogo = wutongUtil.fetchLogo(rainbondInfo) || logo;
    const isEnterpriseEdition = wutongUtil.isEnterpriseEdition(rainbondInfo);
    if (!rainbondInfo || !isRender) {
      return null;
    }
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logoContentBox}>
            <img src={logo} />
          </div>
          <div className={styles.contentBoxLeft}>
            <img src={cloud} />
          </div>
          <div className={styles.contentBoxRight}>{children}</div>
        </div>
      </div>
    );
  }
}

export default connect(({ global }) => ({
  rainbondInfo: global.rainbondInfo
}))(UserLayout);
