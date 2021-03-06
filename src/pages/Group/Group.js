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
import styles from './Index.less';
import GobackImg from '../../../public/images/common/goback.svg';
import AppImg from '../../../public/images/common/app.svg';
import EditImg from '../../../public/images/common/edit.svg';
import SwitchImg from '../../../public/images/team/switch.svg';
import IngressImg from '../../../public/images/team/ingress.svg';
import ModelImg from '../../../public/images/team/model.svg';
import ConfigImg from '../../../public/images/team/config.svg';
import UpdateImg from '../../../public/images/team/update.svg';
import BackupImg from '../../../public/images/team/backup.svg';
import RightImg from '../../../public/images/common/right.svg';
import IngressHoverImg from '../../../public/images/team/ingress_hover.svg';
import ModelHoverImg from '../../../public/images/team/model_hover.svg';
import ConfigHoverImg from '../../../public/images/team/config_hover.svg';
import UpdateHoverImg from '../../../public/images/team/update_hover.svg';
import BackupHoverImg from '../../../public/images/team/backup_hover.svg';
import RightHoverImg from '../../../public/images/common/right_hover.svg';

const appState = {
  RUNNING: '?????????',
  STARTING: '?????????',
  CLOSED: '?????????',
  STOPPING: '?????????',
  ABNORMAL: '??????',
  PARTIAL_ABNORMAL: '????????????',
  'not-configured': '?????????',
  unknown: '??????',
  deployed: '?????????',
  superseded: '?????????',
  failed: '??????',
  uninstalled: '?????????',
  uninstalling: '?????????',
  'pending-install': '?????????',
  'pending-upgrade': '?????????',
  'pending-rollback': '?????????'
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
      actionsList: [],
      currentIndex: -1,
      isHover: false
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
        message: `????????????`,
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
  // ???????????????

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
              title: '??????',
              src: BackupImg,
              hoverSrc: BackupHoverImg,
              canJump: isBackup,
              keys: 'backup'
            },
            {
              num: share_num,
              title: '????????????',
              src: ModelImg,
              hoverSrc: ModelHoverImg,
              canJump: isShare,
              keys: 'publish'
            },
            {
              num: ingress_num,
              title: '????????????',
              src: IngressImg,
              hoverSrc: IngressHoverImg,
              canJump: isControl,
              keys: 'gateway'
            },
            // {
            //   num: this.state.upgradableNum,
            //   title: '?????????',
            //   src: UpdateImg,
            //   canJump: isUpgrade
            // },
            {
              num: config_group_num,
              title: '??????',
              src: ConfigImg,
              hoverSrc: ConfigHoverImg,
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
          notification.success({ message: '????????????' });
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
          notification.success({ message: '????????????' });
          dispatch({
            type: 'application/editGroups',
            payload: {
              team_name: globalUtil.getCurrTeamName(),
              group_id: this.getGroupId()
            },
            callback: res => {
              notification.success({ message: '?????????????????????' });
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

  /** ??????????????? */
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
            message: '????????????'
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
              message: res.msg_show || '????????????',
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
      }
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
      start: '??????',
      restart: '??????',
      stop: '??????',
      deploy: '??????'
    };
    const BtnDisabled = !(jsonDataLength > 0);
    const MR = { marginRight: '10px' };
    const pageHeaderContentNew = (
      <Row className={styles['group-header']}>
        <Card bordered={false} className={styles.card}>
          <div className={styles.header}>
            <div className={styles.title}>????????????</div>
            <div className={styles.back} onClick={this.goBack}>
              <img src={GobackImg} alt="" />
            </div>
          </div>
          <Row gutter={16} className={styles.middle}>
            <Col span={12} className={styles.left}>
              <div className={styles.wrap}>
                <div className={styles.top}>
                  <div className={styles.title}>
                    <Tooltip placement="top" title="??????">
                      <img src={AppImg} alt="" />
                    </Tooltip>
                    <span className={styles.text}>
                      {currApp.group_name || '-'}
                    </span>
                    <Tooltip placement="top" title="??????????????????">
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
                            title="??????????????????????????????????????????????????????????????????????????????"
                          >
                            <Button
                              style={MR}
                              onClick={() => {
                                this.handleTopology('upgrade');
                              }}
                              disabled={BtnDisabled}
                            >
                              ??????
                            </Button>
                          </Tooltip>
                        )}
                        {isConstruct && isComponentConstruct && (
                          <Tooltip
                            placement="top"
                            title="???????????????????????????????????????????????????????????????????????????"
                          >
                            <Button
                              style={MR}
                              disabled={BtnDisabled}
                              onClick={() => {
                                this.handleTopology('deploy');
                              }}
                            >
                              ??????
                            </Button>
                          </Tooltip>
                        )}
                        {isCopy && (
                          <Tooltip
                            placement="top"
                            title="????????????????????????????????????????????????"
                          >
                            <Button
                              style={MR}
                              disabled={BtnDisabled}
                              onClick={this.handleOpenRapidCopy}
                            >
                              ????????????
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
                          }`
                        }}
                      ></span>
                      <Tooltip placement="top" title="??????????????????">
                        <span className={styles.text}>
                          {appState[(resources?.status)] || '??????'}
                        </span>
                      </Tooltip>
                    </span>
                  )}
                  {resources.status && isStart && (
                    <Tooltip placement="top" title="?????????????????????????????????">
                      <span>
                        <a
                          onClick={() => {
                            this.handleTopology('start');
                          }}
                          disabled={BtnDisabled}
                        >
                          ??????
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
                        title="????????????  ???????????????????????????"
                      >
                        <span>
                          <a
                            onClick={() => {
                              this.handleTopology('restart');
                            }}
                            disabled={BtnDisabled}
                          >
                            ??????
                          </a>
                          <Divider type="vertical" />
                        </span>
                      </Tooltip>
                    )}
                  {isDelete && resources.status !== 'RUNNING' && (
                    <Tooltip placement="top" title="???????????????">
                      <a onClick={this.toDelete}>??????</a>
                    </Tooltip>
                  )}
                  {resources.status && resources.status !== 'CLOSED' && isStop && (
                    <Tooltip
                      placement="top"
                      title="????????????????????????????????????, ????????????????????????"
                    >
                      <span>
                        {resources.status !== 'RUNNING' && (
                          <Divider type="vertical" />
                        )}
                        <a
                          onClick={() => {
                            this.handleTopology('stop');
                          }}
                        >
                          ??????
                        </a>
                      </span>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Col>
            <Col span={12} className={styles.right}>
              <div className={styles.wrap}>
                <div className={styles.info}>
                  <div className={styles.top}>
                    <span className={styles.count}>
                      {resolveUnit(resources.memory || 0, 'MB').num}
                    </span>
                    <span className={styles.unit}>
                      {resolveUnit(resources.memory || 0, 'MB').currUnit}
                    </span>
                  </div>
                  <div>
                    <span className={styles.title}>????????????</span>
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.top}>
                    <span className={styles.count}>
                      {(resources.cpu && resources.cpu / 1000) || 0}
                    </span>
                    <span className={styles.unit}>Core</span>
                  </div>
                  <div>
                    <span className={styles.title}>??????CPU</span>
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.top}>
                    <span className={styles.count}>
                      {resolveUnit(resources.disk || 0, 'KB').num || 0}
                    </span>
                    <span className={styles.unit}>
                      {resolveUnit(resources.disk || 0, 'KB').currUnit || 'KB'}
                    </span>
                  </div>
                  <div>
                    <span className={styles.title}>????????????</span>
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.top}>
                    <span className={styles.count}>
                      {currApp.service_num || 0}
                    </span>
                    <span className={styles.unit}>???</span>
                  </div>
                  <div>
                    <span className={styles.title}>????????????</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <Row gutter={16} className={styles.bottom}>
            <Col span={11} className={styles.left}>
              <div className={styles.wrap}>
                <div className={styles.left}>
                  <div>
                    <span className={styles.label}>????????????</span>
                    <span className={styles.value}>
                      {currApp.create_time
                        ? moment(currApp.create_time)
                            .locale('zh-cn')
                            .format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <span className={styles.label}>????????????</span>
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
                    <span className={styles.label}>????????????</span>
                    <span className={styles.value}>
                      {currApp.update_time
                        ? moment(currApp.update_time)
                            .locale('zh-cn')
                            .format('YYYY-MM-DD HH:mm:ss')
                        : '-'}
                    </span>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <span className={styles.label}>?????????</span>
                    <span className={styles.value}>
                      {currApp.principal ? (
                        <Tooltip
                          placement="top"
                          title={
                            <div>
                              <div>??????:{currApp.username}</div>
                              <div>??????:{currApp.principal}</div>
                              <div>??????:{currApp.email}</div>
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
                    const { num, src, title, canJump, keys, hoverSrc } = item;
                    return (
                      <div
                        key={index}
                        className={styles.info}
                        onMouseEnter={() => {
                          this.setState({
                            currentIndex: index
                          });
                        }}
                        onMouseLeave={() => {
                          this.setState({
                            currentIndex: -1
                          });
                        }}
                        onClick={() => {
                          canJump && this.handleJump(keys);
                        }}
                      >
                        <div className={styles.count}>{num || 0}</div>
                        <div>
                          <img
                            src={currentIndex === index ? hoverSrc : src}
                            style={{ width: 16, height: 16 }}
                            alt=""
                          />
                          <span className={styles.text}>{title}</span>
                        </div>
                        <div>
                          <img
                            src={
                              currentIndex === index ? RightHoverImg : RightImg
                            }
                            alt=""
                          />
                        </div>
                      </div>
                    );
                  })}
                <div
                  className={styles.info}
                  onMouseEnter={() => {
                    this.setState({
                      isHover: true
                    });
                  }}
                  onMouseLeave={() => {
                    this.setState({
                      isHover: false
                    });
                  }}
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
                    <img
                      src={!isHover ? UpdateImg : UpdateHoverImg}
                      alt=""
                      style={{ width: 16, height: 16 }}
                    />
                    <span className={styles.text}>?????????</span>
                  </div>
                  <div>
                    <img src={!isHover ? RightImg : RightHoverImg} alt="" />
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
        {/* <Row>{pageHeaderContent}</Row> */}
        {/* {guideStep === 1 &&
          this.handleNewbieGuiding({
            tit: '????????????',
            showSvg: false,
            showArrow: true,
            send: false,
            configName: 'applicationInfo',
            desc:
              '???????????????????????????????????????????????????????????????????????????????????????OA???CRM???ERP??????????????????????????????????????????????????????????????????????????????????????????????????????',
            nextStep: 2,
            conPosition: { top: '336px', left: '42%' }
          })} */}
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
            <Col span={5} style={{ paddingleft: '12px' }}>
              <div className={styles.tabs}>
                {[
                  { title: '????????????', keys: 'list' },
                  { title: '?????????', keys: 'shape' }
                ].map((item, index) => {
                  if (item.keys === 'list' && !isComponentDescribe) {
                    return null;
                  }
                  return (
                    <div
                      className={
                        type === item.keys ? styles.active : styles.tabpane
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
              {/* {isComponentDescribe && (
                <a
                  onClick={() => {
                    this.changeType('list');
                  }}
                  style={{
                    marginLeft: '30px',
                    color: type === 'list' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
                  }}
                >
                  ????????????
                </a>
              )}
              <a
                onClick={() => {
                  this.changeType('shape');
                }}
                style={{
                  marginLeft: '30px',
                  color: type === 'shape' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
                }}
              >
                ?????????
              </a> */}
              {/*<a
                onClick={() => {
                  this.changeType('monitor');
                }}
                style={{
                  marginLeft: '30px',
                  color: type === 'monitor' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
                }}
              >
                ??????
              </a>*/}
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
                      title="??????????????????????????????????????????????????????????????????"
                    >
                      <Radio.Button
                        value="shape"
                        onClick={() => {
                          this.changeType('shape');
                        }}
                      >
                        ????????????
                      </Radio.Button>
                    </Tooltip>
                    <Tooltip
                      placement="top"
                      title="????????????????????????????????????????????????"
                    >
                      <Radio.Button
                        value="shapes"
                        onClick={() => {
                          this.changeType('shapes');
                        }}
                      >
                        ????????????
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
            </Col>
          </Row>
          {rapidCopy && (
            <RapidCopy
              on={this.handleCloseRapidCopy}
              onCancel={this.handleCloseRapidCopy}
              title="????????????"
            />
          )}

          {/* {type !== 'list' && type !== 'monitor' && isComponentCreate && (
            <Row
              style={{
                textAlign: 'right',
                paddingTop: '16px',
                paddingRight: '20px',
                background: '#fff'
              }}
            >
              {type === 'shapes' ? (
                <a
                  onClick={() => {
                    this.changeType('shape');
                  }}
                >
                  ?????????????????????
                </a>
              ) : (
                <a
                  onClick={() => {
                    this.changeType('shapes');
                  }}
                >
                  ?????????????????????
                </a>
              )}
            </Row>
          )} */}

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
            tit: '???????????????',
            btnText: '?????????',
            showSvg: false,
            showArrow: true,
            send: true,
            configName: 'applicationInfo',
            desc:
              '??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
            nextStep: 3,
            conPosition: { bottom: '-16px', left: '45%' }
          })}
        {/* {isScrollDiv && <div id="scroll_div" style={{ marginTop: '180px' }} />} */}

        {toDelete && (
          <ConfirmModal
            title="????????????"
            desc="?????????????????????????????????"
            subDesc="?????????????????????"
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
            title="??????????????????"
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
            title="????????????"
            confirmLoading={buildShapeLoading}
            visible={promptModal}
            onOk={this.handlePromptModalOpen}
            onCancel={this.handlePromptModalClose}
          >
            <p>{codeObj[code]}?????????????????????????????????</p>
          </Modal>
        )}
      </Fragment>
    );
  }
}
