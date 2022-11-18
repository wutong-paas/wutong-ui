import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import PageLoading from '../components/PageLoading';
import cookie from '../utils/cookie';
import globalUtil from '../utils/global';
import ErrorBoundary from './ErrorBoundary';
import Bulle from '@/components/Bulle';

class SecurityLayout extends React.PureComponent {
  state = {
    isReady: false
  };

  componentDidMount() {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'global/fetchWutongInfo',
        callback: info => {
          if (info) {
            this.fetchUserInfo();
          }
        }
      });
    }
  }

  fetchUserInfo = () => {
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
        callback: () => {
          this.setState({
            isReady: true
          });
        },
        handleError: () => {
          this.setState({
            isReady: true
          });
        }
      });
    }
  };

  render() {
    const { children, currentUser, needLogin, wutongInfo } = this.props;
    const { log_query, call_link_query } = wutongInfo || {};
    const { isReady } = this.state;
    // You can replace it to your authentication rule (such as check token exists)
    const token = cookie.get('token');
    const isLogin = token && currentUser;
    const queryString = stringify({
      redirect: window.location.href
    });
    if (needLogin) {
      globalUtil.removeCookie();
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    if (!isReady) {
      return <PageLoading />;
    }
    if (isReady && !isLogin && window.location.pathname !== '/user/login') {
      globalUtil.removeCookie();
      return <Redirect to={`/user/login?${queryString}`} />;
    }

    return (
      <>
        <ErrorBoundary
          children={
            <>
              {children}
              {!(
                call_link_query?.enable === false && log_query?.enable === false
              ) && <Bulle {...this.props} />}
            </>
          }
        />
        {/* <Bulle /> */}
      </>
    );
  }
}

export default connect(({ user, loading, global }) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
  needLogin: global.needLogin,
  wutongInfo: global.wutongInfo
}))(SecurityLayout);
