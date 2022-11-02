/* eslint-disable consistent-return */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-multi-comp */
import {
  Alert,
  Badge,
  Button,
  Divider,
  Form,
  Icon,
  Input,
  Modal,
  notification,
  Radio,
  Select,
  Tooltip,
  Spin
} from 'antd';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import styless from '../../components/CreateTeam/index.less';
import MarketAppDetailShow from '../../components/MarketAppDetailShow';
import VisitBtn from '../../components/VisitBtn';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { rollback } from '../../services/app';
import appUtil from '../../utils/app';
import AppPubSubSocket from '../../utils/appPubSubSocket';
import appStatusUtil from '../../utils/appStatus-util';
import {
  createApp,
  createComponent,
  createEnterprise,
  createTeam
} from '../../utils/breadcrumb';
import dateUtil from '../../utils/date-util';
import globalUtil from '../../utils/global';
import regionUtil from '../../utils/region';
import roleUtil from '../../utils/role';
import teamUtil from '../../utils/team';
import userUtil from '../../utils/user';
import ConnectionInformation from './connectionInformation';
import EnvironmentConfiguration from './environmentConfiguration';
import Expansion from './expansion';
import styles from './Index.less';
import Log from './log';
import Log2 from './log2';
import Members from './members';
import Mnt from './mnt';
import Monitor from './monitor';
import Overview from './overview';
import Plugin from './plugin';
import Port from './port';
import Relation from './relation';
import Resource from './resource';
import Setting from './setting';
import ThirdPartyServices from './ThirdPartyServices';
import GobackImg from '../../../public/images/common/goback.svg';
import AppImg from '../../../public/images/common/app.svg';

const FormItem = Form.Item;
const { Option } = Select;
const RadioGroup = Radio.Group;

