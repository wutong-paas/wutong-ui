/* eslint-disable camelcase */
import { Button, Card, Col, Form, Icon, Notification, Row, Table } from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import React, { Fragment, PureComponent } from 'react';
import AddOrEditConfig from '../../components/AddOrEditConfig';
import BuildPluginVersion from '../../components/buildPluginVersion';
import ConfirmModal from '../../components/ConfirmModal';
import CreatePluginForm from '../../components/CreatePluginForm';
import ScrollerX from '../../components/ScrollerX';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { createEnterprise, createTeam } from '../../utils/breadcrumb';
import globalUtil from '../../utils/global';
import pluginUtil from '../../utils/plugin';
import styles from './Index.less';

const ButtonGroup = Button.Group;

@Form.create()
@connect(({ teamControl, enterprise, loading }) => ({
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
  addConfigLoading: loading.effects['plugin/addPluginVersionConfig'],
  editConfigLoading: loading.effects['plugin/editPluginVersionConfig'],
  removeConfigLoading: loading.effects['plugin/removePluginVersionConfig']
}))
export default class Index extends PureComponent {
  constructor(arg) {
    super(arg);
    this.state = {
      currInfo: null,
      currVersion: '',
      config: [],
      showAddConfig: false,
      showEditConfig: null,
      showDeleteVersion: false,
      showBuildLog: false,
      configVisible: false,
      event_id: '',
      apps: [],
      page: 1,
      page_size: 6,
      total: 0
    };
    this.mount = false;
  }
  componentDidMount() {
    this.mount = true;
    this.getVersions();
    this.getUsedApp();
    this.getShareRecord();
  }

