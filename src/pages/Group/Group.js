/* eslint-disable no-unused-expressions */
import EditGroupName from '@/components/AddOrEditGroup';
import AppDirector from '@/components/AppDirector';
import ApplicationGovernance from '@/components/ApplicationGovernance';
import NewbieGuiding from '@/components/NewbieGuiding';
import {
  Button,
  Col,
  Divider,
  Icon,
  Modal,
  notification,
  Row,
  Radio,
  Spin,
  Tooltip,
  Card,
  Switch
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import AppState from '../../components/ApplicationState';
import ConfirmModal from '../../components/ConfirmModal';
import RapidCopy from '../../components/RapidCopy';
import VisterBtn from '../../components/visitBtnForAlllink';
import { batchOperation } from '../../services/app';
import cookie from '../../utils/cookie';
import globalUtil from '../../utils/global';
import wutongUtil from '../../utils/wutong';
import sourceUtil from '../../utils/source-unit';
import AddServiceComponent from './AddServiceComponent';
import AddThirdParty from './AddThirdParty';
import AppShape from './AppShape';
import ComponentList from './ComponentList';
import EditorTopology from './EditorTopology';
import Monitor from './Monitor';
import TwOverViewList from '@/components/TwComponents/TwOverViewList';
import styles from './Index.less';
import GobackImg from '../../../public/images/common/goback.svg';
import AppImg from '../../../public/images/common/app.svg';
import EditImg from '../../../public/images/common/edit.svg';
import SwitchImg from '../../../public/images/team/switch.svg';

const appState = {
  RUNNING: '运行中',
  STARTING: '启动中',
  CLOSED: '已关闭',
  STOPPING: '关闭中',
  ABNORMAL: '异常',
  PARTIAL_ABNORMAL: '部分异常',
  'not-configured': '未配置',
  unknown: '未知',
  deployed: '已部署',
  superseded: '可升级',
  failed: '失败',
  uninstalled: '已卸载',
  uninstalling: '卸载中',
  'pending-install': '安装中',
  'pending-upgrade': '升级中',
  'pending-rollback': '回滚中'
};
const appStateColor = {
  RUNNING: 'rgba(8, 199, 127, 0.8000)',
  STARTING: 'rgba(36, 103, 246, 0.8000)',
  CLOSED: 'rgba(253, 106, 106, 0.8000)',
  STOPPING: 'rgba(253, 106, 106, 0.8000)',
  ABNORMAL: 'rgba(253, 106, 106, 0.8000)',
  PARTIAL_ABNORMAL: 'rgba(253, 106, 106, 0.8000)',
  unknown: 'rgba(253, 106, 106, 0.8000)',
  deployed: 'rgba(8, 199, 127, 0.8000)',
  superseded: 'rgba(8, 199, 127, 0.8000)',
  failed: 'rgba(253, 106, 106, 0.8000)',
  'pending-install': 'rgba(8, 199, 127, 0.8000)',
  'pending-upgrade': 'rgba(8, 199, 127, 0.8000)',
  'pending-rollback': 'rgba(8, 199, 127, 0.8000)',
  default: 'rgba(133, 137, 150, 0.8000)'
};
const appStateColorShadow = {
  RUNNING: 'rgba(8, 199, 127, 0.65000)',
  STARTING: 'rgba(36, 103, 246, 0.65000)',
  CLOSED: 'rgba(253, 106, 106, 0.65000)',
  STOPPING: 'rgba(253, 106, 106, 0.65000)',
  ABNORMAL: 'rgba(253, 106, 106, 0.65000)',
  PARTIAL_ABNORMAL: 'rgba(253, 106, 106, 0.65000)',
  unknown: 'rgba(253, 106, 106, 0.65000)',
  deployed: 'rgba(8, 199, 127, 0.65000)',
  superseded: 'rgba(8, 199, 127, 0.65000)',
  failed: 'rgba(253, 106, 106, 0.8000)',
  'pending-install': 'rgba(8, 199, 127, 0.65000)',
  'pending-upgrade': 'rgba(8, 199, 127, 0.65000)',
  'pending-rollback': 'rgba(8, 199, 127, 0.65000)',
  default: 'rgba(133, 137, 150, 0.65000)'
};

const unitArr = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'];
const resolveUnit = (num, baseUnit = 'KB', fixed = 2) => {
  num = Number(num);
  let currUnit = baseUnit;
  let index = unitArr.indexOf(currUnit);
  while (num >= 1024) {
    num /= 1024;
    index++;
    currUnit = unitArr[index];
  }
  if (num % 1 === 0) {
    return {
      num: num,
      currUnit
    };
  }
  return {
    num: num.toFixed(2),
    currUnit
  };
};

// eslint-disable-next-line react/no-multi-comp
@connect(({ user, application, teamControl, enterprise, loading, global }) => ({
  buildShapeLoading: loading.effects['global/buildShape'],
  editGroupLoading: loading.effects['application/editGroup'],
  deleteLoading: loading.effects['application/delete'],
  getTotalInfoLoading: loading.effects['application/fetchAppDetailState'],
  currUser: user.currentUser,
  apps: application.apps,
  groupDetail: application.groupDetail || {},
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
  novices: global.novices
}))
export default class Index extends PureComponent {
  constructor(arg) {
    super(arg);
    this.state = {
      type: this.props?.componentPermissions?.isAccess ? 'list' : 'shape',
      toDelete: false,
      toEdit: false,
      toEditAppDirector: false,
      service_alias: [],
      serviceIds: [],
      linkList: [],
      jsonDataLength: 0,
      promptModal: false,
      code: '',
      size: 'large',
      currApp: {},
      rapidCopy: false,
      componentTimer: true,
      customSwitch: false,
      resources: {},
      upgradableNum: 0,
      upgradableNumLoading: true,
      appStatusConfig: false,
      guideStep: 1,
      actionsList: []
    };
  }

  componentDidMount() {
    this.loading();
    this.handleWaitLevel();
  }

  componentWillUnmount() {
    this.closeTimer();
    const { dispatch } = this.props;
    dispatch({ type: 'application/clearGroupDetail' });
  }

  onCancel = () => {
    this.setState({
      customSwitch: false
    });
  };

  getGroupId() {
    return this.props.appID;
  }

  closeTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  loading = () => {
    this.fetchAppDetail();
    this.loadTopology(true);
    this.fetchAppDetailState();
  };

  handleNewbieGuiding = info => {
    const { nextStep } = info;
    return (
      <NewbieGuiding
        {...info}
        totals={2}
        handleClose={() => {
          this.handleGuideStep('close');
        }}
        handleNext={() => {
          if (nextStep) {
            document.getElementById('scroll_div').scrollIntoView();
            this.handleGuideStep(nextStep);
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

  loadTopology(isCycle) {
    const { dispatch } = this.props;
    const teamName = globalUtil.getCurrTeamName();
    const regionName = globalUtil.getCurrRegionName();
    cookie.set('team_name', teamName);
    cookie.set('region_name', regionName);

    dispatch({
      type: 'global/fetAllTopology',
      payload: {
        region_name: regionName,
        team_name: teamName,
        groupId: this.getGroupId()
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const data = res.bean;
          if (JSON.stringify(data) === '{}') {
            return;
          }
          const serviceIds = [];
          const service_alias = [];
          const { json_data } = data;
          Object.keys(json_data).map(key => {
            serviceIds.push(key);
            if (
              json_data[key].cur_status == 'running' &&
              json_data[key].is_internet == true
            ) {
              service_alias.push(json_data[key].service_alias);
            }
          });

          this.setState(
            {
              jsonDataLength: Object.keys(json_data).length,
              service_alias,
              serviceIds
            },
            () => {
              this.loadLinks(service_alias.join('-'), isCycle);
            }
          );
        }
      }
    });
  }

  loadLinks(serviceAlias, isCycle) {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/queryLinks',
      payload: {
        service_alias: serviceAlias,
        team_name: globalUtil.getCurrTeamName()
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState(
            {
              linkList: res.list || []
            },
            () => {
              if (isCycle) {
                this.handleTimers(
                  'timer',
                  () => {
                    this.fetchAppDetailState();
                    this.fetchAppDetail();
                    this.loadTopology(true);
                  },
                  10000
                );
              }
            }
          );
        }
      },
      handleError: err => {
        this.handleError(err);
        this.handleTimers(
          'timer',
          () => {
            this.fetchAppDetailState();
            this.fetchAppDetail();
            this.loadTopology(true);
          },
          20000
        );
      }
    });
  }

  handleError = err => {
    const { componentTimer } = this.state;
    if (!componentTimer) {
      return null;
    }
    if (err && err.data && err.data.msg_show) {
      notification.warning({
        message: `请求错误`,
        description: err.data.msg_show
      });
    }
  };

  handleTimers = (timerName, callback, times) => {
    const { componentTimer } = this.state;
    if (!componentTimer) {
      return null;
    }
    this[timerName] = setTimeout(() => {
      callback();
    }, times);
  };
  // 获取总数据

  fetchAppDetail = () => {
    const { dispatch } = this.props;
    const { teamName, regionName, appID } = this.props.match.params;
    dispatch({
      type: 'application/fetchGroupDetail',
      payload: {
        team_name: teamName,
        region_name: regionName,
        group_id: appID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const {
            appPermissions: {
              isShare,
              isBackup,
              isUpgrade,
              isEdit,
              isDelete,
              isStart,
              isStop,
              isUpdate,
              isConstruct,
              isCopy
            },
            operationPermissions: { isAccess: isControl },
            appConfigGroupPermissions: { isAccess: isConfigGroup }
          } = this.props;
          const { ingress_num, backup_num, share_num, config_group_num } =
            res?.bean || {};
          const list = [
            {
              num: backup_num,
              title: '备份',
              icon: 'icon-beifen1',
              canJump: isBackup,
              keys: 'backup'
            },
            {
              num: share_num,
              title: '模型发布',
              icon: 'icon-moxingfabu',
              canJump: isShare,
              keys: 'publish'
            },
            {
              num: ingress_num,
              title: '网关策略',
              icon: 'icon-wangguancelve1',
              canJump: isControl,
              keys: 'gateway'
            },
            // {
            //   num: this.state.upgradableNum,
            //   title: '待升级',
            //   src: UpdateImg,
            //   canJump: isUpgrade
            // },
            {
              num: config_group_num,
              title: '配置',
              icon: 'icon-peizhizu1',
              canJump: isConfigGroup,
              keys: 'configgroups'
            }
          ];
          this.setState({
            currApp: res.bean,
            actionsList: list
          });
        }
      },
      handleError: res => {
        const { componentTimer } = this.state;
        if (!componentTimer) {
          return null;
        }
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

  handleWaitLevel = () => {
    const { dispatch } = this.props;
    const { teamName, appID } = this.props.match.params;
    dispatch({
      type: 'application/fetchToupgrade',
      payload: {
        team_name: teamName,
        group_id: appID
      },
      callback: res => {
        const info = (res && res.bean) || {};
        this.setState({
          upgradableNumLoading: false,
          upgradableNum: (info && info.upgradable_num) || 0
        });
      }
    });
  };

  fetchAppDetailState = () => {
    const { dispatch } = this.props;
    const { teamName, appID } = this.props.match.params;
    dispatch({
      type: 'application/fetchAppDetailState',
      payload: {
        team_name: teamName,
        group_id: appID
      },
      callback: res => {
        this.setState({
          resources: res.list,
          appStatusConfig: true
        });
      }
    });
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.loadApps();
  };

  handleSearch = e => {
    e.preventDefault();
    this.loadApps();
  };

  changeType = type => {
    this.setState({ type });
  };

  toDelete = () => {
    this.closeComponentTimer();
    this.setState({ toDelete: true });
  };

  cancelDelete = (isOpen = true) => {
    this.setState({ toDelete: false });
    if (isOpen) {
      this.openComponentTimer();
    }
  };

  closeComponentTimer = () => {
    this.setState({ componentTimer: false });
    this.closeTimer();
  };

  openComponentTimer = () => {
    this.setState({ componentTimer: true }, () => {
      this.loadTopology(true);
    });
  };

  handleDelete = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'application/delete',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        group_id: this.getGroupId()
      },
      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({ message: '删除成功' });
          this.closeComponentTimer();
          this.cancelDelete(false);
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps`
            )
          );
        }
      }
    });
  };

  newAddress = grid => {
    this.props.dispatch({
      type: 'global/fetchGroups',
      payload: {
        team_name: globalUtil.getCurrTeamName()
      },
      callback: list => {
        if (list && list.length) {
          if (grid == list[0].group_id) {
            this.newAddress(grid);
          } else {
            this.props.dispatch(
              routerRedux.push(
                `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps/${
                  list[0].group_id
                }`
              )
            );
          }
        } else {
          this.props.dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/index`
            )
          );
        }
      }
    });
  };

  toEdit = () => {
    this.setState({ toEdit: true });
  };

  cancelEdit = () => {
    this.setState({ toEdit: false });
  };

  handleToEditAppDirector = () => {
    this.setState({ toEditAppDirector: true });
  };

  cancelEditAppDirector = () => {
    this.setState({ toEditAppDirector: false });
  };

  handleEdit = vals => {
    const { dispatch } = this.props;
    dispatch({
      type: 'application/editGroup',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        group_id: this.getGroupId(),
        group_name: vals.group_name,
        note: vals.note,
        username: vals.username,
        logo: vals.logo,
        k8s_app: vals.k8s_app
      },
      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({ message: '修改成功' });
          dispatch({
            type: 'application/editGroups',
            payload: {
              team_name: globalUtil.getCurrTeamName(),
              group_id: this.getGroupId()
            },
            callback: res => {
              notification.success({ message: '重启应用后生效' });
            }
          });
        }
        this.handleUpDataHeader();
        this.cancelEdit();
        this.cancelEditAppDirector();
        this.fetchAppDetail();
        dispatch({
          type: 'global/fetchGroups',
          payload: {
            team_name: globalUtil.getCurrTeamName()
          }
        });
      }
    });
  };

  handleUpDataHeader = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/IsUpDataHeader',
      payload: { isUpData: true }
    });
  };

  /** 构建拓扑图 */
  handleTopology = code => {
    this.setState({
      promptModal: true,
      code
    });
  };

  handleOpenRapidCopy = () => {
    this.setState({
      rapidCopy: true
    });
  };

  handleCloseRapidCopy = () => {
    this.setState({
      rapidCopy: false
    });
  };

  handlePromptModalOpen = () => {
    const { code, serviceIds } = this.state;
    const { dispatch } = this.props;
    if (code === 'restart') {
      batchOperation({
        action: code,
        team_name: globalUtil.getCurrTeamName(),
        serviceIds: serviceIds && serviceIds.join(',')
      }).then(res => {
        if (res && res.status_code === 200) {
          notification.success({
            message: '重启成功'
          });
          this.handlePromptModalClose();
        }
        this.loadTopology(false);
      });
    } else {
      dispatch({
        type: 'global/buildShape',
        payload: {
          tenantName: globalUtil.getCurrTeamName(),
          group_id: this.getGroupId(),
          action: code
        },
        callback: res => {
          if (res && res.status_code === 200) {
            notification.success({
              message: res.msg_show || '构建成功',
              duration: '3'
            });
            this.handlePromptModalClose();
          }
          this.loadTopology(false);
        }
      });
    }
  };

  handlePromptModalClose = () => {
    this.setState({
      promptModal: false,
      code: ''
    });
  };

  handleSizeChange = e => {
    this.setState({ size: e.target.value });
  };

  handleSwitch = () => {
    this.setState({
      customSwitch: true
    });
  };

  handleJump = target => {
    const { dispatch, appID } = this.props;
    dispatch(
      routerRedux.push(
        `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps/${appID}/${target}`
      )
    );
  };

  goBack = () => this.props.history.goBack();

  getList = ({ resources, currApp }) => [
    {
      number: resolveUnit(resources.memory || 0, 'MB').num,
      unit: resolveUnit(resources.memory || 0, 'MB').unit,
      title: '使用内存'
    },
    {
      number: (resources.cpu && resources.cpu / 1000) || 0,
      unit: 'Core',
      title: '使用CPU'
    },
    {
      number: resolveUnit(resources.disk || 0, 'KB').num || 0,
      unit: resolveUnit(resources.disk || 0, 'KB').currUnit || 'KB',
      title: '使用磁盘'
    },
    {
      number: currApp.service_num || 0,
      unit: '个',
      title: '组件数量'
    }
  ];

  render() {
    const {
      groupDetail,
      appPermissions: {
        isShare,
        isBackup,
        isUpgrade,
        isEdit,
        isDelete,
        isStart,
        isStop,
        isUpdate,
        isConstruct,
        isCopy
      },
      buildShapeLoading,
      editGroupLoading,
      deleteLoading,
      novices,
      appConfigGroupPermissions: { isAccess: isConfigGroup },
      componentPermissions,
      operationPermissions: { isAccess: isControl },
      componentPermissions: {
        isAccess: isComponentDescribe,
        isCreate: isComponentCreate,
        isConstruct: isComponentConstruct,
        isRestart
      },
      getTotalInfoLoading
    } = this.props;
    const {
      currApp,
      resources,
      rapidCopy,
      jsonDataLength,
      linkList,
      code,
      promptModal,
      toEdit,
      toEditAppDirector,
      toDelete,
      type,
      customSwitch,
      serviceIds,
      upgradableNumLoading,
      upgradableNum,
      appStatusConfig,
      guideStep,
      actionsList,
      currentIndex,
      isHover
    } = this.state;
    const codeObj = {
      start: '启动',
      restart: '重启',
      stop: '停用',
      deploy: '构建'
    };
    const BtnDisabled = !(jsonDataLength > 0);
    const MR = { marginRight: '10px' };
    const pageHeaderContentNew = (
      <Row className={styles['group-header']}>
        <Card bordered={false} className={styles.card}>
          <div className={styles.header}>
            <div className={styles.title}>应用管理</div>
            <div className={styles.back} onClick={this.goBack}>
              <img src={GobackImg} alt="" />
            </div>
          </div>
          <Row gutter={16} className={styles.middle}>
            <Col span={12} className={styles.left}>
              <div className={styles.wrap}>
                <div className={styles.top}>
                  <div className={styles.title}>
                    <Tooltip placement="top" title="测试">
                      <img src={AppImg} alt="" />
                    </Tooltip>
                    <span className={styles.text}>
                      {currApp.group_name || '-'}
                    </span>
                    <Tooltip placement="top" title="修改应用信息">
                      <img
                        src={EditImg}
                        alt=""
                        onClick={this.toEdit}
                        style={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  </div>
                  <div className={styles.actions}>
                    {resources.status && (
                      <div className={styles.extraContent}>
                        {resources.status !== 'CLOSED' && isUpdate && (
                          <Tooltip
                            placement="top"
                            title="更新当前应用下的全部组件，将最新的配置属性应用到组件"
                          >
                            <Button
                              style={MR}
                              onClick={() => {
                                this.handleTopology('upgrade');
                              }}
                              disabled={BtnDisabled}
                            >
                              更新
                            </Button>
                          </Tooltip>
                        )}
                        {isConstruct && isComponentConstruct && (
                          <Tooltip
                            placement="top"
                            title="构建当前应用下的全部组件，构建成功后将触发滚动升级"
                          >
                            <Button
                              style={MR}
                              disabled={BtnDisabled}
                              onClick={() => {
                                this.handleTopology('deploy');
                              }}
                            >
                              构建
                            </Button>
                          </Tooltip>
                        )}
                        {isCopy && (
                          <Tooltip
                            placement="top"
                            title="将应用模型属性复制到其他团队环境"
                          >
                            <Button
                              style={MR}
                              disabled={BtnDisabled}
                              onClick={this.handleOpenRapidCopy}
                            >
                              快速复制
                            </Button>
                          </Tooltip>
                        )}
                        {linkList.length > 0 && (
                          <VisterBtn linkList={linkList} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.bottom}>
                  {appStatusConfig && (
                    <span>
                      <span
                        className={styles.badge}
                        style={{
                          background: resources?.status
                            ? `${appStateColor[(resources?.status)]}`
                            : `${appStateColor.default}`,
                          boxShadow: `0px 0px 6px 0px ${
                            resources?.status
                              ? `${appStateColor[(resources?.status)]}`
                              : `${appStateColor.default}`
                          }`,
                          verticalAlign: 'middle'
                        }}
                      ></span>
                      <Tooltip placement="top" title="应用运行状态">
                        <span className={styles.text}>
                          {appState[(resources?.status)] || '闲置'}
                        </span>
                      </Tooltip>
                    </span>
                  )}
                  {resources.status && isStart && (
                    <Tooltip placement="top" title="启动当前应用的全部组件">
                      <span style={{ verticalAlign: 'middle' }}>
                        <a
                          onClick={() => {
                            this.handleTopology('start');
                          }}
                          disabled={BtnDisabled}
                        >
                          启动
                        </a>
                        <Divider type="vertical" />
                      </span>
                    </Tooltip>
                  )}
                  {resources.status &&
                    (resources.status === 'ABNORMAL' ||
                      resources.status === 'PARTIAL_ABNORMAL') &&
                    serviceIds &&
                    serviceIds.length > 0 &&
                    isRestart && (
                      <Tooltip
                        placement="top"
                        title="重新启动  当前应用的全部组件"
                      >
                        <span style={{ verticalAlign: 'middle' }}>
                          <a
                            onClick={() => {
                              this.handleTopology('restart');
                            }}
                            disabled={BtnDisabled}
                          >
                            重启
                          </a>
                          <Divider type="vertical" />
                        </span>
                      </Tooltip>
                    )}
                  {isDelete && resources.status !== 'RUNNING' && (
                    <Tooltip placement="top" title="删除此应用">
                      <a
                        onClick={this.toDelete}
                        style={{ verticalAlign: 'middle' }}
                      >
                        删除
                      </a>
                    </Tooltip>
                  )}
                  {resources.status && resources.status !== 'CLOSED' && isStop && (
                    <Tooltip
                      placement="top"
                      title="停用当前应用下的全部组件, 释放应用占用资源"
                    >
                      <span style={{ verticalAlign: 'middle' }}>
                        {resources.status !== 'RUNNING' && (
                          <Divider type="vertical" />
                        )}
                        <a
                          onClick={() => {
                            this.handleTopology('stop');
                          }}
                        >
                          停用
                        </a>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Col>
            <Col span={12} className={styles.right}>
              <TwOverViewList
                list={this.getList({ resources, currApp })}
                loading={getTotalInfoLoading}
              />
            </Col>
          </Row>
          <Row gutter={16} className={styles.bottom}>
            <Col span={11} className={styles.left}>
              <div className={styles.wrap}>
                <div className={styles.left}>
                  <div>
                    <span className={styles.label}>创建时间</span>
                    <span className={styles.value}>
                      {currApp.create_time
                        ? moment(currApp.create_time)
                            .locale('zh-cn')
                            .format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <span className={styles.label}>治理模式</span>
                    <span className={styles.value}>
                      {currApp.governance_mode
                        ? globalUtil.fetchGovernanceMode(
                            currApp.governance_mode
                          )
                        : '-'}
                      {currApp.governance_mode && isEdit && (
                        <img
                          style={{ marginLeft: '5px', cursor: 'pointer' }}
                          onClick={this.handleSwitch}
                          src={SwitchImg}
                          alt=""
                        />
                      )}
                    </span>
                  </div>
                </div>
                <div className={styles.right}>
                  <div>
                    <span className={styles.label}>更新时间</span>
                    <span className={styles.value}>
                      {currApp.update_time
                        ? moment(currApp.update_time)
                            .locale('zh-cn')
                            .format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <span className={styles.label}>负责人</span>
                    <span className={styles.value}>
                      {currApp.principal ? (
                        <Tooltip
                          placement="top"
                          title={
                            <div>
                              <div>账号:{currApp.username}</div>
                              <div>姓名:{currApp.principal}</div>
                              <div>邮箱:{currApp.email}</div>
                            </div>
                          }
                        >
                          <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                            {currApp.principal}
                          </span>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                      {isEdit && (
                        <img
                          src={EditImg}
                          alt=""
                          onClick={this.handleToEditAppDirector}
                          style={{ cursor: 'pointer', marginLeft: '5px' }}
                        />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={13} className={styles.right}>
              <div className={styles.wrap}>
                {actionsList.length !== 0 &&
                  actionsList.map((item, index) => {
                    const { num, icon, title, canJump, keys } = item;
                    return (
                      <div
                        key={index}
                        className={styles.info}
                        onClick={() => {
                          canJump && this.handleJump(keys);
                        }}
                      >
                        <div className={styles.count}>{num || 0}</div>
                        <div>
                          <span
                            className={`iconfont ${icon}`}
                            style={{ verticalAlign: 'middle' }}
                          ></span>
                          <span className={styles.text}>{title}</span>
                        </div>
                        <div>
                          <span className="iconfont icon-tiaozhuan-moren"></span>
                        </div>
                      </div>
                    );
                  })}
                <div
                  className={styles.info}
                  onClick={() => {
                    !upgradableNumLoading &&
                      isUpgrade &&
                      this.handleJump('upgrade');
                  }}
                >
                  <div className={styles.count}>
                    {upgradableNumLoading ? <Spin /> : upgradableNum}
                  </div>
                  <div>
                    {/* <img
                      src={!isHover ? UpdateImg : UpdateHoverImg}
                      alt=""
                      style={{ width: 16, height: 16 }}
                    /> */}
                    <span
                      className="iconfont icon-daishengji1"
                      style={{ verticalAlign: 'middle' }}
                    ></span>
                    <span className={styles.text}>待升级</span>
                  </div>
                  <div>
                    <span className="iconfont icon-tiaozhuan-moren"></span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Row>
    );
    const teamName = globalUtil.getCurrTeamName();
    const regionName = globalUtil.getCurrRegionName();
    const highlighted = {
      position: 'relative',
      zIndex: 1000,
      padding: '0 16px',
      margin: '0 -16px',
      background: '#fff'
    };
    const isScrollDiv = wutongUtil.handleNewbie(novices, 'applicationInfo');
    // const groupId = this.getGroupId();
    return (
      <Fragment>
        <Row>{pageHeaderContentNew}</Row>
        {customSwitch && (
          <ApplicationGovernance
            mode={currApp && currApp.governance_mode}
            appID={this.getGroupId()}
            onCancel={this.onCancel}
            onOk={this.fetchAppDetail}
          />
        )}

        <Row>
          <Row
            style={{
              display: 'flex',
              background: '#FFFFFF',
              height: '60px',
              alignItems: 'center',
              borderBottom: '1px solid #E9F1F7',
              borderRadius: 4,
              boxShadow: ': 0px 1px 4px 0px rgba(0,0,0,0.0600)'
            }}
          >
            <div className={styles.header}>
              <div className={styles.left}>
                <div className={styles.tabs}>
                  {[
                    { title: '组件列表', keys: 'list' },
                    { title: '拓扑图', keys: 'shape' }
                  ].map((item, index) => {
                    if (item.keys === 'list' && !isComponentDescribe) {
                      return null;
                    }
                    return (
                      <div
                        className={
                          type === item.keys ||
                          (type === 'shapes' && index === 1)
                            ? styles.active
                            : styles.tabpane
                        }
                        key={index}
                        onClick={() => {
                          this.changeType(item.keys);
                        }}
                      >
                        <div>{item.title}</div>
                      </div>
                    );
                  })}
                </div>
                {type !== 'list' && isComponentCreate && (
                  <div className={styles['radio-button']}>
                    <Radio.Group value={this.state.type} buttonStyle="solid">
                      <Tooltip
                        placement="top"
                        title="图形化展示应用组件的拓扑关系，该模式不可编辑"
                      >
                        <Radio.Button
                          value="shape"
                          onClick={() => {
                            this.changeType('shape');
                          }}
                        >
                          普通模式
                        </Radio.Button>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title="以编辑模式展示应用组件的拓扑关系"
                      >
                        <Radio.Button
                          value="shapes"
                          onClick={() => {
                            this.changeType('shapes');
                          }}
                        >
                          编排模式
                        </Radio.Button>
                      </Tooltip>
                    </Radio.Group>
                  </div>
                )}
              </div>
              <div className={styles.right}>
                <div className={styles['add-third']}>
                  {isComponentCreate && isComponentConstruct && (
                    <AddThirdParty
                      groupId={this.getGroupId()}
                      refreshCurrent={() => {
                        this.loading();
                      }}
                      onload={() => {
                        this.setState({ type: 'spin' }, () => {
                          this.setState({
                            type: this.state.size == 'large' ? 'shape' : 'list'
                          });
                        });
                      }}
                    />
                  )}
                </div>
                <div className={styles['add-service']}>
                  {isComponentCreate && isComponentConstruct && (
                    <AddServiceComponent
                      groupId={this.getGroupId()}
                      refreshCurrent={() => {
                        this.loading();
                      }}
                      onload={() => {
                        this.setState({ type: 'spin' }, () => {
                          this.setState({
                            type: this.state.size == 'large' ? 'shape' : 'list'
                          });
                        });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* <Col span={5} style={{ paddingleft: '12px' }}>
              <div className={styles.tabs}>
                {[
                  { title: '组件列表', keys: 'list' },
                  { title: '拓扑图', keys: 'shape' }
                ].map((item, index) => {
                  if (item.keys === 'list' && !isComponentDescribe) {
                    return null;
                  }
                  return (
                    <div
                      className={
                        type === item.keys || (type === 'shapes' && index === 1)
                          ? styles.active
                          : styles.tabpane
                      }
                      key={index}
                      onClick={() => {
                        this.changeType(item.keys);
                      }}
                    >
                      <div>{item.title}</div>
                    </div>
                  );
                })}
              </div>
            </Col>
            <Col
              className={styles.topoBtn}
              span={11}
              style={{ paddingleft: '12px' }}
            >
              {type !== 'list' && isComponentCreate && (
                <div className={styles['radio-button']}>
                  <Radio.Group value={this.state.type} buttonStyle="solid">
                    <Tooltip
                      placement="top"
                      title="图形化展示应用组件的拓扑关系，该模式不可编辑"
                    >
                      <Radio.Button
                        value="shape"
                        onClick={() => {
                          this.changeType('shape');
                        }}
                      >
                        普通模式
                      </Radio.Button>
                    </Tooltip>
                    <Tooltip
                      placement="top"
                      title="以编辑模式展示应用组件的拓扑关系"
                    >
                      <Radio.Button
                        value="shapes"
                        onClick={() => {
                          this.changeType('shapes');
                        }}
                      >
                        编排模式
                      </Radio.Button>
                    </Tooltip>
                  </Radio.Group>
                </div>
              )}
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              {isComponentCreate && isComponentConstruct && (
                <AddThirdParty
                  groupId={this.getGroupId()}
                  refreshCurrent={() => {
                    this.loading();
                  }}
                  onload={() => {
                    this.setState({ type: 'spin' }, () => {
                      this.setState({
                        type: this.state.size == 'large' ? 'shape' : 'list'
                      });
                    });
                  }}
                />
              )}
            </Col>
            <Col span={4} style={{ textAlign: 'left' }}>
              {isComponentCreate && isComponentConstruct && (
                <AddServiceComponent
                  groupId={this.getGroupId()}
                  refreshCurrent={() => {
                    this.loading();
                  }}
                  onload={() => {
                    this.setState({ type: 'spin' }, () => {
                      this.setState({
                        type: this.state.size == 'large' ? 'shape' : 'list'
                      });
                    });
                  }}
                />
              )}
            </Col> */}
          </Row>
          {rapidCopy && (
            <RapidCopy
              on={this.handleCloseRapidCopy}
              onCancel={this.handleCloseRapidCopy}
              title="应用复制"
            />
          )}

          {type === 'list' && isComponentDescribe && (
            <ComponentList
              componentPermissions={componentPermissions}
              groupId={this.getGroupId()}
            />
          )}
          {type === 'shape' && <AppShape group_id={this.getGroupId()} />}
          {type === 'spin' && <Spin />}
          {type === 'shapes' && (
            <EditorTopology
              changeType={types => {
                this.changeType(types);
              }}
              group_id={this.getGroupId()}
            />
          )}
          {type === 'monitor' && (
            <Monitor
              teamName={teamName}
              regionName={regionName}
              groupId={this.getGroupId()}
            />
          )}
        </Row>
        {guideStep === 2 &&
          this.handleNewbieGuiding({
            tit: '应用拓扑图',
            btnText: '已知晓',
            showSvg: false,
            showArrow: true,
            send: true,
            configName: 'applicationInfo',
            desc:
              '这是应用内部的服务拓扑图，通过拓扑图可以整体了解服务的运行状态和依赖关系，每个六边形就是一个服务，点击六边形可以进入服务的管理页面。',
            nextStep: 3,
            conPosition: { bottom: '-16px', left: '45%' }
          })}
        {/* {isScrollDiv && <div id="scroll_div" style={{ marginTop: '180px' }} />} */}

        {toDelete && (
          <ConfirmModal
            title="删除应用"
            desc="确定要此删除此应用吗？"
            subDesc="此操作不可恢复"
            loading={deleteLoading}
            onOk={this.handleDelete}
            onCancel={this.cancelDelete}
          />
        )}
        {toEdit && (
          <EditGroupName
            isAddGroup={false}
            group_name={groupDetail.group_name}
            logo={groupDetail.logo}
            note={groupDetail.note}
            loading={editGroupLoading}
            k8s_app={groupDetail.k8s_app}
            title="修改应用信息"
            onCancel={this.cancelEdit}
            onOk={this.handleEdit}
            isEditEnglishName={currApp.can_edit}
          />
        )}
        {toEditAppDirector && (
          <AppDirector
            teamName={teamName}
            regionName={regionName}
            group_name={groupDetail.group_name}
            note={groupDetail.note}
            loading={editGroupLoading}
            principal={currApp.username}
            onCancel={this.cancelEditAppDirector}
            onOk={this.handleEdit}
          />
        )}

        {promptModal && (
          <Modal
            title="友情提示"
            confirmLoading={buildShapeLoading}
            visible={promptModal}
            onOk={this.handlePromptModalOpen}
            onCancel={this.handlePromptModalClose}
          >
            <p>{codeObj[code]}当前应用下的全部组件？</p>
          </Modal>
        )}
      </Fragment>
    );
  }
}
