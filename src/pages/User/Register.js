import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { Component } from 'react';
// import globalUtil from '../../utils/global';
import wutongUtil from '../../utils/wutong';
import styles from './Register.less';
import RegisterComponent from './registerComponent';

@connect(({ user, global }) => ({
  register: user.register,
  wutongInfo: global.wutongInfo,
  isRegist: global.isRegist
}))
export default class Register extends Component {
  // first user, to register admin
  state = {};

  handleSubmit = values => {
    const { wutongInfo } = this.props;
    const { dispatch } = this.props;
    dispatch({
      type: 'user/register',
      payload: {
        ...values
      }
      // complete: data => {
      //   if (firstRegist) {
      //     globalUtil.putRegistLog(
      //       Object.assign(
      //         { enterprise_alias: values.enter_name, version },
      //         data
      //       )
      //     );
      //   }
      // }
    });
  };

  render() {
    const { isRegist, dispatch, wutongInfo } = this.props;
    if (!isRegist) {
      dispatch(routerRedux.replace('/user/login'));
      return null;
    }
    const firstRegist = !wutongUtil.fetchIsFirstRegist(wutongInfo);
    return (
      <div className={styles.main} style={{ marginTop: '37px' }}>
        <h3>{firstRegist ? '管理员注册' : '用户注册'}</h3>
        <RegisterComponent onSubmit={this.handleSubmit} type="register" />
      </div>
    );
  }
}
