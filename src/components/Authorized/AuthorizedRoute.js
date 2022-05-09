import React from 'react';
import { Route, Redirect } from 'dva/router';
import { connect } from 'dva';
import Authorized from './Authorized';
import PublicLogin from './PublicLogin';

class AuthorizedRoute extends React.Component {
  // not login
  getNoMatch() {
    const {
      isPubCloud,
      logined,
      render,
      authority,
      redirectPath,
      wutongInfo,
      ...rest
    } = this.props;
    if (redirectPath === '/user/login') {
      if (wutongInfo && wutongInfo.is_public && wutongInfo.is_public.enable) {
        return <PublicLogin />;
      }
      return (
        <Route
          {...rest}
          render={() => (
            <Redirect
              to={{
                pathname: redirectPath
              }}
            />
          )}
        />
      );
    }
    return (
      <Route
        {...rest}
        render={() => (
          <Redirect
            to={{
              pathname: redirectPath
            }}
          />
        )}
      />
    );
  }
  render() {
    const {
      component: Component,
      logined,
      render,
      authority,
      redirectPath,
      wutongInfo,
      ...rest
    } = this.props;
    return (
      <Authorized
        authority={authority}
        logined={logined}
        noMatch={this.getNoMatch()}
      >
        <Route
          {...rest}
          render={props =>
            Component ? <Component {...props} /> : render(props)
          }
        />
      </Authorized>
    );
  }
}
export default connect(({ global }) => ({ wutongInfo: global.wutongInfo }))(
  AuthorizedRoute
);
