/* eslint-disable camelcase */
/* eslint-disable react/sort-comp */
import { Button } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import AppCreateSetting from '../../components/AppCreateSetting';
import ConfirmModal from '../../components/ConfirmModal';
import globalUtil from '../../utils/global';
import httpResponseUtil from '../../utils/httpResponse';
import roleUtil from '../../utils/role';

@connect(
  ({ loading, teamControl }) => ({
    buildAppsLoading: loading.effects['createApp/buildApps'],
    deleteAppLoading: loading.effects['appControl/deleteApp'],
    currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
  }),
  null,
  null,
  { withRef: true }
)
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appPermissions: this.handlePermissions('queryAppInfo'),
      appDetail: null
    };
  }
  componentDidMount() {
    this.loadDetail();
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'appControl/clearDetail' });
  }
  handlePermissions = type => {
    const { currentTeamPermissionsInfo } = this.props;
    return roleUtil.querySpecifiedPermissionsInfo(
      currentTeamPermissionsInfo,
      type
    );
  };
  loadDetail = () => {
    const { dispatch } = this.props;
    const { team_name, app_alias } = this.fetchParameter();
    dispatch({
      type: 'appControl/fetchDetail',
      payload: {
        team_name,
        app_alias
      },
      callback: data => {
        this.setState({ appDetail: data });
      },
      handleError: data => {
        const code = httpResponseUtil.getCode(data);
        if (code && code === 404) {
          // 应用不存在
          this.handleJump(`exception/404`);
        }
      }
    });
  };
  getAppAlias() {
    return this.props.match.params.appAlias;
  }

  handleBuild = () => {
    const { dispatch } = this.props;
    const { team_name, app_alias } = this.fetchParameter();
    const { service_id } = this.state.appDetail.service;
    dispatch({
      type: 'createApp/buildApps',
      payload: {
        team_name,
        app_alias
      },
      callback: data => {
        if (data) {
          dispatch({
            type: 'global/fetchGroups',
            payload: {
              team_name
            }
          });
          this.handleJump(
            `components/${app_alias}/overview/service_id/${service_id}`
          );
        }
      }
    });
  };
  handleDelete = () => {
    const { dispatch } = this.props;
    const { team_name, app_alias } = this.fetchParameter();
    dispatch({
      type: 'appControl/deleteApp',
      payload: {
        team_name,
        app_alias,
        is_force: true
      },
      callback: () => {
        dispatch({
          type: 'global/fetchGroups',
          payload: {
            team_name
          }
        });
        this.handleJump('index');
      }
    });
  };
  handleJump = targets => {
    const { dispatch } = this.props;
    const { team_name, region_name } = this.fetchParameter();
    dispatch(
      routerRedux.replace(`/team/${team_name}/region/${region_name}/${targets}`)
    );
  };

  showDelete = () => {
    this.setState({ showDelete: true });
  };
  fetchParameter = () => {
    return {
      team_name: globalUtil.getCurrTeamName(),
      region_name: globalUtil.getCurrRegionName(),
      app_alias: this.getAppAlias()
    };
  };
  render() {
    const { buildAppsLoading, deleteAppLoading } = this.props;
    const {
      showDelete,
      appPermissions: { isDelete }
    } = this.state;
    const appDetail = this.state.appDetail || {};
    if (!appDetail.service) {
      return null;
    }
    return (
      <div>
        <h2
          style={{
            textAlign: 'center'
          }}
        >
          高级设置
        </h2>
        <div
          style={{
            overflow: 'hidden'
          }}
        >
          <AppCreateSetting
            updateDetail={this.loadDetail}
            appDetail={appDetail}
          />
          <div
            style={{
              background: '#fff',
              padding: '20px',
              textAlign: 'right',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              borderTop: '1px solid #e8e8e8'
            }}
          >
            <Button
              loading={buildAppsLoading}
              style={{
                marginRight: 8
              }}
              onClick={this.handleBuild}
              type="primary"
            >
              确认创建
            </Button>
            {isDelete && (
              <Button onClick={this.showDelete} type="default">
                放弃创建
              </Button>
            )}
          </div>
          {showDelete && (
            <ConfirmModal
              loading={deleteAppLoading}
              onOk={this.handleDelete}
              title="放弃创建"
              subDesc="此操作不可恢复"
              desc="确定要放弃创建此应用吗？"
              onCancel={() => {
                this.setState({ showDelete: false });
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
