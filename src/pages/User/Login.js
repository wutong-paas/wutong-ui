/* eslint-disable compat/compat */
/* eslint-disable camelcase */
import { Divider, Row, Tooltip } from 'antd';
import { connect } from 'dva';
import React, { Component } from 'react';
import globalUtil from '../../utils/global';
import oauthUtil from '../../utils/oauth';
import wutongUtil from '../../utils/wutong';
import styles from './Login.less';
import LoginComponent from './loginComponent';

@connect(({ global }) => ({
  isRegist: global.isRegist,
  wutongInfo: global.wutongInfo
}))
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  UNSAFE_componentWillMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'global/hideNeedLogin' });
    globalUtil.removeCookie();
  }
  handleSubmit = values => {
    const { dispatch, location } = this.props;
    const query_params = new URLSearchParams(location.search);
    const redirect = query_params.get('redirect');
    dispatch({
      type: 'user/login',
      payload: {
        ...values
      },
      callback: () => {
        let url = '/';
        if (redirect) {
          url = redirect;
        }
        window.location.href = url;
      }
    });
  };
  fetchEnterpriseInfo = eid => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/fetchEnterpriseInfo',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (
          res &&
          res.status_code === 200 &&
          res.bean &&
          res.bean.oauth_services
        ) {
          // eslint-disable-next-line camelcase
          const { oauth_services = {} } = res.bean;
          if (oauth_services.enable) {
            this.setState({
              // eslint-disable-next-line react/no-unused-state
              oauthServicesList:
                oauth_services.value &&
                oauth_services.value.length > 0 &&
                oauth_services.value
            });
          }
        }
      }
    });
  };

  render() {
    const { wutongInfo } = this.props;
    const oauthInfo =
      wutongInfo &&
      wutongInfo.enterprise_center_oauth &&
      wutongInfo.enterprise_center_oauth.value;
    const url = oauthInfo && oauthUtil.getAuthredictURL(oauthInfo);
    const icon = oauthInfo && oauthUtil.getIcon(oauthInfo);
    let oauthServicesList = [];
    if (
      wutongInfo &&
      wutongInfo.oauth_services &&
      wutongInfo.oauth_services.enable &&
      wutongInfo.oauth_services.value &&
      wutongInfo.oauth_services.value.length > 0
    ) {
      oauthServicesList = wutongInfo.oauth_services.value;
    }
    const inlineBlock = { display: 'inline-block' };
    return (
      <div className={styles.main} style={{ marginTop: '100px' }}>
        <h2>登录</h2>
        <LoginComponent onSubmit={this.handleSubmit} type="login" />
        {wutongUtil.OauthbEnable(wutongInfo) &&
          (oauthInfo ||
            (oauthServicesList && oauthServicesList.length > 0)) && (
            <div className={styles.thirdBox}>
              <Divider>
                <div className={styles.thirdLoadingTitle}>第三方登录</div>
              </Divider>
              <Row className={styles.third}>
                {oauthInfo && (
                  <div className={styles.thirdCol} key={oauthInfo.client_id}>
                    <Tooltip placement="top" title={oauthInfo.name}>
                      <a style={inlineBlock} href={url} title={oauthInfo.name}>
                        {icon}
                      </a>
                    </Tooltip>
                  </div>
                )}
                {oauthServicesList.map(item => {
                  const { name, service_id } = item;
                  return (
                    <div className={styles.thirdCol} key={service_id}>
                      <Tooltip placement="top" title={name}>
                        <a
                          style={inlineBlock}
                          href={oauthUtil.getAuthredictURL(item)}
                          title={name}
                        >
                          {oauthUtil.getIcon(item)}
                        </a>
                      </Tooltip>
                    </div>
                  );
                })}
              </Row>
            </div>
          )}
      </div>
    );
  }
}