@Form.create()
@connect(
  null,
  null,
  null,
  { withRef: true }
)
class MoveGroup extends PureComponent {
  onCancel = () => {
    this.props.onCancel();
  };
  handleSubmit = e => {
    e.preventDefault();
    const { form, currGroup } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (fieldsValue.group_id === currGroup) {
        notification.warning({ message: '不能选择当前所在应用' });
        return;
      }
      this.props.onOk(fieldsValue);
    });
  };

  render() {
    const { groups = [], currGroup, form, loading = false } = this.props;
    const { getFieldDecorator } = form;
    const initValue = currGroup.toString();
    return (
      <Modal
        title="修改组件所属应用"
        visible
        className={styless.TelescopicModal}
        onOk={this.handleSubmit}
        onCancel={this.onCancel}
        confirmLoading={loading}
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="">
            {getFieldDecorator('group_id', {
              initialValue: initValue || '',
              rules: [
                {
                  required: true,
                  message: '不能为空!'
                }
              ]
            })(
              <Select getPopupContainer={triggerNode => triggerNode.parentNode}>
                {groups &&
                  groups.length > 0 &&
                  groups.map(group => {
                    return (
                      <Option
                        key={group.group_id}
                        value={group.group_id.toString()}
                      >
                        {group.group_name}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

/* 修改组件名称 */
@Form.create()
@connect(
  null,
  null,
  null,
  { withRef: true }
)
class EditName extends PureComponent {
  onCancel = () => {
    this.props.onCancel();
  };
  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.onOk(fieldsValue);
    });
  };
  handleValiateNameSpace = (_, value, callback) => {
    const { isEditEnglishName } = this.props;
    const isDisabled =
      isEditEnglishName === 'closed' || isEditEnglishName === 'undeploy';
    if (isDisabled) {
      callback();
    }
    if (!value) {
      return callback(new Error('请输入组件英文名称'));
    }
    if (value && value.length <= 64) {
      const Reg = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
      if (!Reg.test(value)) {
        return callback(
          new Error(
            '只支持小写字母、数字或“-”，并且必须以字母开始、以数字或字母结尾'
          )
        );
      }
      callback();
    }
    if (value.length > 64) {
      return callback(new Error('不能大于64个字符'));
    }
  };
  render() {
    const {
      title,
      name,
      loading = false,
      form,
      k8sComponentName,
      isEditEnglishName
    } = this.props;
    const isDisabled =
      isEditEnglishName === 'closed' || isEditEnglishName === 'undeploy';
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={title || '修改组件名称'}
        visible
        className={styless.TelescopicModal}
        confirmLoading={loading}
        onOk={this.handleSubmit}
        onCancel={this.onCancel}
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="组件名称">
            {getFieldDecorator('service_cname', {
              initialValue: name || '',
              rules: [
                {
                  required: true,
                  message: '组件名称不能为空。'
                },
                {
                  max: 24,
                  message: '最大长度24位'
                }
              ]
            })(
              <Input
                placeholder={
                  title ? '请输入新的组件名称' : '请输入新的应用名称'
                }
              />
            )}
          </FormItem>
          {/* 集群组件名称 */}
          <FormItem
            label="组件英文名称"
            extra="关闭当前组件方可修改组件英文名称"
          >
            {getFieldDecorator('k8s_component_name', {
              initialValue: k8sComponentName || '',
              rules: [
                {
                  required: true,
                  validator: this.handleValiateNameSpace
                }
              ]
            })(<Input placeholder="组件的英文名称" disabled={!isDisabled} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

@Form.create()
@connect(
  ({ user, appControl, global, teamControl, enterprise, loading }) => ({
    currUser: user.currentUser,
    appDetail: appControl.appDetail,
    pods: appControl.pods,
    groups: global.groups,
    build_upgrade: appControl.build_upgrade,
    currentTeam: teamControl.currentTeam,
    currentRegionName: teamControl.currentRegionName,
    currentEnterprise: enterprise.currentEnterprise,
    deleteAppLoading: loading.effects['appControl/deleteApp'],
    reStartLoading: loading.effects['appControl/putReStart'],
    startLoading: loading.effects['appControl/putStart'],
    stopLoading: loading.effects['appControl/putStop'],
    moveGroupLoading: loading.effects['appControl/moveGroup'],
    editNameLoading: loading.effects['appControl/editName'],
    updateRollingLoading: loading.effects['appControl/putUpdateRolling'],
    deployLoading:
      loading.effects[('appControl/putDeploy', 'appControl/putUpgrade')],
    buildInformationLoading: loading.effects['appControl/getBuildInformation']
  }),
  null,
  null,
  { withRef: true }
)
class Main extends PureComponent {
  static childContextTypes = {
    isActionIng: PropTypes.func,
    appRolback: PropTypes.func
  };
  constructor(arg) {
    super(arg);
    this.state = {
      actionIng: false,
      groupDetail: {},
      loadingDetail: true,
      status: {},
      showDeleteApp: false,
      showEditName: false,
      showMoveGroup: false,
      visibleBuild: null,
      BuildText: '',
      BuildList: [],
      showMarketAppDetail: null,
      showApp: {},
      BuildState: null,
      isShowThirdParty: false,
      promptModal: null,
      websocketURL: '',
      componentTimer: true
    };
    this.socket = null;
    this.destroy = false;
  }

  getChildContext() {
    return {
      isActionIng: res => {
        this.setState({ actionIng: res });
      },
      appRolback: data => {
        this.handleRollback(data);
      }
    };
  }
  componentDidMount() {
    this.loadDetail();
    setTimeout(() => {
      this.getStatus(true);
    }, 5000);
  }
  componentWillUnmount() {
    this.closeComponentTimer();
    this.props.dispatch({ type: 'appControl/clearPods' });
    this.props.dispatch({ type: 'appControl/clearDetail' });
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.destroy = true;
  }

  onDeleteApp = () => {
    this.setState({ showDeleteApp: true });
  };

  getWebSocketUrl(service_id) {
    const currTeam = userUtil.getTeamByTeamName(
      this.props.currUser,
      globalUtil.getCurrTeamName()
    );
    const currRegionName = globalUtil.getCurrRegionName();
    if (currTeam) {
      const region = teamUtil.getRegionByName(currTeam, currRegionName);
      if (region) {
        const websocketURL = regionUtil.getNewWebSocketUrl(region, service_id);
        this.setState({ websocketURL }, () => {
          this.createSocket();
        });
      }
    }
  }

  getStatus = isCycle => {
    const { dispatch } = this.props;
    const { componentTimer } = this.state;
    const { team_name, app_alias } = this.fetchParameter();

    dispatch({
      type: 'appControl/fetchComponentState',
      payload: {
        team_name,
        app_alias
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({ status: res.bean }, () => {
            if (isCycle && componentTimer) {
              this.handleTimers(
                'timer',
                () => {
                  this.getStatus(true);
                },
                5000
              );
            }
          });
        }
      },
      handleError: err => {
        this.handleError(err);
        if (isCycle && componentTimer && err.status !== 404) {
          this.handleTimers(
            'timer',
            () => {
              this.getStatus(true);
            },
            10000
          );
        }
      }
    });
  };

  getChildCom = () => {
    if (this.ref) {
      return this.ref.getWrappedInstance({});
    }
    return null;
  };
  handleTeamPermissions = callback => {
    const { currUser } = this.props;
    const teamPermissions = userUtil.getTeamByTeamPermissions(
      currUser.teams,
      globalUtil.getCurrTeamName()
    );
    if (teamPermissions && teamPermissions.length !== 0) {
      callback();
    } else {
      this.closeComponentTimer();
    }
  };

  handleError = err => {
    const { componentTimer } = this.state;
    const { dispatch } = this.props;
    const { group_id } = this.fetchParameter();

    this.handleTeamPermissions(() => {
      if (!componentTimer) {
        return null;
      }
      if (err && err.status === 404) {
        this.closeComponentTimer();
        if (!this.destroy) {
          dispatch(
            routerRedux.push(`${this.fetchPrefixUrl()}apps/${group_id}`)
          );
        }
        return null;
      }
      if (err && err.data && err.data.msg_show) {
        notification.warning({
          message: `请求错误`,
          description: err.data.msg_show
        });
      }
    });
    return null;
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

  handleTabChange = key => {
    const { dispatch } = this.props;
    const { app_alias, service_id } = this.fetchParameter();

    dispatch(
      routerRedux.push(
        `${this.fetchPrefixUrl()}components/${app_alias}/${key}/service_id/${service_id}`
      )
    );
  };

  closeTimer = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  loadBuildState = appDetail => {
    const { team_name, serviceAlias } = this.fetchParameter();
    const { dispatch } = this.props;
    if (
      appDetail &&
      appDetail.service &&
      appDetail.service.service_source === 'market'
    ) {
      dispatch({
        type: 'appControl/getBuildInformation',
        payload: {
          team_name,
          app_alias: serviceAlias
        },
        callback: res => {
          if (res && res.status_code === 200) {
            this.setState({
              BuildState:
                res.list && res.list.length > 0 ? res.list.length : null
            });
          }
        }
      });
    }
  };
  fetchPrefixUrl = () => {
    const { team_name, region_name } = this.fetchParameter();
    return `/team/${team_name}/region/${region_name}/`;
  };
  loadDetail = () => {
    const { dispatch } = this.props;
    const {
      app_alias,
      team_name,
      group_id,
      serviceAlias
    } = this.fetchParameter();
    const prefixUrl = this.fetchPrefixUrl();
    dispatch({
      type: 'appControl/fetchDetail',
      payload: {
        team_name,
        app_alias
      },
      callback: appDetail => {
        this.fetchAppDetail();
        this.loadBuildState(appDetail);
        if (appDetail.service.service_source) {
          this.setState({
            isShowThirdParty: appDetail.is_third ? appDetail.is_third : false
          });
        }
        if (
          !appUtil.isCreateComplete(appDetail) &&
          !appUtil.isMarketApp(appDetail)
        ) {
          if (
            appDetail.service &&
            appDetail.service.create_status === 'complete'
          ) {
            this.getStatus(false);
          } else if (!appUtil.isCreateFromCompose(appDetail)) {
            serviceAlias &&
              dispatch(
                routerRedux.replace(
                  `${prefixUrl}create/create-check/${serviceAlias}`
                )
              );
          } else {
            dispatch(
              routerRedux.replace(
                `${prefixUrl}create/create-compose-check/${group_id}/${appDetail.service.compose_id}`
              )
            );
          }
        } else {
          this.getStatus(false);
        }
        // get websocket url and create client
        this.getWebSocketUrl(appDetail.service.service_id);
      },
      handleError: data => {
        const { componentTimer } = this.state;
        if (!componentTimer) {
          return null;
        }
        if (data.status === 404) {
          dispatch(routerRedux.push(`${prefixUrl}exception/404`));
        }
        return null;
      }
    });
  };
  fetchParameter = () => {
    const { appDetail, match } = this.props;
    const service = appDetail && appDetail.service;
    return {
      app_alias: match && match.params && match.params.appAlias,
      team_name: globalUtil.getCurrTeamName(),
      region_name: globalUtil.getCurrRegionName(),
      serviceAlias: service && service.service_alias,
      group_id: service && service.group_id,
      group_name: service && service.group_name,
      service_cname: service && service.service_cname,
      k8s_component_name: service && service.k8s_component_name,
      service_id: service && service.service_id
    };
  };
  // 应用详情
  fetchAppDetail = () => {
    const { dispatch } = this.props;
    const { team_name, region_name, group_id } = this.fetchParameter();

    dispatch({
      type: 'application/fetchGroupDetail',
      payload: {
        team_name,
        region_name,
        group_id
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            groupDetail: res.bean,
            loadingDetail: false
          });
        }
      },
      handleError: res => {
        if (res && res.code === 404) {
          dispatch(routerRedux.push(`${this.fetchPrefixUrl()}apps`));
        }
      }
    });
  };

  handleshowDeployTips = showonoff => {
    this.setState({ showDeployTips: showonoff });
  };
  handleDeploy = groupVersion => {
    this.setState({
      showDeployTips: false,
      showreStartTips: false
    });
    const { build_upgrade, dispatch, appDetail } = this.props;
    if (this.state.actionIng) {
      notification.warning({ message: `正在执行操作，请稍后` });
      return;
    }
    const { team_name, app_alias } = this.fetchParameter();

    dispatch({
      type: groupVersion ? 'appControl/putUpgrade' : 'appControl/putDeploy',
      payload: {
        team_name,
        app_alias,
        group_version: groupVersion || '',
        is_upgrate: build_upgrade
      },
      callback: res => {
        if (res) {
          this.handleCancelBuild();
          this.loadBuildState(appDetail);
          notification.success({ message: `操作成功，部署中` });
          const child = this.getChildCom();

          if (child && child.onLogPush) {
            child.onLogPush(true);
          }
          if (child && child.onAction) {
            child.onAction(res.bean);
          }
        }
        this.handleOffHelpfulHints();
      }
    });
  };
  handleRollback = datas => {
    if (this.state.actionIng) {
      notification.warning({ message: `正在执行操作，请稍后` });
      return;
    }
    const { team_name, app_alias } = this.fetchParameter();

    rollback({
      team_name,
      app_alias,
      deploy_version: datas.build_version
        ? datas.build_version
        : datas.deploy_version
        ? datas.deploy_version
        : '',
      upgrade_or_rollback: datas.upgrade_or_rollback
        ? datas.upgrade_or_rollback
        : -1
    }).then(data => {
      if (data) {
        notification.success({
          message: datas.upgrade_or_rollback
            ? datas.upgrade_or_rollback == 1
              ? `操作成功，升级中`
              : `操作成功，回滚中`
            : `操作成功，回滚中`
        });
        const child = this.getChildCom();
        if (child && child.onAction) {
          child.onAction(data.bean);
        }
      }
    });
  };
  handleshowRestartTips = showonoff => {
    this.setState({ showreStartTips: showonoff });
  };

  saveRef = ref => {
    this.ref = ref;
  };
  handleDropClick = item => {
    if (item === 'deleteApp') {
      this.closeComponentTimer();
      this.onDeleteApp();
    }

    if (item === 'moveGroup') {
      this.showMoveGroup();
    }
    if (item === 'restart') {
      this.setState({
        promptModal: 'restart'
      });
    }
  };
  closeComponentTimer = () => {
    this.setState({ componentTimer: false });
    this.closeTimer();
  };
  openComponentTimer = () => {
    this.setState({ componentTimer: true }, () => {
      this.getStatus(true);
    });
  };

  cancelDeleteApp = (isOpen = true) => {
    this.setState({ showDeleteApp: false });
    if (isOpen) {
      this.openComponentTimer();
    }
  };
  createSocket() {
    const { appDetail } = this.props;
    const { websocketURL } = this.state;
    if (websocketURL) {
      const isThrough = dateUtil.isWebSocketOpen(websocketURL);
      if (isThrough && isThrough === 'through') {
        this.socket = new AppPubSubSocket({
          url: websocketURL,
          serviceId: appDetail.service.service_id,
          isAutoConnect: true,
          destroyed: false
        });
      }
    }
  }
  handleDeleteApp = () => {
    const { dispatch } = this.props;
    const { team_name, app_alias, group_id } = this.fetchParameter();

    dispatch({
      type: 'appControl/deleteApp',
      payload: {
        team_name,
        app_alias
      },
      callback: () => {
        this.closeComponentTimer();
        this.cancelDeleteApp(false);
        dispatch({
          type: 'global/fetchGroups',
          payload: {
            team_name
          }
        });
        dispatch(
          routerRedux.replace(`${this.fetchPrefixUrl()}apps/${group_id}`)
        );
      }
    });
  };
  showEditName = () => {
    this.setState({ showEditName: true });
  };
  hideEditName = () => {
    this.setState({ showEditName: false });
  };
  handleEditName = data => {
    const { team_name, serviceAlias, group_id } = this.fetchParameter();
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/editName',
      payload: {
        team_name,
        app_alias: serviceAlias,
        ...data
      },
      callback: () => {
        dispatch({
          type: 'application/editGroups',
          payload: {
            team_name,
            group_id
          },
          callback: res => {
            notification.success({ message: '重启应用后生效' });
          }
        });
        this.handleUpDataHeader();
        this.loadDetail();
        this.hideEditName();
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
  showMoveGroup = () => {
    this.setState({ showMoveGroup: true });
  };
  hideMoveGroup = () => {
    this.setState({ showMoveGroup: false });
  };
  handleMoveGroup = data => {
    const { team_name, serviceAlias } = this.fetchParameter();
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/moveGroup',
      payload: {
        team_name,
        app_alias: serviceAlias,
        ...data
      },
      callback: () => {
        this.hideMoveGroup();
        this.loadDetail();
        dispatch({
          type: 'global/fetchGroups',
          payload: {
            team_name
          }
        });
        notification.success({ message: '操作成功' });
      }
    });
  };
  handleOperation = state => {
    const { dispatch } = this.props;
    const { actionIng } = this.state;
    if (state === 'putUpdateRolling') {
      this.setState({
        showDeployTips: false,
        showreStartTips: false
      });
    } else if (state === 'putReStart') {
      this.setState({ showreStartTips: false });
    }
    if (actionIng) {
      notification.warning({ message: `正在执行操作，请稍后` });
      return;
    }
    const operationMap = {
      putReStart: '操作成功，重启中',
      putStart: '操作成功，启动中',
      putStop: '操作成功，关闭中',
      putUpdateRolling: '操作成功，更新中'
    };
    const { team_name, app_alias } = this.fetchParameter();

    dispatch({
      type: `appControl/${state}`,
      payload: {
        team_name,
        app_alias
      },
      callback: res => {
        if (res) {
          notification.success({
            message: operationMap[state]
          });
          const child = this.getChildCom();
          if (child && child.onAction) {
            child.onAction(res.bean);
          }
        }
        this.handleOffHelpfulHints();
      }
    });
  };

  handleChecked = value => {
    const { dispatch } = this.props;
    const { team_name, app_alias } = this.fetchParameter();
    dispatch({
      type: 'appControl/changeApplicationState',
      payload: {
        build_upgrade: value,
        team_name,
        app_alias
      },
      callback: data => {
        if (data) {
          notification.info({ message: '修改成功' });
        }
      }
    });
  };
  handleOkBuild = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.handleDeploy(fieldsValue.group_version);
      }
    });
  };
  handleOpenBuild = () => {
    const { appDetail, dispatch } = this.props;
    const buildType = appDetail.service.service_source;
    const text = appDetail.rain_app_name;
    const { status } = this.state;
    const { team_name, serviceAlias } = this.fetchParameter();

    if (buildType === 'market' && status && status.status !== 'undeploy') {
      dispatch({
        type: 'appControl/getBuildInformation',
        payload: {
          team_name,
          app_alias: serviceAlias
        },
        callback: res => {
          if (res && res.status_code === 200) {
            this.setState({
              BuildList: res.list,
              visibleBuild: true,
              BuildText: text,
              BuildState:
                res.list && res.list.length > 0 ? res.list.length : null,
              showApp: {
                details: false,
                group_name: text
              }
            });
          }
        }
      });
    } else {
      this.handleOpenHelpfulHints('deploy');
    }
  };
  handleCancelBuild = () => {
    this.setState({
      visibleBuild: null,
      BuildText: ''
    });
  };
  hideMarketAppDetail = () => {
    this.setState({
      showMarketAppDetail: null
    });
  };
  hideMarketOpenAppDetail = () => {
    this.setState({
      showMarketAppDetail: true
    });
  };
  handleOpenHelpfulHints = promptModal => {
    this.setState({
      promptModal
    });
  };
  handleOffHelpfulHints = () => {
    this.setState({
      promptModal: null
    });
  };
  handleJumpAgain = () => {
    const { promptModal } = this.state;
    if (promptModal === 'deploy') {
      this.handleDeploy();
      return null;
    }
    const parameter =
      promptModal === 'stop'
        ? 'putStop'
        : promptModal === 'start'
        ? 'putStart'
        : promptModal === 'restart'
        ? 'putReStart'
        : promptModal === 'rolling'
        ? 'putUpdateRolling'
        : '';
    this.handleOperation(parameter);
  };
  toWebConsole = () => {
    const { dispatch } = this.props;
    const { serviceAlias } = this.fetchParameter();
    dispatch(
      routerRedux.replace(
        `${this.fetchPrefixUrl()}components/${serviceAlias}/webconsole`
      )
    );
  };
  renderHeaderTitle() {
    return (
      <>
        <div className={styles['header-title']}>
          <div className={styles.title}>应用管理</div>
          <div className={styles.back} onClick={this.goBack}>
            <img src={GobackImg} alt="" />
          </div>
        </div>
      </>
    );
  }
  renderTitle(name) {
    const {
      appDetail,
      componentPermissions: { isRestart, isStop, isDelete, isEdit },
      appPermissions: { isEdit: isAppEdit }
    } = this.props;
    const { status, groupDetail, loadingDetail } = this.state;
    const isHelm =
      groupDetail && groupDetail.app_type && groupDetail.app_type === 'helm';
    return (
      <Fragment>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              lineHeight: '48px'
            }}
          >
            {/* {globalUtil.fetchSvg('component')} */}
            <img src={AppImg} alt="" />
          </div>
          <div style={{ marginLeft: '14px' }}>
            <div className={styles.contentTitle}>
              {name || '-'}
              {isEdit && (
                <Tooltip placement="top" title="修改组件名称">
                  <Icon
                    style={{
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                    onClick={this.showEditName}
                    type="edit"
                  />
                </Tooltip>
              )}
            </div>
            <div className={styles.content_Box}>
              {!appDetail.is_third && isRestart && (
                <Tooltip
                  placement="top"
                  title="对组件进行重启操作，该操作不会更新组件代码或镜像"
                >
                  <a
                    onClick={() => {
                      if (appStatusUtil.canRestart(status)) {
                        this.handleDropClick('restart');
                      }
                    }}
                    style={{
                      cursor: !appStatusUtil.canRestart(status)
                        ? 'no-drop'
                        : 'pointer'
                    }}
                  >
                    重启
                  </a>
                </Tooltip>
              )}
              {!appDetail.is_third && isRestart && <Divider type="vertical" />}

              {isStop && !appStatusUtil.canStart(status) ? (
                <Tooltip
                  placement="top"
                  title="关闭组件所有运行实例，释放组件占用的资源"
                >
                  <span>
                    <a
                      style={{
                        cursor: !appStatusUtil.canStop(status)
                          ? 'no-drop'
                          : 'pointer'
                      }}
                      onClick={() => {
                        if (appStatusUtil.canStop(status)) {
                          this.handleOpenHelpfulHints('stop');
                        }
                      }}
                    >
                      关闭
                    </a>
                    <Divider type="vertical" />
                  </span>
                </Tooltip>
              ) : isStop &&
                status &&
                status.status &&
                status.status === 'upgrade' ? (
                <Tooltip
                  placement="top"
                  title="关闭组件所有运行实例，释放组件占用的资源"
                >
                  <span>
                    <a
                      onClick={() => {
                        this.handleOpenHelpfulHints('stop');
                      }}
                    >
                      关闭
                    </a>
                    <Divider type="vertical" />
                  </span>
                </Tooltip>
              ) : null}

              {isAppEdit && !loadingDetail && !isHelm && (
                <Tooltip
                  placement="top"
                  title="调整组件和应用的绑定关系，组件可以灵活变更所属的应用"
                >
                  <a
                    onClick={() => {
                      this.handleDropClick('moveGroup');
                    }}
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    修改所属应用
                  </a>
                </Tooltip>
              )}
              {isEdit && !loadingDetail && !isHelm && (
                <Divider type="vertical" />
              )}
              {isDelete && (
                <Tooltip
                  placement="top"
                  title="对组件进行删除操作，删除组件是一个危险的操作，请慎用"
                >
                  <a
                    onClick={() => {
                      this.handleDropClick('deleteApp');
                    }}
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    删除
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  action = ({ upDataText, visitBtns, serviceAlias }) => {
    const {
      appDetail,
      componentPermissions: {
        isAccess,
        isStart,
        isVisitWebTerminal,
        isConstruct,
        isUpdate,
        isCharacteristic,
        isHealth
      },
      buildInformationLoading
    } = this.props;
    const { isShowThirdParty, status } = this.state;
    return (
      <div className={styles.actions}>
        {isStart && !appStatusUtil.canStop(status) && (
          <Button
            disabled={!appStatusUtil.canStart(status)}
            onClick={() => {
              this.handleOpenHelpfulHints('start');
            }}
          >
            启动
          </Button>
        )}

        {/* {isShowFileManager && (
          <Button>
            <Link
              to={`${this.fetchPrefixUrl()}components/${serviceAlias}/filemanager/service_id/${service_id}`}
              target="_blank"
            >
              文件管理
            </Link>
          </Button>
        )} */}
        {isVisitWebTerminal && !isShowThirdParty && (
          <Tooltip
            placement="top"
            title="进入当前组件运行容器的Web 终端控制页面，可同时打开多个Web终端"
          >
            <Button>
              <Link
                to={`${this.fetchPrefixUrl()}components/${serviceAlias}/webconsole`}
                target="_blank"
              >
                Web终端
              </Link>
            </Button>
          </Tooltip>
        )}

        {isShowThirdParty ? (
          ''
        ) : this.state.BuildState && isConstruct ? (
          <Tooltip title="有新版本">
            <Button
              onClick={this.handleOpenBuild}
              loading={buildInformationLoading}
            >
              <Badge
                className={styles.badge}
                status="success"
                text=""
                count="有更新版本"
                title="有更新版本"
              />
              构建
            </Button>
          </Tooltip>
        ) : status && status.status === 'undeploy' && isConstruct ? (
          <Tooltip
            placement="top"
            title="从构建源获取最新的代码或镜像构建组件的新版本，默认情况下构建成功后将触发滚动升级"
          >
            <Button
              onClick={this.handleOpenBuild}
              loading={buildInformationLoading}
            >
              构建
            </Button>
          </Tooltip>
        ) : (
          isConstruct && (
            <Tooltip
              placement="top"
              title="从构建源获取最新的代码或镜像构建组件的新版本，默认情况下构建成功后将触发滚动升级"
            >
              <Button
                onClick={this.handleOpenBuild}
                loading={buildInformationLoading}
              >
                构建
              </Button>
            </Tooltip>
          )
        )}

        {status.status === 'undeploy' ||
        status.status === 'closed' ||
        status.status === 'stopping'
          ? ''
          : isUpdate && (
              <Tooltip
                placement="top"
                title={`以最新的组件配置属性对组件实例进行${!isShowThirdParty &&
                  '滚动'}升级`}
              >
                <Button
                  onClick={() => {
                    this.handleOpenHelpfulHints('rolling');
                  }}
                >
                  {upDataText}
                </Button>
              </Tooltip>
            )}

        {appDetail.service.service_source === 'market' &&
          appStatusUtil.canVisit(status) &&
          !isShowThirdParty &&
          isAccess &&
          visitBtns}
        {appDetail.service.service_source !== 'market' &&
          appStatusUtil.canVisit(status) &&
          !isShowThirdParty &&
          isAccess &&
          visitBtns}
        {isShowThirdParty && isAccess && visitBtns}
      </div>
    );
  };

  render() {
    const {
      appDetail,
      currentEnterprise,
      currentTeam,
      currentRegionName,
      componentPermissions: {
        isAccess,
        isStart,
        isVisitWebTerminal,
        isConstruct,
        isUpdate,
        isTelescopic,
        isEnv,
        isRely,
        isStorage,
        isPort,
        isPlugin,
        isSource,
        isDeploytype,
        isCharacteristic,
        isHealth
      },
      appPermissions,
      componentPermissions,
      groups = [],
      form,
      deleteAppLoading,
      reStartLoading,
      startLoading,
      stopLoading,
      moveGroupLoading,
      editNameLoading,
      updateRollingLoading,
      deployLoading,
      buildInformationLoading
    } = this.props;
    const {
      BuildList,
      componentTimer,
      isShowThirdParty,
      status,
      promptModal,
      showDeleteApp,
      showEditName,
      showMoveGroup,
      groupDetail
    } = this.state;
    const { getFieldDecorator } = form;
    const upDataText = isShowThirdParty ? '更新' : '更新(滚动）';
    const codeObj = {
      start: '启动',
      restart: '重启',
      stop: '关闭',
      deploy: '构建',
      rolling: upDataText
    };
    if (!appDetail.service) {
      return null;
    }
    const { is_filebrowser_plugin: isShowFileManager } = appDetail.service;
    const {
      serviceAlias,
      app_alias: appAlias,
      group_id,
      group_name: appName,
      service_cname: componentName,
      k8s_component_name: k8sComponentName,
      service_id
    } = this.fetchParameter();
    const visitBtns = (
      <VisitBtn
        timers={componentTimer}
        btntype="primary"
        app_alias={appAlias}
      />
    );

    if (!status.status) {
      return (
        <div style={{ width: '100%', textAlign: 'center', marginTop: 400 }}>
          <Spin spinning={true} tip="loading..."></Spin>
        </div>
      );
    }

    const tabs = [
      {
        key: 'overview',
        tab: '总览',
        tooltip: '组件总览视图，包含了组件的基本信息'
      },
      {
        key: 'monitor',
        tab: '监控',
        tooltip:
          '图形化展示组件运行监控信息，包括：性能分析，资源监控，业务监控等'
      },
      {
        key: 'log',
        tab: '实时日志',
        tooltip:
          '实时推送的形式展示组件运行日志，通过查询历史日志文件获取历史日志。'
      }
      // ,
      // {
      //   key: 'log2',
      //   tab: '日志'
      // },
    ];

    if (isTelescopic) {
      tabs.push({
        key: 'expansion',
        tab: '伸缩',
        tooltip: '对组件运行实例进行手动伸缩，也可配置规则开通组件自动伸缩'
      });
    }

    if (isEnv) {
      tabs.push({
        key: 'environmentConfiguration',
        tab: '环境配置',
        tooltip: '对组件的环境变量和配置文件进行配置管理'
      });
    }

    if (isRely) {
      tabs.push({
        key: 'relation',
        tab: '依赖',
        tooltip: '配置组件的链接信息和依赖其他组件的信息'
      });
    }

    if (isStorage) {
      tabs.push({
        key: 'mnt',
        tab: '存储',
        tooltip: '为组件配置存储，可以新建存储配置，也可以共享其他组件存储'
      });
    }

    if (isPort) {
      tabs.push({
        key: 'port',
        tab: '端口',
        tooltip: '为组件配置对内和对外访问的协议和端口'
      });
    }

    if (isPlugin) {
      tabs.push({
        key: 'plugin',
        tab: '插件',
        tooltip: '为组件开通插件，扩展组件的运维能力'
      });
    }

    if (isSource) {
      tabs.push({
        key: 'resource',
        tab: '构建源',
        tooltip: '对组件的构建源进行配置，构建源包括：源码、镜像和应用市场'
      });
    }

    if (isDeploytype || isCharacteristic || isHealth) {
      tabs.push({
        key: 'setting',
        tab: '其他设置',
        tooltip: '对组件的部署类型，组件特性，构建升级策略，健康检测等进行配置'
      });
    }

    const tabList = isShowThirdParty
      ? [
          {
            key: 'thirdPartyServices',
            tab: '总览',
            tooltip: '组件总览视图，包含了组件的基本信息'
          },
          {
            key: 'port',
            tab: '端口',
            tooltip: '为组件配置对内和对外访问的协议和端口'
          },
          {
            key: 'connectionInformation',
            tab: '连接信息',
            tooltip: '-'
          },
          {
            key: 'members',
            tab: '更多设置',
            tooltip: '-'
          }
        ]
      : tabs;
    // const { service_source, language } = this.state;
    const map = {
      thirdPartyServices: ThirdPartyServices,
      connectionInformation: ConnectionInformation,
      members: Members,
      overview: isShowThirdParty ? ThirdPartyServices : Overview,
      monitor: Monitor,
      log: Log,
      log2: Log2,
      expansion: Expansion,
      environmentConfiguration: EnvironmentConfiguration,
      relation: Relation,
      mnt: Mnt,
      port: Port,
      plugin: Plugin,
      resource: Resource,
      setting: Setting
    };
    let { type } = this.props.match.params;

    if (!type) {
      type = isShowThirdParty ? 'thirdPartyServices' : 'overview';
    }
    const Com = map[type];
    const formItemLayout = {
      labelCol: {
        span: 1
      },
      wrapperCol: {
        span: 23
      }
    };
    let breadcrumbList = [];
    // console.timeEnd();

    breadcrumbList = createComponent(
      createApp(
        createTeam(
          createEnterprise(breadcrumbList, currentEnterprise),
          currentTeam,
          currentRegionName
        ),
        currentTeam,
        currentRegionName,
        {
          appName,
          appID: group_id
        }
      ),
      currentTeam,
      currentRegionName,
      {
        componentName,
        componentID: serviceAlias
      }
    );

    // console.timeEnd();
    return (
      <PageHeaderLayout
        breadcrumbList={breadcrumbList}
        action={this.action({
          upDataText,
          visitBtns,
          serviceAlias
        })}
        title={this.renderTitle(componentName)}
        headerTitle={
          <div className={styles['header-title']}>
            <div className={styles.title}>组件管理</div>
            <div
              className={styles.back}
              onClick={() => this.props.history.goBack()}
            >
              <img src={GobackImg} alt="" />
            </div>
          </div>
        }
        onTabChange={this.handleTabChange}
        tabActiveKey={type}
        tabList={tabList}
      >
        {this.state.showMarketAppDetail && (
          <MarketAppDetailShow
            onOk={this.hideMarketAppDetail}
            onCancel={this.hideMarketAppDetail}
            app={this.state.showApp}
          />
        )}

        {promptModal && (
          <Modal
            title="友情提示"
            visible={promptModal}
            className={styless.TelescopicModal}
            onOk={this.handleJumpAgain}
            onCancel={this.handleOffHelpfulHints}
            confirmLoading={
              promptModal === 'restart'
                ? reStartLoading
                : promptModal === 'stop'
                ? stopLoading
                : promptModal === 'start'
                ? startLoading
                : promptModal === 'deploy'
                ? deployLoading
                : promptModal === 'rolling'
                ? updateRollingLoading
                : !promptModal
            }
          >
            <p style={{ textAlign: 'center' }}>
              确定{codeObj[promptModal]}当前组件？
            </p>
          </Modal>
        )}
        <Modal
          title={[<span>从应用商店升级构建</span>]}
          className={styless.TelescopicModal}
          visible={this.state.visibleBuild}
          onOk={this.handleOkBuild}
          onCancel={this.handleCancelBuild}
          afterClose={() => {
            this.setState({ BuildList: [] });
          }}
          footer={
            BuildList && BuildList.length > 0 && isConstruct
              ? [
                  <Button
                    onClick={() => {
                      this.handleCancelBuild();
                    }}
                  >
                    取消
                  </Button>,
                  <Button
                    type="primary"
                    loading={deployLoading}
                    onClick={() => {
                      this.handleOkBuild();
                    }}
                  >
                    构建
                  </Button>
                ]
              : isConstruct && [
                  <Button
                    onClick={() => {
                      this.handleCancelBuild();
                    }}
                  >
                    取消
                  </Button>,
                  <Button
                    type="primary"
                    loading={deployLoading}
                    onClick={() => {
                      this.handleOkBuild();
                    }}
                  >
                    强制构建
                  </Button>
                ]
          }
        >
          <div>
            {BuildList && BuildList.length > 0 && isUpdate ? (
              <Form onSubmit={this.handleOkBuild}>
                <Alert
                  message={[
                    <span>从应用商店应用 </span>,
                    <a
                      onClick={() => {
                        this.hideMarketOpenAppDetail();
                      }}
                    >
                      {this.state.BuildText}
                    </a>,
                    <span>构建而来,当前云市应用版本有更新!</span>
                  ]}
                  type="success"
                  style={{ marginBottom: '5px' }}
                />
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('group_version', {
                    initialValue: BuildList[0],
                    rules: [{ required: true, message: '选择版本' }]
                  })(
                    <RadioGroup>
                      {BuildList.map((item, index) => {
                        return (
                          <div>
                            版本:&nbsp;
                            <Radio key={index} value={item}>
                              <a>{item}</a>可更新
                            </Radio>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </Form.Item>
              </Form>
            ) : (
              <Alert
                message="云市应用暂未有新版本更新，您无需构建。"
                type="success"
                style={{ marginBottom: '5px' }}
              />
            )}
          </div>
        </Modal>

        {Com ? (
          <Com
            groupDetail={groupDetail}
            appPermissions={appPermissions}
            componentPermissions={componentPermissions}
            timers={componentTimer}
            status={status}
            ref={this.saveRef}
            {...this.props.match.params}
            {...this.props}
            onshowDeployTips={msg => {
              this.handleshowDeployTips(msg);
            }}
            onshowRestartTips={msg => {
              this.handleshowRestartTips(msg);
            }}
            socket={this.socket}
            onChecked={this.handleChecked}
          />
        ) : (
          '参数错误'
        )}

        {showDeleteApp && (
          <ConfirmModal
            onOk={this.handleDeleteApp}
            onCancel={this.cancelDeleteApp}
            loading={deleteAppLoading}
            title="删除组件"
            desc="确定要删除此组件吗？"
            subDesc="此操作不可恢复"
          />
        )}
        {showEditName && (
          <EditName
            loading={editNameLoading}
            name={componentName}
            onOk={this.handleEditName}
            onCancel={this.hideEditName}
            title="修改组件名称"
            k8sComponentName={k8sComponentName}
            isEditEnglishName={status.status}
          />
        )}
        {showMoveGroup && (
          <MoveGroup
            loading={moveGroupLoading}
            currGroup={group_id}
            groups={groups}
            onOk={this.handleMoveGroup}
            onCancel={this.hideMoveGroup}
          />
        )}
      </PageHeaderLayout>
    );
  }
}

@Form.create()
@connect(
  ({ teamControl }) => ({
    currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
  }),
  null,
  null,
  {
    pure: false,
    withRef: true
  }
)
export default class Index extends PureComponent {
  constructor(arg) {
    super(arg);
    this.id = '';
    this.state = {
      show: true,
      componentPermissions: this.handlePermissions('queryComponentInfo'),
      appPermissions: this.handlePermissions('queryAppInfo')
    };
  }
  UNSAFE_componentWillMount() {
    const { dispatch } = this.props;
    const {
      componentPermissions: { isAccess }
    } = this.state;
    if (!isAccess) {
      globalUtil.withoutPermission(dispatch);
    }
  }
  handlePermissions = type => {
    const { currentTeamPermissionsInfo } = this.props;
    return roleUtil.querySpecifiedPermissionsInfo(
      currentTeamPermissionsInfo,
      type
    );
  };
  getAlias = () => {
    return this.props.match.params.appAlias;
  };
  componentDidMount() {}
  flash = () => {
    this.setState(
      {
        show: false
      },
      () => {
        this.setState({ show: true });
      }
    );
  };
  render() {
    // Switching applications show
    if (this.id !== this.getAlias()) {
      this.id = this.getAlias();
      this.flash();
    }
    if (!this.state.show) {
      return null;
    }
    return <Main {...this.props} {...this.state} />;
  }
}
