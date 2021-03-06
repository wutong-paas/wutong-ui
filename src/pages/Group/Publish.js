import {
  Button,
  Card,
  notification,
  Popconfirm,
  Popover,
  Table,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import moment from 'moment';
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi-plugin-locale';
import ScrollerX from '../../components/ScrollerX';
import SelectStore from '../../components/SelectStore';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {
  createApp,
  createEnterprise,
  createTeam
} from '../../utils/breadcrumb';
import globalUtil from '../../utils/global';
import roleUtil from '../../utils/role';
import style from './publish.less';

@connect(({ list, loading, teamControl, enterprise }) => ({
  list,
  loading: loading.models.list,
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
  currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
}))
export default class AppPublishList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      appDetail: {},
      page: 1,
      pageSize: 10,
      total: 0,
      storeLoading: false,
      selectStoreShow: false
    };
  }
  UNSAFE_componentWillMount() {
    const { currentTeamPermissionsInfo, dispatch } = this.props;
    const isShare = roleUtil.queryAppInfo(currentTeamPermissionsInfo, 'share');
    if (!isShare) {
      globalUtil.withoutPermission(dispatch);
    }
  }

  componentDidMount() {
    this.fetchAppDetail();
    this.fetchPublishRecoder();
  }
  onPublishStore = () => {
    this.setState({ selectStoreShow: true });
  };
  onPublishLocal = from => {
    this.handleShare('', {}, from);
  };

  onPageChange = page => {
    this.setState({ page }, () => {
      this.fetchPublishRecoder();
    });
  };

  fetchAppDetail = () => {
    const { dispatch } = this.props;
    const { teamName, regionName, appID } = this.props.match.params;
    this.setState({ loadingDetail: true });
    dispatch({
      type: 'application/fetchGroupDetail',
      payload: {
        team_name: teamName,
        region_name: regionName,
        group_id: appID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            appDetail: res.bean,
            loadingDetail: false
          });
        }
      },
      handleError: res => {
        if (res && res.code === 404) {
          this.props.dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps`
            )
          );
        }
      }
    });
  };

  fetchPublishRecoder = () => {
    this.setState({ loading: true });
    const { teamName, appID } = this.props.match.params;
    const { dispatch } = this.props;
    const { page, pageSize } = this.state;
    dispatch({
      type: 'application/fetchShareRecords',
      payload: {
        team_name: teamName,
        app_id: appID,
        page,
        page_size: pageSize
      },
      callback: data => {
        if (data) {
          this.setState({
            recoders: data.list,
            total: data.bean.total,
            loading: false
          });
        }
      }
    });
  };

  handleShare = (scope, target, from) => {
    const { teamName, appID } = this.props.match.params;
    const { dispatch } = this.props;
    dispatch({
      type: 'application/ShareGroup',
      payload: {
        team_name: teamName,
        group_id: appID,
        scope,
        target
      },
      callback: data => {
        this.continuePublish(data.bean.ID, data.bean.step, from);
      }
    });
  };

  hideSelectStoreShow = () => {
    this.setState({ selectStoreShow: false });
  };
  handleStoreLoading = loading => {
    this.setState({ storeLoading: loading });
  };
  handleSelectStore = values => {
    this.handleStoreLoading(true);
    const selectStore = values.store_id;
    this.handleShare('wutong', { store_id: selectStore });
  };
  deleteRecord = recordID => {
    const { teamName, appID } = this.props.match.params;
    const { dispatch } = this.props;
    dispatch({
      type: 'application/deleteShareRecord',
      payload: {
        team_name: teamName,
        app_id: appID,
        record_id: recordID
      },
      callback: () => {
        this.fetchPublishRecoder();
      }
    });
  };

  cancelPublish = recordID => {
    if (recordID === undefined || recordID === '') {
      notification.warning({ message: '????????????' });
      return;
    }
    const { teamName } = this.props.match.params;
    const { dispatch } = this.props;
    dispatch({
      type: 'application/giveupShare',
      payload: {
        team_name: teamName,
        share_id: recordID
      },
      callback: () => {
        this.fetchPublishRecoder();
      }
    });
  };

  continuePublish = (recordID, step, from) => {
    const { dispatch } = this.props;
    const { teamName, regionName, appID } = this.props.match.params;
    if (step === 1) {
      if (from === 'cloudMarket') {
        dispatch(
          routerRedux.push({
            pathname: `/team/${teamName}/region/${regionName}/apps/${appID}/share/${recordID}/one`,
            from
          })
        );
      } else {
        dispatch(
          routerRedux.push(
            `/team/${teamName}/region/${regionName}/apps/${appID}/share/${recordID}/one`
          )
        );
      }
    }
    if (step === 2) {
      dispatch(
        routerRedux.push(
          `/team/${teamName}/region/${regionName}/apps/${appID}/share/${recordID}/two`
        )
      );
    }
    this.handleStoreLoading(false);
  };

  handleBox = val => {
    return (
      <div className={style.version}>
        <Tooltip placement="topLeft" title={val}>
          {val}
        </Tooltip>
      </div>
    );
  };

  render() {
    let breadcrumbList = [];
    const {
      appDetail,
      loading,
      loadingDetail,
      page,
      pageSize,
      total,
      selectStoreShow,
      recoders,
      storeLoading
    } = this.state;
    const {
      currentEnterprise,
      currentTeam,
      currentRegionName,
      dispatch
    } = this.props;
    breadcrumbList = createApp(
      createTeam(
        createEnterprise(breadcrumbList, currentEnterprise),
        currentTeam,
        currentRegionName
      ),
      currentTeam,
      currentRegionName,
      { appName: appDetail.group_name, appID: appDetail.group_id }
    );

    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        loading={loadingDetail}
        title={formatMessage({ id: 'app.publish.title' })}
        content={formatMessage({ id: 'app.publish.desc' })}
        extraContent={
          <div>
            <Button
              style={{ marginRight: 8 }}
              type="primary"
              onClick={this.onPublishLocal}
            >
              ??????????????????
            </Button>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => this.onPublishLocal('cloudMarket')}
            >
              ????????????????????????
            </Button>
          </div>
        }
      >
        <Card loading={loading}>
          <ScrollerX sm={800}>
            <Table
              pagination={{
                current: page,
                pageSize,
                total,
                onChange: this.onPageChange
              }}
              dataSource={recoders || []}
              columns={[
                {
                  title: '??????????????????',
                  dataIndex: 'app_model_name',
                  render: (val, data) => {
                    if (val) {
                      return val;
                    }
                    return (
                      <span style={{ color: '#999999' }}>
                        {data.status === 0 ? '?????????' : '-'}
                      </span>
                    );
                  }
                },
                {
                  title: '?????????(??????)',
                  dataIndex: 'version',
                  align: 'left',
                  render: (val, data) => {
                    const versionAlias =
                      (data.version_alias && `(${data.version_alias})`) || '';
                    if (val) {
                      const appVersionInfo = data.app_version_info;
                      return (
                        <Popover
                          style={{
                            marginBottom: 0
                          }}
                          content={
                            appVersionInfo
                              ? this.handleBox(appVersionInfo)
                              : '??????????????????'
                          }
                          title={this.handleBox(`${val}${versionAlias}`)}
                        >
                          <div className={style.version}>
                            {val}
                            {versionAlias}
                          </div>
                        </Popover>
                      );
                    }
                    return <span style={{ color: '#999999' }}>?????????</span>;
                  }
                },
                {
                  title: '????????????',
                  dataIndex: 'scope',
                  align: 'center',
                  render: (val, data) => {
                    const storeName =
                      data && data.scope_target && data.scope_target.store_name;
                    const marketAddress =
                      val === 'market'
                        ? `/enterprise/${currentEnterprise.enterprise_id}/shared/cloudstoremarket`
                        : `/enterprise/${currentEnterprise.enterprise_id}/shared/local`;
                    switch (val) {
                      case '':
                        return <Link to={marketAddress}>????????????</Link>;
                      case 'team':
                        return <Link to={marketAddress}>????????????(??????)</Link>;
                      case 'enterprise':
                        return <Link to={marketAddress}>????????????(??????)</Link>;
                      case 'market':
                        return <Link to={marketAddress}>???????????????</Link>;
                      default:
                        return (
                          <p style={{ marginBottom: 0 }}>
                            {storeName || '????????????'}
                          </p>
                        );
                    }
                  }
                },
                {
                  title: '????????????',
                  align: 'center',
                  dataIndex: 'create_time',
                  render: val => (
                    <span>
                      {moment(val)
                        .locale('zh-cn')
                        .format('YYYY-MM-DD HH:mm:ss')}
                    </span>
                  )
                },
                {
                  title: '??????',
                  align: 'center',
                  dataIndex: 'status',
                  render: val => {
                    // eslint-disable-next-line default-case
                    switch (val) {
                      case 0:
                        return '?????????';
                      case 1:
                        return <span style={{ color: 'green' }}>????????????</span>;
                      case 2:
                        return <span style={{ color: '#999999' }}>?????????</span>;
                    }
                    return '';
                  }
                },
                {
                  title: '??????',
                  width: '200px',
                  dataIndex: 'dataIndex',
                  render: (val, data) => {
                    return (
                      <div>
                        {data.status === 0 ? (
                          <div>
                            <a
                              style={{ marginRight: '5px' }}
                              onClick={() => {
                                this.continuePublish(data.record_id, data.step);
                              }}
                            >
                              ????????????
                            </a>
                            <a
                              style={{ marginRight: '5px' }}
                              onClick={() => {
                                this.cancelPublish(data.record_id);
                              }}
                            >
                              ????????????
                            </a>
                          </div>
                        ) : (
                          <Popconfirm
                            title="???????????????????????????????"
                            onConfirm={() => {
                              this.deleteRecord(data.record_id);
                            }}
                            okText="??????"
                            cancelText="??????"
                          >
                            <a href="#">??????</a>
                          </Popconfirm>
                        )}
                      </div>
                    );
                  }
                }
              ]}
            />
          </ScrollerX>
        </Card>
        <SelectStore
          loading={storeLoading}
          dispatch={dispatch}
          enterprise_id={currentEnterprise.enterprise_id}
          visible={selectStoreShow}
          onCancel={this.hideSelectStoreShow}
          onOk={this.handleSelectStore}
        />
      </PageHeaderLayout>
    );
  }
}
