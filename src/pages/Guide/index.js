/* eslint-disable import/no-named-default */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
import {
  Button,
  Card,
  Divider,
  Form,
  Icon,
  Modal,
  notification,
  Select,
  Spin
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import {
  default as AddGroup,
  default as EditGroupName
} from '../../components/AddOrEditGroup';
import configureGlobal from '../../utils/configureGlobal';
import globalUtil from '../../utils/global';
import guideUtil from '../../utils/guide';
import wutongUtil from '../../utils/wutong';
import { languageObj } from '../../utils/utils';
import styles from './index.less';

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 5
  },
  wrapperCol: {
    span: 19
  }
};

@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  groups: global.groups,
  loading: loading.models.list,
  wutongInfo: global.wutongInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  overviewInfo: index.overviewInfo
}))
@Form.create()
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      addApplication: false,
      ServiceVisible: false,
      GuideList: [],
      ServiceList: null,
      SpinState: true
    };
  }

  componentDidMount() {
    this.getGuideState();
  }
  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  };

  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  };

  getGuideState = () => {
    this.props.dispatch({
      type: 'global/getGuideState',
      payload: {
        enterprise_id: this.props.user.enterprise_id
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            GuideList: res.list,
            SpinState: false,
            current:
              res.list && res.list.length > 0 && !res.list[0].status
                ? 0
                : !res.list[1].status
                ? 1
                : !res.list[2].status
                ? 2
                : !res.list[3].status
                ? 3
                : !res.list[4].status
                ? 4
                : !res.list[5].status
                ? 5
                : !res.list[6].status
                ? 6
                : 7
          });
        }
      }
    });
  };

  handleCancelApplication = () => [
    this.setState({
      addApplication: false
    })
  ];

  handleOkApplication = groupId => {
    const { dispatch } = this.props;
    notification.success({ message: '????????????' });
    this.handleCancelApplication();
    dispatch(
      routerRedux.push(
        `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/apps/${groupId}`
      )
    );
  };

  handleShare = group_id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'application/ShareGroup',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        group_id
      },
      callback: data => {
        if (data && data.bean.step === 1) {
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/groups/share/one/${
                data.bean.group_id
              }/${data.bean.ID}`
            )
          );
        }
        if (data && data.bean.step === 2) {
          dispatch(
            routerRedux.push(
              `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/groups/share/two/${
                data.bean.group_id
              }/${data.bean.ID}`
            )
          );
        }
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.handleShare(fieldsValue.group_id);
        this.setState({ ServiceVisible: false });
      }
    });
  };

  onAddGroup = () => {
    this.setState({ addGroup: true });
  };
  cancelAddGroup = () => {
    this.setState({ addGroup: false });
  };

  handleAddGroup = groupId => {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ group_id: groupId });
    this.cancelAddGroup();
  };

  handleOnchange = () => {
    const { dispatch, form } = this.props;
    const groupId = form.getFieldValue('group_id');
    dispatch({
      type: 'application/fetchApps',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName(),
        group_id: groupId,
        page: 1,
        page_size: 80
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState({
            ServiceList: data.list || []
          });
        }
      }
    });
  };

  completedShow = () => {
    return <span style={{ color: 'rgb(82, 196, 26)' }}>?????????</span>;
  };
  lineShow = () => {
    return <Divider>????????????????????????????????????</Divider>;
  };
  getGuide = guideKey => {
    let guide = { key: guideKey, status: false };
    this.state.GuideList.map(item => {
      if (item.key == guideKey) {
        guide = item;
      }
    });
    return guide;
  };

  CreateApp = () => {
    const grade = this.getGuide('app_create');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);
    if (!grade) {
      return '';
    }
    return (
      <div
        className={styles.connect}
        style={{ borderColor: grade.status ? '#1890ff' : '#A8A2A2' }}
      >
        <Icon
          className={styles.icono}
          type="caret-up"
          theme="filled"
          style={{ color: grade.status ? '#1890ff' : '#A8A2A2' }}
        />
        <p>
          ???????????????????????????N??????????????????????????????Maven???Dotnet??????Project???????????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p>
          1. ??????????????????????????????????????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-manage/app-topology/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. ???????????????????????????????????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-manage/operation/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          3. ?????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-manage/share-app/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          4. ????????????????????????????????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-manage/app-backup/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        {this.lineShow()}
        <p style={{ textAlign: 'center' }}>
          {grade.status ? (
            this.completedShow()
          ) : (
            <Button
              type="primary"
              onClick={() => {
                this.setState({ addApplication: true });
              }}
            >
              ???????????????????????????
            </Button>
          )}
        </p>
      </div>
    );
  };

  CreateSourceCode = () => {
    const grade = this.getGuide('source_code_service_create');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);

    if (!grade) {
      return '';
    }
    return (
      <div
        className={styles.connect}
        style={{ borderColor: grade.status ? '#1890ff' : '#A8A2A2' }}
      >
        <Icon
          className={styles.icont}
          type="caret-up"
          theme="filled"
          style={{ color: grade.status ? '#1890ff' : '#A8A2A2' }}
        />

        <p>
          ???????????????????????????????????????????????????????????????????????????????????????
          <a href={languageObj.Java} target="_blank">
            Java
          </a>
          /
          <a href={languageObj.PHP} target="_blank">
            PHP
          </a>
          /
          <a href={languageObj.Python} target="_blank">
            Python
          </a>
          /
          <a href={languageObj.Nodejs} target="_blank">
            NodeJS
          </a>
          /
          <a href={languageObj.Go} target="_blank">
            Golang
          </a>
          /
          <a href={languageObj.Netcore} target="_blank">
            .NetCore
          </a>
          ????????????????????????????????????????????????
          <a href={languageObj.Java} target="_blank">
            Java
          </a>
          ????????????????????????????????????????????????
        </p>
        <p>
          1. ?????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-creation/language-support/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. Maven?????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/advanced-scenarios/devops/connection-maven-repository/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          3. ??????Git????????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/advanced-scenarios/devops/autobuild/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          4. ??????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-service-manage/service-volume/#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        {this.lineShow()}
        <p>
          ??????????????????: ?????????????????????????????????JavaDemo?????????????????????
          <code style={{ color: '#000000' }}>
            https://github.com/wutong/java-maven-demo.git
          </code>
        </p>
        <p style={{ textAlign: 'center' }}>
          {grade.status ? (
            this.completedShow()
          ) : (
            <div>
              {platform_url && (
                <Button style={{ marginRight: '10px' }}>
                  <a href={`${platform_url}video.html`} target="_blank">
                    ??????????????????
                  </a>
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  this.props.dispatch(
                    routerRedux.push(
                      `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/create/code`
                    )
                  );
                }}
              >
                ?????????????????????????????????
              </Button>
            </div>
          )}
        </p>
      </div>
    );
  };

  CreateByImageTaskShow = () => {
    const grade = this.getGuide('image_service_create');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);

    if (!grade) {
      return '';
    }
    return (
      <div
        className={styles.connect}
        style={{ borderColor: grade.status ? '#1890ff' : '#A8A2A2' }}
      >
        <Icon
          className={styles.icons}
          type="caret-up"
          theme="filled"
          style={{ color: grade.status ? '#1890ff' : '#A8A2A2' }}
        />
        <p>
          ??????????????????????????????????????????????????????????????????????????????????????????????????????Mysql?????????????????????????????????????????????????????????
        </p>
        <p>
          1. ????????????Docker???????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-creation/image-support/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. ????????????DockerCompose?????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-creation/image-support/docker-compose/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        {this.lineShow()}
        <p style={{ textAlign: 'center' }}>
          {grade.status ? (
            this.completedShow()
          ) : (
            <div>
              <p>
                ????????????DockerRun??????????????????????????????
                <code style={{ color: '#000000' }}>
                  docker run -it -e MYSQL_ROOT_PASSWORD=rootpassword mysql
                </code>
              </p>
              <Button
                type="primary"
                onClick={() => {
                  this.props.dispatch(
                    routerRedux.push(
                      `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/create/image/dockerrun`
                    )
                  );
                }}
              >
                ???????????????
              </Button>
            </div>
          )}
        </p>
      </div>
    );
  };

  MarketInstallation = () => {
    const { GuideList } = this.state;

    return (
      <div
        className={styles.connect}
        style={{
          borderColor:
            GuideList && GuideList.length > 0 && GuideList[2].status
              ? '#1890ff'
              : '#A8A2A2'
        }}
      >
        <Icon
          className={styles.icons}
          type="caret-up"
          theme="filled"
          style={{
            color:
              GuideList && GuideList.length > 0 && GuideList[2].status
                ? '#1890ff'
                : '#A8A2A2'
          }}
        />

        <p>
          ??????????????????????????????????????????????????????????????????????????????
          {/* {configureGlobal.wutongTextShow && (
            <a href={languageObj.Rainbond} target="_blank">
              Rainbond
            </a>
          )} */}
          ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????:
        </p>
        <p>1. ?????????????????????????????????</p>
        <p>2. ??????????????????????????????????????????</p>
        <p>3. ????????????????????????</p>
        <p style={{ textAlign: 'center' }}>
          {/* <Button style={{ marginRight: "10px" }}>??????????????????</Button> */}
          {GuideList && GuideList.length > 0 && !GuideList[2].status ? (
            this.completedShow()
          ) : (
            <Button
              type="primary"
              onClick={() => {
                this.props.dispatch(
                  routerRedux.push(
                    `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/create/market`
                  )
                );
              }}
            >
              ?????????
            </Button>
          )}
        </p>
      </div>
    );
  };

  Service = () => {
    const grade = this.getGuide('service_connect_db');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);

    if (!grade) {
      return '';
    }
    return (
      <div
        className={styles.connect}
        style={{ borderColor: grade.status ? '#1890ff' : '#A8A2A2' }}
      >
        <Icon
          className={styles.iconf}
          type="caret-up"
          theme="filled"
          style={{ color: grade.status ? '#1890ff' : '#A8A2A2' }}
        />

        <p>
          ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p>
          1. ????????????????????????????????????????????????????????????/????????????){' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-service-manage/service-rely/#%E6%9C%8D%E5%8A%A1%E4%BE%9D%E8%B5%96%E7%AE%A1%E7%90%86`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. ??????????????????????????????????????????
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-service-manage/service-rely/#%E6%9C%8D%E5%8A%A1%E8%BF%9E%E6%8E%A5%E4%BF%A1%E6%81%AF%E7%AE%A1%E7%90%86`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          3. ????????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-service-manage/service-rely/#%E6%9C%8D%E5%8A%A1%E4%BE%9D%E8%B5%96%E7%AE%A1%E7%90%86`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        {this.lineShow()}
        <p>
          ?????????????????????????????????????????????????????????????????????????????????(??????MYSQL_USER,MYSQL_PASSWORD???)???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p style={{ textAlign: 'center' }}>
          {grade.status ? this.completedShow() : ''}
        </p>
      </div>
    );
  };
  ReleaseMarket = () => {
    const grade = this.getGuide('share_app');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);

    if (!grade) {
      return '';
    }

    return (
      <div
        className={styles.connect}
        style={{
          borderColor: grade.status ? '#1890ff' : '#A8A2A2'
        }}
      >
        <Icon
          className={styles.iconr}
          type="caret-up"
          theme="filled"
          style={{
            color: grade.status ? '#1890ff' : '#A8A2A2'
          }}
        />

        <p>
          ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p>
          1. ?????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-manage/share-app/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. ?????????????????????????????????????????????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/app-store/app-specification/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          3. SaaS???????????????????????????{' '}
          <a href="https://www.wutong.com" target="_blank">
            [??????????????????]
          </a>
        </p>
        {this.lineShow()}
        <p>
          ?????????????????????????????????????????????????????????+?????????????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p style={{ textAlign: 'center' }}>
          {grade.status ? this.completedShow() : ''}
        </p>
      </div>
    );
  };

  AccessStrategy = () => {
    const grade = this.getGuide('custom_gw_rule');
    const { wutongInfo } = this.props;
    const platform_url = wutongUtil.documentPlatform_url(wutongInfo);

    if (!grade) {
      return '';
    }

    return (
      <div
        className={styles.connect}
        style={{
          borderColor: grade.status ? '#1890ff' : '#A8A2A2'
        }}
      >
        <Icon
          className={styles.icona}
          type="caret-up"
          theme="filled"
          style={{
            color: grade.status ? '#1890ff' : '#A8A2A2'
          }}
        />

        <p>
          ???????????????????????????????????????????????????????????????
          {/* <a href={languageObj.Rainbond} target="_blank">
            Rainbond
          </a> */}
          ????????????HTTP/WebSocket/TCP/UDP?????????????????????HTTP???????????????????????????????????????????????????TCP???????????????IP+???????????????????????????????????????????????????????????????????????????
        </p>
        <p>
          1. HTTP??????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/gateway/traffic-control/#%E6%B7%BB%E5%8A%A0-http-%E7%AD%96%E7%95%A5`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          2. HTTPs????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/gateway/cert-management/`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        <p>
          3. TCP??????????????????{' '}
          {platform_url && (
            <a
              href={`${platform_url}docs/user-manual/gateway/traffic-control/#tcp-%E8%AE%BF%E9%97%AE%E7%AD%96%E7%95%A5`}
              target="_blank"
            >
              [????????????]
            </a>
          )}
        </p>
        {this.lineShow()}
        <p>
          ??????????????????????????????????????????????????????????????????????????????????????????????????????IP+?????????TCP??????????????????????????????
        </p>
        <p style={{ textAlign: 'center' }}>
          {grade.status ? (
            this.completedShow()
          ) : (
            <Button
              type="primary"
              onClick={() => {
                this.props.dispatch(
                  routerRedux.push(
                    `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/gateway/control/http/true`
                  )
                );
              }}
            >
              ?????????
            </Button>
          )}
        </p>
      </div>
    );
  };

  AnalysisPlugin = () => {
    const grade = this.getGuide('install_plugin');
    if (!grade) {
      return '';
    }

    return (
      <div
        className={styles.connect}
        style={{
          borderColor: grade.status ? '#1890ff' : '#A8A2A2'
        }}
      >
        <Icon
          className={styles.iconq}
          type="caret-up"
          theme="filled"
          style={{
            color: grade.status ? '#1890ff' : '#A8A2A2'
          }}
        />
        <p>
          ????????????????????????????????????????????????????????????
          {/* <a href={languageObj.Rainbond} target="_blank">
            Rainbond
          </a> */}
          ?????????????????????????????????????????????????????????????????????????????????????????????Java???????????????????????????????????????????????????????????????????????????????????????
        </p>
        <p>1. ???????????????????????????</p>
        <p>2. ??????????????????????????????</p>
        <p>3. ?????????????????????????????????,??????HTTP?????????Mysql???????????????</p>
        {this.lineShow()}
        <p>
          ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????HTTP?????????Mysql??????????????????????????????????????????????????????????????????????????????????????????
          ???????????????????????????????????????????????????
        </p>
        <p style={{ textAlign: 'center' }}>
          {grade.status ? (
            this.completedShow()
          ) : (
            <Button
              type="primary"
              onClick={() => {
                this.props.dispatch(
                  routerRedux.push(
                    `/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/myplugns`
                  )
                );
              }}
            >
              ?????????
            </Button>
          )}
        </p>
      </div>
    );
  };

  render() {
    const {
      current,
      GuideList,
      SpinState,
      ServiceVisible,
      addGroup,
      addApplication
    } = this.state;
    const { groups, form } = this.props;
    const { getFieldDecorator } = form;
    let num = 0;
    const steps = [
      {
        title: '????????????',
        content: configureGlobal.wutongTextShow && this.CreateApp(),
        status: guideUtil.getStatus('app_create', GuideList)
      },
      {
        title: '????????????????????????',
        content: this.CreateSourceCode(),
        status: guideUtil.getStatus('source_code_service_create', GuideList)
      },
      {
        title: '???????????????????????????',
        content: configureGlobal.wutongTextShow && this.CreateByImageTaskShow(),
        status: guideUtil.getStatus('image_service_create', GuideList)
      },
      {
        title: '?????????????????????',
        content: this.Service(),
        status: guideUtil.getStatus('service_connect_db', GuideList)
      },
      {
        title: '???????????????????????????',
        content: this.ReleaseMarket(),
        status: guideUtil.getStatus('share_app', GuideList)
      },
      {
        title: '????????????????????????',
        content: configureGlobal.wutongTextShow && this.AccessStrategy(),
        status: guideUtil.getStatus('custom_gw_rule', GuideList)
      },
      {
        title: '????????????????????????',
        content: this.AnalysisPlugin(),
        status: guideUtil.getStatus('install_plugin', GuideList)
      }
    ];
    if (steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].status) {
          num++;
        }
      }
    }

    return (
      <Card
        style={{
          height: '600px',
          marginBottom: 24
        }}
        bodyStyle={{
          paddingTop: 12
        }}
        bordered={false}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>????????????</span>
            {SpinState ? (
              ''
            ) : (
              <span>
                {num}/7
                <span
                  style={{
                    color: num == 7 ? 'rgb(82, 196, 26)' : 'red',
                    marginLeft: '10px'
                  }}
                >
                  {num == 7 ? '?????????' : '?????????'}
                </span>
              </span>
            )}
          </div>
        }
      >
        {SpinState ? (
          <div
            style={{
              textAlign: 'center',
              height: '400px',
              lineHeight: '400px'
            }}
          >
            <Spin size="large" />{' '}
          </div>
        ) : (
          <div>
            <div className={styles.stepsbox}>
              {steps.map((item, index) => {
                const { status } = item;
                return (
                  <div
                    className={status ? styles.stepssuccess : styles.stepsinfo}
                    key={index}
                    onClick={() => {
                      this.setState({ current: index });
                    }}
                  >
                    <div
                      className={
                        status
                          ? index == 0
                            ? styles.stepssuccesslux1
                            : index == 1
                            ? styles.stepssuccesslux2
                            : index == 2
                            ? styles.stepssuccesslux3
                            : index == 3
                            ? styles.stepssuccesslux4
                            : index == 4
                            ? styles.stepssuccesslux5
                            : index == 5
                            ? styles.stepssuccesslux6
                            : styles.stepssuccesslux7
                          : index == 0
                          ? styles.stepsinfolux1
                          : index == 1
                          ? styles.stepsinfolux2
                          : index == 2
                          ? styles.stepsinfolux3
                          : index == 3
                          ? styles.stepsinfolux4
                          : index == 4
                          ? styles.stepsinfolux5
                          : index == 5
                          ? styles.stepsinfolux6
                          : styles.stepsinfolux7
                      }
                    />
                    <div
                      className={
                        status ? styles.stepssuccessbj : styles.stepsinfobj
                      }
                    >
                      <span>
                        {status && (
                          <svg
                            viewBox="64 64 896 896"
                            data-icon="check"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div
                      className={
                        status
                          ? styles.stepssuccesscontent
                          : styles.stepsinfocontent
                      }
                    >
                      <div>{item.title}</div>
                    </div>
                    <div />
                  </div>
                );
              })}
            </div>

            {ServiceVisible && (
              <Modal
                title="??????????????????????????????"
                visible
                onOk={this.handleSubmit}
                onCancel={() => {
                  this.setState({ ServiceVisible: false });
                }}
              >
                <Form onSubmit={this.handleSubmit} layout="horizontal">
                  <Form.Item {...formItemLayout} label="????????????">
                    {getFieldDecorator('group_id', {
                      initialValue: '',
                      rules: [{ required: true, message: '?????????' }]
                    })(
                      <Select
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        placeholder="????????????????????????"
                        style={{
                          display: 'inline-block',
                          width: 270,
                          marginRight: 15
                        }}
                      >
                        {(groups || []).map(group => (
                          <Option key={group.group_id} value={group.group_id}>
                            {group.group_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Form>
              </Modal>
            )}

            {addGroup && (
              <AddGroup
                onCancel={this.cancelAddGroup}
                onOk={this.handleAddGroup}
              />
            )}

            {addApplication && (
              <EditGroupName
                title="????????????"
                onCancel={this.handleCancelApplication}
                onOk={this.handleOkApplication}
              />
            )}
            <div>{steps[current > 6 ? 6 : current].content}</div>
          </div>
        )}
      </Card>
    );
  }
}
