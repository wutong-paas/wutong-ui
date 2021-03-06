/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable react/sort-comp */
/* eslint-disable no-underscore-dangle */
import NewbieGuiding from '@/components/NewbieGuiding';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Icon,
  InputNumber,
  Modal,
  notification,
  Row,
  Table,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import EditClusterInfo from '../../components/Cluster/EditClusterInfo';
import ConfirmModal from '../../components/ConfirmModal';
import InstallStep from '../../components/Introduced/InstallStep';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import globalUtil from '../../utils/global';
import wutongUtil from '../../utils/wutong';
import userUtil from '../../utils/user';

const { confirm } = Modal;

@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  clusterLoading: loading.effects['region/fetchEnterpriseClusters'],
  wutongInfo: global.wutongInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  delclusterLongin: loading.effects['region/deleteEnterpriseCluster'],
  overviewInfo: index.overviewInfo,
  novices: global.novices
}))
@Form.create()
export default class EnterpriseClusters extends PureComponent {
  constructor(props) {
    super(props);
    const { user, wutongInfo, novices, enterprise } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      isNewbieGuide: wutongUtil.isEnableNewbieGuide(enterprise),
      adminer,
      clusters: [],
      editClusterShow: false,
      regionInfo: false,
      text: '',
      delVisible: false,
      showTenantList: false,
      loadTenants: false,
      tenantTotal: 0,
      tenants: [],
      tenantPage: 1,
      tenantPageSize: 5,
      showTenantListRegion: '',
      showClusterIntroduced: wutongUtil.handleNewbie(
        novices,
        'successInstallClusters'
      ),
      setTenantLimitShow: false,
      guideStep: 1,
      isEnterpriseEdition: wutongUtil.isEnterpriseEdition(wutongInfo)
    };
  }
  UNSAFE_componentWillMount() {
    const { adminer } = this.state;
    const { dispatch } = this.props;
    if (!adminer) {
      dispatch(routerRedux.push(`/`));
    }
  }
  componentDidMount() {
    this.loadClusters();
  }
  handleMandatoryDelete = () => {
    const th = this;
    confirm({
      title: '???????????????????????????????????????????????????',
      content: '?????????????????????????????????ID????????????????????????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk() {
        th.handleDelete(true);
        return new Promise((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(err => console.log(err));
      }
    });
  };
  handleDelete = (force = false) => {
    const { regionInfo } = this.state;
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'region/deleteEnterpriseCluster',
      payload: {
        region_id: regionInfo.region_id,
        enterprise_id: eid,
        force
      },
      callback: res => {
        if (res && res._condition === 200) {
          this.loadClusters();
          notification.success({ message: '????????????' });
        }
        this.cancelClusters();
      },
      handleError: res => {
        if (res && res.data && res.data.code === 10050) {
          this.setState({
            delVisible: false
          });
          this.handleMandatoryDelete();
        }
      }
    });
  };

  loadClusters = name => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'region/fetchEnterpriseClusters',
      payload: {
        enterprise_id: eid,
        name
      },
      callback: res => {
        if (res && res.list) {
          const clusters = [];
          res.list.map((item, index) => {
            item.key = `cluster${index}`;
            clusters.push(item);
            return item;
          });
          this.setState({ clusters });
          // globalUtil.putClusterInfoLog(eid, res.list);
        }
      }
    });
  };

  cancelEditClusters = () => {
    this.loadClusters();
    this.setState({
      editClusterShow: false,
      text: '',
      regionInfo: false
    });
  };

  handleEdit = item => {
    this.loadPutCluster(item.region_id);
  };

  delUser = regionInfo => {
    this.setState({
      delVisible: true,
      regionInfo
    });
  };
  cancelClusters = () => {
    this.setState({
      delVisible: false,
      regionInfo: false
    });
  };

  handlUnit = num => {
    // if (num) {
    //   return (num / 1024).toFixed(2) / 1;
    // }
    return num;
  };

  loadPutCluster = regionID => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'region/fetchEnterpriseCluster',
      payload: {
        enterprise_id: eid,
        region_id: regionID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            regionInfo: res.bean,
            editClusterShow: true,
            text: '????????????'
          });
        }
      }
    });
  };

  showRegions = item => {
    this.setState(
      {
        showTenantList: true,
        regionAlias: item.region_alias,
        regionName: item.region_name,
        showTenantListRegion: item.region_id,
        loadTenants: true
      },
      this.loadRegionTenants
    );
  };

  loadRegionTenants = () => {
    const { tenantPage, tenantPageSize, showTenantListRegion } = this.state;
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'region/fetchEnterpriseClusterTenants',
      payload: {
        enterprise_id: eid,
        page: tenantPage,
        pageSize: tenantPageSize,
        region_id: showTenantListRegion
      },
      callback: data => {
        if (data && data.bean) {
          this.setState({
            tenants: data.bean.tenants,
            tenantTotal: data.bean.total,
            loadTenants: false
          });
        } else {
          this.setState({ loadTenants: false });
        }
      },
      handleError: () => {
        this.setState({ loadTenants: false });
      }
    });
  };

  setTenantLimit = item => {
    this.setState({
      setTenantLimitShow: true,
      limitTenantName: item.tenant_name,
      limitTeamName: item.team_name,
      initLimitValue: item.set_limit_memory
    });
  };

  submitLimit = e => {
    e.preventDefault();
    const {
      match: {
        params: { eid }
      },
      form
    } = this.props;
    const { limitTenantName, showTenantListRegion } = this.state;
    form.validateFields(
      {
        force: true
      },
      (err, values) => {
        if (!err) {
          this.setState({ limitSummitLoading: true });
          this.props.dispatch({
            type: 'region/setEnterpriseTenantLimit',
            payload: {
              enterprise_id: eid,
              region_id: showTenantListRegion,
              tenant_name: limitTenantName,
              limit_memory: values.limit_memory
            },
            callback: () => {
              notification.success({
                message: '????????????'
              });
              this.setState({
                limitSummitLoading: false,
                setTenantLimitShow: false
              });
              this.loadRegionTenants();
            },
            handleError: () => {
              notification.warning({
                message: '?????????????????????????????????'
              });
              this.setState({ limitSummitLoading: false });
            }
          });
        }
      }
    );
  };

  hideTenantListShow = () => {
    this.setState({
      showTenantList: false,
      showTenantListRegion: '',
      tenants: []
    });
  };
  handleTenantPageChange = page => {
    this.setState({ tenantPage: page }, this.loadRegionTenants);
  };
  handleNewbieGuiding = info => {
    const { nextStep } = info;
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    return (
      <NewbieGuiding
        {...info}
        totals={14}
        handleClose={() => {
          this.handleGuideStep('close');
        }}
        handleNext={() => {
          if (nextStep) {
            this.handleGuideStep(nextStep);
            dispatch(routerRedux.push(`/enterprise/${eid}/addCluster`));
          }
        }}
      />
    );
  };
  handleGuideStep = guideStep => {
    this.setState({
      guideStep
    });
  };
  handleJoinTeams = teamName => {
    const { regionName } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'teamControl/joinTeam',
      payload: {
        team_name: teamName
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.onJumpTeam(teamName, regionName);
        }
      }
    });
  };
  onJumpTeam = (team_name, region) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/team/${team_name}/region/${region}/index`));
  };
  handleClusterIntroduced = () => {
    this.putNewbieGuideConfig('successInstallClusters');
    this.setState({
      showClusterIntroduced: false
    });
  };
  putNewbieGuideConfig = configName => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/putNewbieGuideConfig',
      payload: {
        arr: [{ key: configName, value: true }]
      }
    });
  };

  // ????????????????????????
  onStartInstall = type => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    this.handleClusterIntroduced();
    // ???????????????????????????
    if (type == 1) {
      dispatch(routerRedux.push(`/enterprise/${eid}/shared/local?init=true`));
    } else {
      // ???????????????
      this.fetchMyTeams();
    }
  };

  // ??????????????????
  onViewInstance = () => {
    this.fetchMyTeams(true);
  };

  fetchMyTeams = (isNext = false) => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { clusters } = this.state;
    dispatch({
      type: 'global/fetchMyTeams',
      payload: {
        enterprise_id: eid,
        page: 1,
        page_size: 1
      },
      callback: res => {
        if (res && res.status_code === 200) {
          if (res && res.list.length > 0) {
            const teamName = res.list[0].team_name;
            if (isNext && teamName) {
              this.fetchApps(teamName, true);
            } else if (teamName) {
              dispatch(
                routerRedux.push(
                  `/team/${teamName}/region/${clusters[0].region_name}/create/code`
                )
              );
            }
          } else {
            return notification.warn({
              message: '?????????????????????'
            });
          }
        }
      }
    });
  };

  fetchApps = (teamName = '', isNext = false) => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { clusters } = this.state;
    dispatch({
      type: 'global/fetchEnterpriseApps',
      payload: {
        enterprise_id: eid,
        page: 1,
        page_size: 1
      },
      callback: res => {
        if (res && res.status_code === 200) {
          if (res && res.list.length > 0) {
            const groupId = res.list[0].ID;
            if (isNext && groupId && teamName) {
              dispatch(
                routerRedux.push(
                  `/team/${teamName}/region/${clusters[0].region_name}/apps/${groupId}`
                )
              );
            }
          } else {
            return notification.warn({
              message: '?????????????????????'
            });
          }
        }
      }
    });
  };
  render() {
    const {
      delclusterLongin,
      match: {
        params: { eid }
      },
      clusterLoading,
      form
    } = this.props;
    const {
      clusters,
      text,
      regionInfo,
      delVisible,
      showTenantList,
      tenants,
      loadTenants,
      regionAlias,
      tenantTotal,
      tenantPage,
      tenantPageSize,
      setTenantLimitShow,
      limitTeamName,
      limitSummitLoading,
      initLimitValue,
      guideStep,
      isNewbieGuide,
      showClusterIntroduced
    } = this.state;
    const { getFieldDecorator } = form;
    const pagination = {
      onChange: this.handleTenantPageChange,
      total: tenantTotal,
      pageSize: tenantPageSize,
      current: tenantPage
    };

    const colorbj = (color, bg) => {
      return {
        width: '100px',
        color,
        background: bg,
        borderRadius: '15px',
        padding: '2px 0'
      };
    };
    const columns = [
      {
        title: '??????',
        dataIndex: 'region_alias',
        align: 'center',
        render: (val, row) => {
          return val;
          // return (
          //   <Link to={`/enterprise/${eid}/clusters/${row.region_id}/dashboard`}>
          //     {val}
          //   </Link>
          //   // <span>{val}</span>
          // );
        }
      },
      {
        title: '??????',
        dataIndex: 'region_type',
        align: 'center',
        width: 100,
        render: val => {
          return (
            <span>
              {val && val instanceof Array && val.length > 0
                ? val.map(item => {
                    if (item === 'development') {
                      return (
                        <span style={{ marginRight: '8px' }} key={item}>
                          ????????????
                        </span>
                      );
                    }
                    if (item === 'ack-manage') {
                      return (
                        <span style={{ marginRight: '8px' }} key={item}>
                          ?????????-????????????
                        </span>
                      );
                    }
                    if (item === 'custom') {
                      return (
                        <span style={{ marginRight: '8px' }} key={item}>
                          ????????????
                        </span>
                      );
                    }
                    return item;
                  })
                : '????????????'}
            </span>
          );
        }
      },
      {
        title: '????????????',
        dataIndex: 'provider',
        align: 'center',
        width: 150,
        render: item => {
          switch (item) {
            case 'ack':
              return (
                <span style={{ marginRight: '8px' }} key={item}>
                  ACK
                </span>
              );
            case 'custom':
              return (
                <span style={{ marginRight: '8px' }} key={item}>
                  ??????Kubernetes
                </span>
              );
            case 'rke':
              return (
                <Tooltip title="??????????????????">
                  <span style={{ marginRight: '8px' }} key={item}>
                    ??????????????????
                  </span>
                </Tooltip>
              );
            case 'tke':
              return (
                <span style={{ marginRight: '8px' }} key={item}>
                  TKE
                </span>
              );
            default:
              return (
                <span style={{ marginRight: '8px' }} key={item}>
                  ????????????
                </span>
              );
          }
        }
      },
      {
        title: '??????(GB)',
        dataIndex: 'total_memory',
        align: 'center',
        width: 200,
        render: (_, item) => {
          return (
            <a
              onClick={() => {
                this.showRegions(item);
              }}
            >
              {this.handlUnit(item.used_memory)}/
              {this.handlUnit(item.total_memory)}
            </a>
          );
        }
      },
      {
        title: '??????',
        dataIndex: 'rbd_version',
        align: 'center',
        width: 350
      },
      {
        title: '??????',
        dataIndex: 'status',
        align: 'center',
        width: 150,
        render: (val, data) => {
          if (data.health_status === 'failure') {
            return <span style={{ color: 'red' }}>????????????</span>;
          }
          switch (val) {
            case '0':
              return (
                <div style={colorbj('#1890ff', '#e6f7ff')}>
                  <Badge color="#1890ff" />
                  ?????????
                </div>
              );
            case '1':
              return (
                <div style={colorbj('#52c41a', '#e9f8e2')}>
                  <Badge color="#52c41a" />
                  ?????????
                </div>
              );
            case '2':
              return (
                <div style={colorbj('#b7b7b7', '#f5f5f5')}>
                  <Badge color="#b7b7b7" />
                  ?????????
                </div>
              );

            case '3':
              return (
                <div style={colorbj('#1890ff', '#e6f7ff')}>
                  <Badge color="#1890ff" />
                  ?????????
                </div>
              );
            case '5':
              return (
                <div style={colorbj('#fff', '#f54545')}>
                  <Badge color="#fff" />
                  ??????
                </div>
              );
            default:
              return (
                <div style={colorbj('#fff', '#ffac38')}>
                  <Badge color="#fff" />
                  ??????
                </div>
              );
          }
        }
      },
      {
        title: '??????',
        dataIndex: 'method',
        align: 'center',
        width: 280,
        render: (_, item) => {
          const mlist = [
            <a
              onClick={() => {
                this.delUser(item);
              }}
            >
              ??????
            </a>,
            <a
              onClick={() => {
                this.handleEdit(item);
              }}
            >
              ??????
            </a>,
            <a
              onClick={() => {
                this.showRegions(item);
              }}
            >
              ????????????
            </a>
            /*,
            <Link
            to={`/enterprise/${eid}/ClusterDashboard/${item.enterprise_id}/${item.region_name}`}
          >
            ??????
          </Link>*/
          ];
          if (item.provider === 'rke') {
            mlist.push(
              <Link
                to={`/enterprise/${eid}/provider/rke/kclusters?clusterID=${item.provider_cluster_id}&updateKubernetes=true`}
              >
                ????????????
              </Link>
            );
          }
          return mlist;
        }
      }
    ];

    const tenantColumns = [
      {
        title: '????????????',
        dataIndex: 'team_name',
        align: 'center',
        render: (_, item) => {
          return (
            <a
              onClick={() => {
                this.handleJoinTeams(item.tenant_name);
              }}
            >
              {item.team_name}
            </a>
          );
        }
      },
      {
        title: '???????????????(MB)',
        dataIndex: 'memory_request',
        align: 'center'
      },
      {
        title: 'CPU?????????',
        dataIndex: 'cpu_request',
        align: 'center'
      },
      {
        title: '????????????(MB)',
        dataIndex: 'set_limit_memory',
        align: 'center'
      },
      {
        title: '???????????????',
        dataIndex: 'running_app_num',
        align: 'center'
      },
      {
        title: '??????',
        dataIndex: 'method',
        align: 'center',
        width: '100px',
        render: (_, item) => {
          return [
            <a
              onClick={() => {
                this.setTenantLimit(item);
              }}
            >
              ????????????
            </a>
          ];
        }
      }
    ];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 12 }
      }
    };
    return (
      <PageHeaderLayout
        title="????????????"
        content="??????????????????????????????Kubernetes??????????????????????????????Region???????????????????????????????????????"
      >
        {isNewbieGuide &&
        showClusterIntroduced &&
        !clusterLoading &&
        clusters &&
        clusters.length &&
        clusters[0].status === '1'
          ? /*<InstallStep
            onCancel={this.handleClusterIntroduced}
            isCluster
            eid={eid}
            onStartInstall={this.onStartInstall}
            onViewInstance={this.onViewInstance}
          />*/
            ''
          : ''}
        <Row style={{ marginBottom: '20px' }}>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Link to={`/enterprise/${eid}/addCluster`}>
              <Button type="primary" style={{ background: '#2953E8' }}>
                ????????????
              </Button>
            </Link>
            <Button
              style={{ marginLeft: '16px' }}
              onClick={() => {
                this.loadClusters();
              }}
            >
              <Icon type="reload" />
            </Button>
            {/*            {guideStep === 1 &&
              this.props.novices &&
              wutongUtil.handleNewbie(this.props.novices, 'addCluster') &&
              this.handleNewbieGuiding({
                tit: '???????????????',
                desc: '??????????????????????????????????????????????????????????????????????????????',
                nextStep: 2,
                configName: 'addCluster',
                isSuccess: false,
                conPosition: { right: 0, bottom: '-180px' },
                svgPosition: { right: '50px', marginTop: '-11px' }
              })}*/}
          </Col>
        </Row>
        <Card>
          {delVisible && (
            <ConfirmModal
              loading={delclusterLongin}
              title="????????????"
              subDesc="?????????????????????"
              desc="??????????????????????????????"
              onOk={() => this.handleDelete(false)}
              onCancel={this.cancelClusters}
            />
          )}

          {this.state.editClusterShow && (
            <EditClusterInfo
              regionInfo={regionInfo}
              title={text}
              eid={eid}
              onOk={this.cancelEditClusters}
              onCancel={this.cancelEditClusters}
            />
          )}
          <Alert
            style={{ marginBottom: '16px' }}
            message="??????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
          />
          <Table
            scroll={{ x: window.innerWidth > 1500 ? false : 1500 }}
            loading={clusterLoading}
            dataSource={clusters}
            columns={columns}
          />
        </Card>
        {showTenantList && (
          <Modal
            maskClosable={false}
            title="????????????????????????"
            width={800}
            visible={showTenantList}
            footer={null}
            onOk={this.hideTenantListShow}
            onCancel={this.hideTenantListShow}
          >
            {setTenantLimitShow && (
              <div>
                <Alert
                  style={{ marginBottom: '16px' }}
                  message={`???????????? ${limitTeamName} ??? ${regionAlias} ?????????????????????`}
                />
                <Form onSubmit={this.submitLimit}>
                  <Form.Item
                    {...formItemLayout}
                    name="limit_memory"
                    label="????????????(MB)"
                  >
                    {getFieldDecorator('limit_memory', {
                      initialValue: initLimitValue,
                      rules: [
                        {
                          required: true,
                          message: '?????????????????????'
                        }
                      ]
                    })(
                      <InputNumber
                        style={{ width: '200px' }}
                        min={0}
                        precision={0}
                        max={2147483647}
                      />
                    )}
                  </Form.Item>
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      onClick={() => {
                        this.setState({
                          setTenantLimitShow: false,
                          limitSummitLoading: false
                        });
                      }}
                    >
                      ??????
                    </Button>
                    <Button
                      style={{ marginLeft: '16px' }}
                      type="primary"
                      loading={limitSummitLoading}
                      htmlType="submit"
                    >
                      ??????
                    </Button>
                  </div>
                </Form>
              </div>
            )}
            {!setTenantLimitShow && (
              <div>
                <Alert
                  style={{ marginBottom: '16px' }}
                  message="CPU ????????? 1000 ???????????????1??? CPU"
                />
                <Table
                  pagination={pagination}
                  dataSource={tenants}
                  columns={tenantColumns}
                  loading={loadTenants}
                />
              </div>
            )}
          </Modal>
        )}
      </PageHeaderLayout>
    );
  }
}
