/* eslint-disable camelcase */
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import CodeGitRepostory from '../../components/GitRepostory';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { createEnterprise, createTeam } from '../../utils/breadcrumb';
import globalUtil from '../../utils/global';
import oauthUtil from '../../utils/oauth';
import wutongUtil from '../../utils/wutong';
import roleUtil from '../../utils/role';
import CodeCustom from './code-custom';
import CodeDemo from './code-demo';

@connect(
  ({ teamControl, global, enterprise }) => ({
    wutongInfo: global.wutongInfo,
    currentTeam: teamControl.currentTeam,
    currentRegionName: teamControl.currentRegionName,
    currentEnterprise: enterprise.currentEnterprise,
    enterprise: global.enterprise,
    currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
  }),
  null,
  null,
  { pure: false }
)
export default class Main extends PureComponent {
  UNSAFE_componentWillMount() {
    const { currentTeamPermissionsInfo, dispatch } = this.props;
    roleUtil.canCreateComponent(currentTeamPermissionsInfo, dispatch);
  }
  handleTabChange = key => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push(
        `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/create/code/${key}`
      )
    );
  };
  render() {
    const {
      wutongInfo,
      enterprise,
      match,
      currentEnterprise,
      currentTeam,
      currentRegionName
    } = this.props;

    const map = {
      custom: CodeCustom,
      demo: CodeDemo
    };

    const tabList = [
      {
        key: 'custom',
        tab: '自定义源码'
      }
    ];
    if (wutongUtil.officialDemoEnable(wutongInfo)) {
      tabList.push({ key: 'demo', tab: '官方DEMO' });
    }
    const servers = oauthUtil.getEnableGitOauthServer(enterprise);
    if (servers && servers.length > 0) {
      servers.map(item => {
        const { name, service_id, oauth_type } = item;
        const typeMap = {
          github: 'Github',
          gitlab: 'Gitlab',
          gitee: 'Gitee'
        };
        const setName = typeMap[oauth_type] || '';
        const tabName = setName
          ? `${setName} ${name && `(${name})`}`
          : `${name}项目`;

        map[service_id] = CodeGitRepostory;
        tabList.push({
          key: service_id,
          types: oauth_type,
          tab: tabName
        });
        return tabList;
      });
    }
    let { type } = match.params;
    if (!type) {
      type = 'custom';
    }
    const Com = map[type];
    let breadcrumbList = [];
    breadcrumbList = createTeam(
      createEnterprise(breadcrumbList, currentEnterprise),
      currentTeam,
      currentRegionName
    );
    breadcrumbList.push({ title: '创建组件' });
    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        title="由源码创建组件"
        onTabChange={this.handleTabChange}
        content={<p> 从指定源码仓库中获取源码，基于源码信息创建新组件 </p>}
        tabActiveKey={type}
        tabList={tabList}
      >
        {Com ? (
          <Com
            {...this.props}
            type={this.props.match.params.type}
            tabList={tabList}
          />
        ) : (
          '参数错误'
        )}
      </PageHeaderLayout>
    );
  }
}
