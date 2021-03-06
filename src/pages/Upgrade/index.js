/* eslint-disable react/sort-comp */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
/* eslint-disable global-require */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-nested-ternary */
import ComponentVersion from '@/components/ComponentVersion';
import {
  Avatar,
  Button,
  Form,
  List,
  Modal,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import React, { PureComponent } from 'react';
import MarketAppDetailShow from '../../components/MarketAppDetailShow';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {
  getAppModelLastRecord,
  postUpgradeRecord,
  rollbackUpgrade
} from '../../services/app';
import {
  createApp,
  createEnterprise,
  createTeam
} from '../../utils/breadcrumb';
import handleAPIError from '../../utils/error';
import globalUtil from '../../utils/global';
import roleUtil from '../../utils/role';
import styles from './index.less';
import RollsBackRecordDetails from './RollbackInfo/details';
import RollsBackRecordList from './RollbackInfo/index';
import infoUtil from './UpgradeInfo/info-util';

const { TabPane } = Tabs;

@Form.create()
@connect(({ user, global, application, teamControl, enterprise }) => ({
  groupDetail: application.groupDetail || {},
  currUser: user.pageUser,
  groups: global.groups || [],
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
  currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
}))
export default class AppList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loadingDetail: true,
      loadingList: true,
      isDeploymentFailure: false,
      isPartiallyCompleted: false,
      upgradeLoading: true,
      recordLoading: true,
      isComponent: false,
      showApp: {},
      showMarketAppDetail: false,
      list: [],
      activeKey: '1',
      page: 1,
      pageSize: 10,
      total: 0,
      dataList: [],
      appDetail: {},
      backUpgradeLoading: false,
      showLastUpgradeRecord: false,
      showLastRollbackRecord: false,
      rollbackRecords: false,
      rollbackRecordDetails: false
    };
  }

  UNSAFE_componentWillMount() {
    const { currentTeamPermissionsInfo, dispatch } = this.props;
    const isUpgrade = roleUtil.queryAppInfo(
      currentTeamPermissionsInfo,
      'upgrade'
    );
    if (!isUpgrade) {
      globalUtil.withoutPermission(dispatch);
    }
  }

  componentDidMount() {
    this.fetchAppDetail();
    this.getApplication();
    this.fetchAppLastUpgradeRecord();
  }

  onUpgrade = item => {
    const { team_name, group_id } = this.getParameter();
    getAppModelLastRecord({
      appID: group_id,
      team_name,
      upgrade_group_id: item.upgrade_group_id
    }).then(re => {
      // last upgrade record partial success.
      const status = re.bean && re.bean.status;
      if (status) {
        if ([6, 10].includes(status)) {
          this.setState({
            isDeploymentFailure: status === 10,
            isPartiallyCompleted: status === 6,
            showLastUpgradeRecord: true,
            upgradeItem: item
          });
          return;
        }
        if ([3, 8].includes(status)) {
          this.createNewRecord(item);
          return;
        }
        this.openInfoPage(re.bean);
      } else {
        this.createNewRecord(item);
      }
    });
  };

  // ?????????????????????????????????
  getApplication = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/application',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        group_id: this.getGroupId()
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            dataList: res.list || []
          });
        }
        this.handleCancelLoading();
      }
    });
  };

  getParameter = () => {
    const { teamName, regionName, appID } = this.props.match.params;
    return {
      team_name: teamName,
      region_name: regionName,
      group_id: appID
    };
  };

  getGroupId = () => {
    const { params } = this.props.match;
    return params.appID;
  };

  // ????????????????????????????????????
  getUpgradeRecordsList = () => {
    const { page, pageSize } = this.state;
    const { team_name, group_id } = this.getParameter();
    this.props.dispatch({
      type: 'global/CloudAppUpdateRecordsList',
      payload: {
        team_name,
        group_id,
        page,
        pageSize,
        status__gt: 1
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            list: res.list || [],
            total: res.bean && res.bean.total
          });
        }
        this.handleCancelLoading();
      }
    });
  };

  getVersionChangeShow = record => {
    if (record.market_name) {
      return (
        <div>
          ?????????????????????{record.market_name}????????????
          <span className={styles.versions}>{record.old_version}</span>
          ?????????
          <span className={styles.versions}>{record.version}</span>
        </div>
      );
    }
    return (
      <div>
        ?????????<span className={styles.versions}>{record.old_version}</span>
        ?????????
        <span className={styles.versions}>{record.version}</span>
      </div>
    );
  };

  fetchAppLastUpgradeRecord = () => {
    const { team_name, group_id } = this.getParameter();
    getAppModelLastRecord({
      team_name,
      appID: group_id,
      noModels: true
    })
      .then(re => {
        const info = re.bean;
        if (info && JSON.stringify(info) !== '{}') {
          this.setState({
            lastRecord: info,
            showLastUpgradeRecord: [2].includes(info.status)
          });
        }
      })
      .catch(err => {
        handleAPIError(err);
      });
  };

  fetchAppLastRollbackRecord = item => {
    const { team_name, group_id } = this.getParameter();
    getAppModelLastRecord({
      team_name,
      appID: group_id,
      record_type: 'rollback',
      noModels: true
    })
      .then(re => {
        const info = re.bean;
        if (info && JSON.stringify(info) !== '{}') {
          const showLastRollbackRecord = [4].includes(info.status);
          if (showLastRollbackRecord) {
            this.setState({
              lastRecord: info,
              showLastRollbackRecord
            });
          } else {
            this.onUpgrade(item);
          }
        } else {
          this.onUpgrade(item);
        }
      })
      .catch(err => {
        handleAPIError(err);
      });
  };

  getUpgradeRecordsHelmList = () => {
    const { page, pageSize } = this.state;
    this.props.dispatch({
      type: 'global/fetchUpgradeRecordsHelmList',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        group_id: this.getGroupId(),
        page,
        pageSize
      },
      callback: res => {
        this.handleLoading();
        if (res && res.status_code === 200) {
          this.setState({
            list: res.list || []
          });
        }
        this.handleCancelLoading();
      }
    });
  };

  handleLoading = () => {
    this.setState({
      loadingList: false,
      recordLoading: false,
      upgradeLoading: false
    });
  };

  createNewRecord = item => {
    const { team_name, group_id } = this.getParameter();
    postUpgradeRecord({
      team_name,
      appID: group_id,
      upgrade_group_id: item.upgrade_group_id,
      noModels: true
    })
      .then(re => {
        this.openInfoPage(re.bean);
      })
      .catch(err => {
        handleAPIError(err);
      });
  };

  fetchAppDetail = () => {
    const { dispatch } = this.props;
    this.setState({ loadingDetail: true });
    dispatch({
      type: 'application/fetchGroupDetail',
      payload: this.getParameter(),
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState(
            {
              appDetail: res.bean,
              loadingDetail: false
            },
            () => {
              if (
                res.bean &&
                res.bean.app_type &&
                res.bean.app_type === 'helm'
              ) {
                this.handleTabs('2');
              } else {
                this.getApplication();
              }
            }
          );
        }
      },
      handleError: res => {
        if (res && res.code === 404) {
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps`
            )
          );
        }
      }
    });
  };
  openInfoPage = item => {
    const { team_name, group_id } = this.getParameter();
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push(
        `/team/${team_name}/region/${globalUtil.getCurrRegionName()}/apps/${group_id}/upgrade/${
          item.upgrade_group_id
        }/record/${item.ID}?app_id=${item.group_key}`
      )
    );
  };
  showMarketAppDetail = app => {
    this.setState({
      showApp: app,
      showMarketAppDetail: true
    });
  };
  showRollback = item => {
    this.setState({
      showRollbackConfirm: item,
      rollbackRecord: item
    });
  };
  showRollbackList = item => {
    this.setState({
      rollbackRecords: item
    });
  };
  showRollbackDetails = item => {
    this.setState({
      rollbackRecordDetails: item
    });
  };

  hideMarketAppDetail = () => {
    this.setState({
      showApp: {},
      showMarketAppDetail: false
    });
  };

  handleTabs = key => {
    const { appDetail } = this.state;
    this.setState(
      {
        upgradeLoading: true,
        recordLoading: true,
        activeKey: key
      },
      () => {
        if (appDetail.app_type === 'helm') {
          this.getUpgradeRecordsHelmList();
        } else {
          key === '2' ? this.getUpgradeRecordsList() : this.getApplication();
        }
      }
    );
  };

  handleTableChange = (page, pageSize) => {
    this.setState(
      {
        page,
        pageSize
      },
      () => {
        this.getUpgradeRecordsList();
      }
    );
  };
  rollbackUpgrade = () => {
    this.handleBackUpgradeLoading(true);
    const { rollbackRecord } = this.state;
    const { team_name, group_id } = this.getParameter();
    rollbackUpgrade({
      team_name,
      appID: group_id,
      record_id: rollbackRecord.ID
    })
      .then(re => {
        this.handleBackUpgradeLoading(false);
        this.showRollback(false);
        this.showRollbackDetails(re && re.bean);
      })
      .catch(err => {
        this.handleBackUpgradeLoading(false);
        handleAPIError(err);
      });
  };
  handleBackUpgradeLoading = loading => {
    this.setState({
      backUpgradeLoading: loading
    });
  };
  showComponentVersion = info => {
    this.setState({
      isComponent: info
    });
  };

  handleCancelComponent = () => {
    this.setState({
      isComponent: false
    });
  };

  handleCancelLoading = () => {
    this.setState({
      loadingList: false,
      upgradeLoading: false,
      recordLoading: false
    });
  };

  render() {
    const { currentEnterprise, currentTeam, currentRegionName } = this.props;
    const {
      loadingList,
      recordLoading,
      upgradeLoading,
      list,
      showMarketAppDetail,
      showApp,
      activeKey,
      page,
      total,
      pageSize,
      dataList,
      appDetail,
      isComponent,
      loadingDetail,
      lastRecord,
      showLastUpgradeRecord,
      showLastRollbackRecord,
      upgradeItem,
      isDeploymentFailure,
      isPartiallyCompleted,
      showRollbackConfirm,
      rollbackRecords,
      rollbackRecordDetails,
      backUpgradeLoading
    } = this.state;
    const paginationProps = {
      onChange: this.handleTableChange,
      pageSize,
      total,
      page
    };
    const ListContent = ({ data: { upgrade_versions, current_version } }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <Tooltip title="??????????????????????????????????????????????????????????????????????????????????????????????????????????????????">
            <span>????????????</span>
          </Tooltip>
          <p>
            <Tag
              style={{
                height: '17px',
                lineHeight: '16px',
                marginBottom: '3px'
              }}
              color="green"
              size="small"
            >
              {current_version}
            </Tag>
          </p>
        </div>
        <div className={styles.listContentItem}>
          <Tooltip title="???????????????????????????????????????????????????">
            <span>???????????????</span>
          </Tooltip>
          <p>
            {upgrade_versions && upgrade_versions.length > 0
              ? upgrade_versions.map(item => {
                  return (
                    <Tag
                      style={{
                        height: '17px',
                        lineHeight: '16px',
                        marginBottom: '3px'
                      }}
                      color="green"
                      size="small"
                      key={item}
                    >
                      {item}
                    </Tag>
                  );
                })
              : '??????'}
          </p>
        </div>
      </div>
    );

    const columns = [
      {
        title: '????????????',
        dataIndex: 'create_time',
        key: '1',
        width: '20%',
        render: text => (
          <span>
            {moment(text)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss')}
          </span>
        )
      },
      {
        title: '??????????????????',
        dataIndex: 'group_name',
        key: '2',
        width: '20%',
        render: text => <span>{text}</span>
      },
      {
        title: '??????',
        dataIndex: 'version',
        key: '3',
        width: '30%',
        render: (_, data) => this.getVersionChangeShow(data)
      },
      {
        title: '??????',
        dataIndex: 'status',
        key: '4',
        width: '15%',
        render: status => <span>{infoUtil.getStatusText(status)}</span>
      },
      {
        title: '??????',
        dataIndex: 'tenant_id',
        key: '5',
        width: '15%',
        render: (_, item) =>
          item.can_rollback && (
            <div>
              <a
                onClick={e => {
                  e.preventDefault();
                  this.showRollback(item);
                }}
              >
                ??????
              </a>

              <a
                onClick={e => {
                  e.preventDefault();
                  this.showRollbackList(item);
                }}
              >
                ????????????
              </a>
            </div>
          )
      }
    ];
    const helmColumns = [
      {
        title: '????????????',
        dataIndex: 'updated',
        key: '1',
        render: text => (
          <span>
            {moment(text)
              .locale('zh-cn')
              .format('YYYY-MM-DD HH:mm:ss')}
          </span>
        )
      },
      {
        title: '??????',
        dataIndex: 'chart',
        key: '2',
        render: text => <span>{text}</span>
      },
      {
        title: '??????',
        dataIndex: 'app_version',
        key: '3',
        render: text => <span>{text}</span>
      },
      {
        title: '??????',
        dataIndex: 'status',
        key: '4',
        render: status => <span>{infoUtil.getHelmStatus(status)}</span>
      }
    ];
    let breadcrumbList = [];

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
    const isHelm =
      appDetail && appDetail.app_type && appDetail.app_type === 'helm';
    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        loading={loadingDetail}
        title="????????????"
        content="????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
        extraContent={null}
      >
        <div>
          {loadingDetail ? (
            <Spin />
          ) : (
            <Tabs
              activeKey={activeKey}
              onChange={this.handleTabs}
              className={styles.tabss}
            >
              {!isHelm && (
                <TabPane tab="??????????????????" key="1">
                  <div className={styles.cardList}>
                    <List
                      rowKey="id"
                      size="large"
                      loading={loadingList}
                      dataSource={[...dataList]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <a
                              onClick={e => {
                                e.preventDefault();
                                this.fetchAppLastRollbackRecord(item);
                              }}
                            >
                              ??????
                            </a>,
                            <a
                              onClick={() => {
                                this.showComponentVersion(item);
                              }}
                            >
                              ????????????
                            </a>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={
                                  item.pic
                                }
                                shape="square"
                                size="large"
                              />
                            }
                            title={
                              <a
                                onClick={() => {
                                  this.showMarketAppDetail(item);
                                }}
                              >
                                {item.group_name}
                              </a>
                            }
                            description={item.describe}
                          />
                          <ListContent data={item} />
                        </List.Item>
                      )}
                    />
                  </div>
                </TabPane>
              )}
              <TabPane tab="????????????" key="2">
                <Table
                  style={{ padding: '24px' }}
                  loading={recordLoading || upgradeLoading}
                  columns={isHelm ? helmColumns : columns}
                  dataSource={list}
                  pagination={paginationProps}
                />
              </TabPane>
            </Tabs>
          )}
        </div>
        {isComponent && (
          <ComponentVersion
            onCancel={this.handleCancelComponent}
            data={isComponent}
            ok={this.getApplication}
            {...this.getParameter()}
          />
        )}
        {showMarketAppDetail && (
          <MarketAppDetailShow
            onOk={this.hideMarketAppDetail}
            onCancel={this.hideMarketAppDetail}
            app={showApp}
          />
        )}
        {showLastUpgradeRecord && (lastRecord || upgradeItem) && (
          <Modal
            visible
            title="????????????"
            onCancel={() => {
              this.setState({ showLastUpgradeRecord: false });
              if (upgradeItem) {
                this.createNewRecord(upgradeItem);
              }
            }}
            okText="??????"
            cancelText={upgradeItem ? '?????????' : '??????'}
            onOk={() => {
              this.openInfoPage(lastRecord || upgradeItem);
            }}
          >
            <span>
              ????????????
              <span style={{ color: '4d73b1' }}>
                {(lastRecord && lastRecord.group_name) ||
                  (upgradeItem && upgradeItem.group_name)}
              </span>
              {isPartiallyCompleted
                ? '??????????????????????????????????????????????????????????????????'
                : isDeploymentFailure
                ? '??????????????????????????????????????????????????????'
                : '??????????????????????????????????????????????????????????????????'}
            </span>
          </Modal>
        )}
        {showLastRollbackRecord && (
          <Modal
            visible
            title="????????????"
            onCancel={() => {
              this.setState({ showLastRollbackRecord: false });
            }}
            footer={[
              <Button
                style={{ marginTop: '20px' }}
                onClick={() => {
                  this.setState({ showLastRollbackRecord: false });
                }}
              >
                ??????
              </Button>
            ]}
          >
            <span>
              ????????????
              <span style={{ color: '4d73b1' }}>
                {lastRecord && lastRecord.group_name}
              </span>
              ???????????????????????????????????????????????????
            </span>
          </Modal>
        )}
        {rollbackRecords && (
          <RollsBackRecordList
            {...this.getParameter()}
            info={rollbackRecords}
            showRollbackDetails={item => {
              this.showRollbackDetails(item);
            }}
            onCancel={() => {
              this.showRollbackList(false);
            }}
          />
        )}
        {rollbackRecordDetails && (
          <RollsBackRecordDetails
            {...this.getParameter()}
            info={rollbackRecordDetails}
            onCancel={() => {
              this.showRollbackDetails(false);
            }}
          />
        )}

        {showRollbackConfirm && (
          <Modal
            visible
            confirmLoading={backUpgradeLoading}
            title="????????????"
            onCancel={() => {
              this.showRollback(false);
            }}
            onOk={() => {
              this.rollbackUpgrade();
            }}
          >
            <span style={{ color: 'red' }}>?????????????????????</span>
            <span style={{ display: 'block', marginTop: '16px' }}>
              ???????????????????????????????????????
            </span>
          </Modal>
        )}
      </PageHeaderLayout>
    );
  }
}