  componentWillUnmount() {
    this.mount = false;
  }
  onPageChange = page => {
    this.setState({ page }, () => {
      this.getUsedApp();
    });
  };
  getShareRecord = () => {
    this.props.dispatch({
      type: 'plugin/getShareRecord',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId()
      }
    });
  };
  getUsedApp = () => {
    this.props.dispatch({
      type: 'plugin/getUsedApp',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        page: this.state.page,
        page_size: this.state.page_size
      },
      callback: data => {
        if (data) {
          this.setState({
            apps: data.list || [],
            total: data.total
          });
        }
      }
    });
  };
  getVersions = () => {
    this.props.dispatch({
      type: 'plugin/getPluginVersions',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId()
      },
      callback: data => {
        if (data) {
          if (!this.state.currVersion && data.list.length) {
            this.setState(
              {
                currVersion: data.list[0].build_version
              },
              () => {
                this.getPluginVersionInfo();
                this.getPluginVersionConfig();
              }
            );
          }
        }
      }
    });
  };
  getPluginVersionInfo = () => {
    if (!this.mount) return;
    this.props.dispatch({
      type: 'plugin/getPluginVersionInfo',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion
      },
      callback: data => {
        if (data) {
          this.setState({ currInfo: data.bean });
          setTimeout(() => {
            this.getPluginVersionInfo();
          }, 5000);
        }
      }
    });
  };
  getPluginVersionConfig = () => {
    this.props.dispatch({
      type: 'plugin/getPluginVersionConfig',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion
      },
      callback: data => {
        if (data) {
          this.setState({ config: data.list });
        }
      }
    });
  };

  getId = () => {
    return this.props.match.params.pluginId;
  };
  handleSubmit = val => {
    this.props.dispatch({
      type: 'plugin/createPlugin',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        ...val
      }
    });
  };
  handleVersionChange = val => {
    const { key } = val;
    if (key === this.state.currVersion) return;
    this.setState(
      {
        currVersion: key
      },
      () => {
        this.getPluginVersionInfo();
        this.getPluginVersionConfig();
      }
    );
  };
  showAddConfig = () => {
    this.setState({ showAddConfig: true });
  };
  hiddenAddConfig = () => {
    this.setState({ showAddConfig: false });
  };
  handleOpenDelConfigVisible = data => {
    this.setState({ configVisible: data });
  };

  handleCloseDelConfigVisible = () => {
    this.setState({ configVisible: false });
  };

  hanldeEditSubmit = values => {
    this.props.dispatch({
      type: 'plugin/editPluginVersionInfo',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion,
        ...values
      },
      callback: () => {
        Notification.success({ message: '????????????' });
      }
    });
  };
  handleDelConfig = () => {
    const { configVisible } = this.state;
    this.props.dispatch({
      type: 'plugin/removePluginVersionConfig',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion,
        config_group_id: configVisible.ID
      },
      callback: () => {
        Notification.success({ message: '????????????' });
        this.getPluginVersionConfig();
        this.handleCloseDelConfigVisible();
      }
    });
  };
  handleAddConfig = values => {
    this.props.dispatch({
      type: 'plugin/addPluginVersionConfig',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion,
        entry: values
      },
      callback: () => {
        this.hiddenAddConfig();
        this.getPluginVersionConfig();
      }
    });
  };
  handleEditConfig = values => {
    const { showEditConfig, currVersion } = this.state;
    this.props.dispatch({
      type: 'plugin/editPluginVersionConfig',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: currVersion,
        entry: {
          ...showEditConfig,
          ...values
        }
      },
      callback: () => {
        this.hideEditConfig();
        this.getPluginVersionConfig();
      }
    });
  };
  showEditConfig = config => {
    this.setState({ showEditConfig: config });
  };
  hideEditConfig = () => {
    this.setState({ showEditConfig: null });
  };
  showDeleteVersion = () => {
    this.setState({ showDeleteVersion: true });
  };
  cancelDeleteVersion = () => {
    this.setState({ showDeleteVersion: false });
  };
  handleDeleteVersion = () => {
    this.props.dispatch({
      type: 'plugin/removePluginVersion',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion
      },
      callback: () => {
        this.cancelDeleteVersion();
        this.state.currVersion = '';
        this.getVersions();
      }
    });
  };
  handleCreatePluginVersion = () => {
    this.props.dispatch({
      type: 'plugin/createPluginVersion',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId()
      },
      callback: () => {
        Notification.success({ message: '????????????' });
        this.state.currVersion = '';
        this.getVersions();
      }
    });
  };
  handleBuildPluginVersion = () => {
    this.props.dispatch({
      type: 'plugin/buildPluginVersion',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId(),
        build_version: this.state.currVersion
      },
      callback: data => {
        if (data) {
          this.setState(
            {
              currVersion: '',
              event_id: data.bean.event_id,
              showBuildLog: true
            },
            () => {
              this.getVersions();
            }
          );
        }
      }
    });
  };
  showBuildLog = () => {
    this.setState({ showBuildLog: true });
  };
  hideBuildLog = () => {
    this.setState({ showBuildLog: false });
  };
  canEditInfoAndConfig = () => {
    return (
      !pluginUtil.isMarketPlugin(this.state.currInfo) &&
      pluginUtil.canEditInfoAndConfig(this.state.currInfo)
    );
  };

  sharePlugin = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'plugin/sharePlugin',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        plugin_id: this.getId()
      },
      callback: data => {
        if (data.bean.step === 1) {
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/shareplugin/step-one/${this.getId()}/${
                data.bean.ID
              }`
            )
          );
        }
        if (data.bean.step === 2) {
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/shareplugin/step-two/${this.getId()}/${
                data.bean.ID
              }`
            )
          );
        }
      }
    });
  };
  render() {
    const {
      currentEnterprise,
      currentTeam,
      currentRegionName,
      removeConfigLoading,
      addConfigLoading,
      editConfigLoading,
      operationPermissions: { isCreate, isEdit, isDelete }
    } = this.props;
    const {
      config,
      currInfo,
      configVisible,
      showAddConfig,
      showEditConfig,
      showDeleteVersion,
      showBuildLog,
      currVersion,
      event_id,
      apps,
      page,
      page_size,
      total
    } = this.state;
    if (!currInfo) return null;
    const action = (
      <div>
        <ButtonGroup>
          {isCreate && (
            <Button type="primary" onClick={this.handleBuildPluginVersion}>
              ??????
            </Button>
          )}
          {currInfo.build_status !== 'unbuild' && (
            <Button type="default" onClick={this.showBuildLog}>
              ??????????????????
            </Button>
          )}
        </ButtonGroup>
      </div>
    );

    const extra = (
      <Row
        style={{
          float: 'right',
          width: 300
        }}
      >
        <Col xs={24} sm={12}>
          <div className={styles.textSecondary} />
          <div className={styles.heading} />
        </Col>
        <Col xs={24} sm={12}>
          <div className={styles.textSecondary}>????????????</div>
          <div className={styles.heading}>
            {pluginUtil.getBuildStatusCN(currInfo.build_status)}
          </div>
        </Col>
      </Row>
    );
    let breadcrumbList = [];
    breadcrumbList = createTeam(
      createEnterprise(breadcrumbList, currentEnterprise),
      currentTeam,
      currentRegionName
    );
    breadcrumbList.push({
      title: '????????????',
      href: `/team/${currentTeam.team_name}/region/${currentRegionName}/myplugns`
    });
    breadcrumbList.push({ title: currInfo.plugin_alias });
    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        title={currInfo.plugin_alias}
        content={currInfo.desc}
        extraContent={extra}
        action={action}
      >
        <Card
          style={{
            marginBottom: 16
          }}
          title="??????????????????"
        >
          <div
            style={{
              maxWidth: 500,
              margin: '0 auto'
            }}
          >
            <CreatePluginForm
              allDisabled={false}
              Modifys
              isEdit={isEdit}
              onSubmit={this.hanldeEditSubmit}
              data={currInfo}
              submitText="????????????"
            />
          </div>
        </Card>

        <Card
          style={{
            marginBottom: 16
          }}
          title="???????????????"
        >
          <ScrollerX sm={700}>
            <Table
              columns={[
                {
                  title: '????????????',
                  dataIndex: 'config_name'
                },
                {
                  title: '?????????????????????',
                  dataIndex: 'service_meta_type',
                  render: v => {
                    return pluginUtil.getMetaTypeCN(v);
                  }
                },
                {
                  title: '????????????',
                  dataIndex: 'injection',
                  render: v => {
                    return pluginUtil.getInjectionCN(v);
                  }
                },
                {
                  title: '?????????',
                  dataIndex: 'options',
                  width: '40%',
                  render: v => {
                    return (v || []).map(item => {
                      return (
                        <p className={styles.configGroup}>
                          <span>?????????: {item.attr_name}</span>
                          <span>????????????: {item.attr_type}</span>
                          {item.attr_type !== 'string' ? (
                            <span>?????????: {item.attr_alt_value}</span>
                          ) : null}
                          <span>
                            ????????????: {item.is_change ? '?????????' : '????????????'}
                          </span>
                          <span>????????????: {item.attr_info}</span>
                        </p>
                      );
                    });
                  }
                },
                {
                  title: '??????',
                  dataIndex: 'action',
                  render: (_v, data) => {
                    return (
                      <Fragment>
                        {isEdit && (
                          <a
                            onClick={() => {
                              this.showEditConfig(data);
                            }}
                            style={{
                              marginRight: 8
                            }}
                          >
                            ??????
                          </a>
                        )}
                        {isDelete && (
                          <a
                            onClick={() => {
                              this.handleOpenDelConfigVisible(data);
                            }}
                          >
                            ??????
                          </a>
                        )}
                      </Fragment>
                    );
                  }
                }
              ]}
              dataSource={config}
              pagination={false}
            />
          </ScrollerX>
          <div
            style={{
              textAlign: 'right',
              paddingTop: 24
            }}
          >
            <Button onClick={this.showAddConfig}>
              <Icon type="plus" />
              ????????????
            </Button>
          </div>
        </Card>

        <Card title="??????????????????????????????">
          <Table
            columns={[
              {
                title: '????????????',
                dataIndex: 'service_cname',
                render: (v, data) => {
                  return (
                    <Link
                      to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/components/${
                        data.service_alias
                      }/overview/service_id/${data.service_id}`}
                    >
                      {v}
                    </Link>
                  );
                }
              },
              {
                title: '????????????',
                dataIndex: 'build_version'
              },
              {
                title: '??????',
                dataIndex: 'action',
                render: (v, data) => {
                  return (
                    <Link
                      to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/components/${
                        data.service_alias
                      }/plugin/service_id/${data.service_id}`}
                    >
                      ?????????????????????
                    </Link>
                  );
                }
              }
            ]}
            dataSource={apps}
            pagination={{
              current: page,
              pageSize: page_size,
              total,
              onChange: this.onPageChange
            }}
          />
        </Card>
        {configVisible && (
          <ConfirmModal
            title="???????????????"
            subDesc="?????????????????????"
            desc="??????????????????????????????"
            loading={removeConfigLoading}
            onOk={this.handleDelConfig}
            onCancel={this.handleCloseDelConfigVisible}
          />
        )}
        {showAddConfig && (
          <AddOrEditConfig
            loading={addConfigLoading}
            onCancel={this.hiddenAddConfig}
            onSubmit={this.handleAddConfig}
          />
        )}
        {showEditConfig && (
          <AddOrEditConfig
            title="???????????????"
            loading={editConfigLoading}
            data={showEditConfig}
            onCancel={this.hideEditConfig}
            onSubmit={this.handleEditConfig}
          />
        )}
        {showDeleteVersion && (
          <ConfirmModal
            onOk={this.handleDeleteVersion}
            onCancel={this.cancelDeleteVersion}
            title="????????????"
            desc="?????????????????????????????????"
            subDesc="?????????????????????"
          />
        )}
        {showBuildLog && currVersion && (
          <BuildPluginVersion
            onCancel={this.hideBuildLog}
            event_id={event_id}
            plugin_id={this.getId()}
            build_version={currVersion}
          />
        )}
      </PageHeaderLayout>
    );
  }
}
