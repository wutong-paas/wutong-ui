import { Layout } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import { Link, Redirect } from 'dva/router';
import { enquireScreen } from 'enquire-js';
import { stringify } from 'querystring';
import React, { Fragment, PureComponent } from 'react';
import { ContainerQuery } from 'react-container-query';
import DocumentTitle from 'react-document-title';
import logo from '../../public/logo.png';
import GlobalHeader from '../components/GlobalHeader';
import headerStype from '../components/GlobalHeader/index.less';
import PageLoading from '../components/PageLoading';
import SiderMenu from '../components/SiderMenu';
import GlobalRouter from '../components/GlobalRouter';
import Authorized from '../utils/Authorized';
import wutongUtil from '../utils/wutong';
import { getMenuData } from '../common/enterpriseMenu';
import Context from './MenuContext';

const { Content,Sider} = Layout;
let isMobile;
enquireScreen(b => {
  isMobile = b;
});
class AccountLayout extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      isMobiles: isMobile,
      enterpriseList: []
    };
  }
  componentDidMount() {
    this.getEnterpriseList();
  }

  // get enterprise list
  getEnterpriseList = () => {
    const { dispatch } = this.props;
    // 获取最新的用户信息
    dispatch({ type: 'user/fetchCurrent' });
    dispatch({
      type: 'global/fetchEnterpriseList',
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState(
            {
              enterpriseList: res.list,
              ready: true
            },
            () => {
              this.fetchEnterpriseInfo();
            }
          );
        }
      }
    });
  };

  getContext() {
    const { location } = this.props;
    return {
      location
    };
  }
  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed
    });
  };

  fetchEnterpriseInfo = () => {
    const { dispatch, currentUser } = this.props;
    if (currentUser && currentUser.enterprise_id) {
      // this.fetchEnterpriseService(currentUser.enterprise_id);
      dispatch({
        type: 'global/fetchEnterpriseInfo',
        payload: {
          enterprise_id: currentUser.enterprise_id
        }
      });
    }
  };
  fetchEnterpriseService = eid => {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/fetchEnterpriseService',
      payload: {
        enterprise_id: eid
      }
    });
  };

  render() {
    const {
      children,
      currentUser,
      wutongInfo,
      collapsed,
      enterprise,
      location,
      match: {
        params: { eid }
      }
    } = this.props;

    const { enterpriseList, isMobiles, ready } = this.state;
    const fetchLogo = wutongUtil.fetchLogo(wutongInfo, enterprise) || logo;
    if (!ready || !enterprise) {
      return <PageLoading />;
    }
    const queryString = stringify({
      redirect: window.location.href
    });
    if (!currentUser || !wutongInfo || enterpriseList.length === 0) {
      return <Redirect to={`/user/login?${queryString}`} />;
    }

    const query = {
      'screen-xs': {
        maxWidth: 575
      },
      'screen-sm': {
        minWidth: 576,
        maxWidth: 767
      },
      'screen-md': {
        minWidth: 768,
        maxWidth: 991
      },
      'screen-lg': {
        minWidth: 992,
        maxWidth: 1199
      },
      'screen-xl': {
        minWidth: 1200
      }
    };
    const autoWidth = 'calc(100% -48px)';
    const customHeader = () => {
      return (
        <div className={headerStype.enterprise}>
          <Link to={`/enterprise/${currentUser.enterprise_id}/index`}>
            {enterprise && enterprise.enterprise_alias}
          </Link>
        </div>
      );
    };

    const layout = () => {
      return (
        <Layout>
          {/* <SiderMenu
            currentEnterprise={currentUser}
            enterpriseList={enterpriseList}
            currentUser={currentUser}
            logo={fetchLogo}
            Authorized={Authorized}
            collapsed={collapsed}
            location={location}
            isMobile={isMobiles}
            onCollapse={this.handleMenuCollapse}
          /> */}
          <Sider width={220} collapsed={collapsed} collapsedWidth={48}>
            <GlobalRouter
              // currentEnterprise={enterpriseInfo}
              enterpriseList={enterpriseList}
              title={
                wutongInfo &&
                wutongInfo.title &&
                wutongInfo.title.enable &&
                wutongInfo.title.value
              }
              currentUser={currentUser}
              Authorized={Authorized}
              menuData={getMenuData(eid, currentUser, enterprise)}
              showMenu
              pathname={location.pathname}
              location={location}
              // isMobile={this.state.isMobile}
              collapsed={collapsed}
              onCollapse={this.handleMenuCollapse}
            />
          </Sider>
          <Layout>
            <GlobalHeader
              logo={fetchLogo}
              isPubCloud={
                wutongInfo &&
                wutongInfo.is_public &&
                wutongInfo.is_public.enable
              }
              currentUser={currentUser}
              collapsed={collapsed}
              onCollapse={this.handleMenuCollapse}
              isMobile={isMobiles}
              customHeader={customHeader}
            />
            <Content
              key="sdfds"
              style={{
                height: 'calc(100vh - 56px)',
                overflow: 'auto',
                width: autoWidth
              }}
            >
              <div
                style={{
                  margin: '24px 24px 0'
                }}
              >
                <Authorized
                  logined
                  authority={['admin', 'user']}
                  noMatch={<Redirect to="/user/login" />}
                >
                  {children}
                </Authorized>
              </div>
            </Content>
          </Layout>
        </Layout>
      );
    };
    const SiteTitle = '梧桐容器平台';

    return (
      <Fragment>
        <DocumentTitle title={SiteTitle}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout()}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
      </Fragment>
    );
  }
}

export default connect(({ user, global }) => ({
  currentUser: user.currentUser,
  wutongInfo: global.wutongInfo,
  collapsed: global.collapsed,
  enterprise: global.enterprise
}))(AccountLayout);
