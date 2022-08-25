/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import {
  Button,
  Card,
  Checkbox,
  Col,
  Icon,
  Modal,
  notification,
  Progress,
  Radio,
  Row,
  Select,
  Upload
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import userUtil from '../../utils/user';
import styles from './index.less';
import UploadImg from '../../../public/images/common/upload.svg';

const { confirm } = Modal;

@connect(({ user, global }) => ({
  user: user.currentUser,
  wutongInfo: global.wutongInfo
}))
export default class EnterpriseShared extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const enterpriseAdmin = userUtil.isCompanyAdmin(user);
    this.state = {
      enterpriseAdmin,
      fileList: [],
      existFileList: [],
      record: {},
      event_id: '',
      file_list: [],
      import_file_status: [],
      userTeamList: [],
      scopeValue: enterpriseAdmin ? 'enterprise' : 'team',
      tenant_name: '',
      percents: false,
      region_name: ''
    };
  }
  componentDidMount() {
    this.loop = true;
    this.queryImportRecord();
    this.getUserTeams();
  }
  componentWillUnmount() {
    this.loop = false;
    this.statusloop = false;
  }
  cancelImport = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'market/cancelImportApp',
      payload: {
        enterprise_id: eid,
        event_id: this.state.event_id
      },
      callback: data => {
        if (data) {
          notification.success({ message: `取消成功` });
          dispatch(routerRedux.push(`/enterprise/${eid}/shared/local`));
        }
      }
    });
  };
  complete = () => {
    if (this.props.onOK) {
      this.props.onOK();
    }
  };
  onChangeUpload = info => {
    let { fileList } = info;
    fileList = fileList.filter(file => {
      if (file.response) {
        return file.response.msg === 'success';
      }
      return true;
    });

    if (info && info.event && info.event.percent) {
      this.setState({
        percents: info.event.percent
      });
    }

    const { status } = info.file;
    if (status === 'done') {
      this.setState({
        percents: false
      });
    }

    this.setState({ fileList });
  };
  onRemove = () => {
    this.setState({ fileList: [] });
  };
  onFileChange = e => {
    this.setState({ file_list: e });
  };
  openQueryImportStatus = () => {
    this.statusloop = true;
    this.queryImportStatus();
  };
  handleSubmit = () => {
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    const { scopeValue, tenant_name, event_id, file_list } = this.state;
    if (file_list.length === 0) {
      notification.destroy();
      notification.warning({
        message: '请至少选择一个应用'
      });
      return;
    }
    if (tenant_name === '' && scopeValue !== 'enterprise') {
      notification.destroy();
      notification.warning({
        message: '请选择一个团队'
      });
      return;
    }

    let fileStr = '';
    file_list.map(app => {
      fileStr += `${app},`;
      return app;
    });
    fileStr = fileStr.slice(0, fileStr.length - 1);
    this.props.dispatch({
      type: 'market/importApp',
      payload: {
        scope: scopeValue,
        tenant_name,
        enterprise_id: eid,
        event_id,
        file_name: fileStr
      },
      callback: data => {
        if (data) {
          notification.success({
            message: '开始导入应用'
          });
          this.loop = false;
          this.openQueryImportStatus();
        }
      }
    });
  };
  queryImportRecord = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;

    dispatch({
      type: 'market/queryImportRecord',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.status_code === 200) {
          if (!res.bean || res.bean.region_name === '') {
            confirm({
              content: '您还未对接集群，应用模版导入功能暂不可用'
            });
          }
          this.setState(
            {
              record: res.bean,
              event_id: res.bean.event_id,
              region_name: res.bean && res.bean.region_name
            },
            () => {
              if (res.bean.region_name !== '') {
                this.openQueryImportStatus();
                this.handleQueryImportDir();
              }
            }
          );
        }
      }
    });
  };
  queryImportStatus = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'market/queryImportApp',
      payload: {
        enterprise_id: eid,
        event_id: this.state.event_id
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState({
            import_file_status: data.list
          });
          if (data.bean && data.bean.status === 'uploading') {
            return;
          }
          if (data.bean && data.bean.status === 'partial_success') {
            notification.success({
              message: '部分应用导入失败，你可以重试或取消导入'
            });
            return;
          }
          if (data.bean && data.bean.status === 'success') {
            notification.success({
              message: '导入完成'
            });

            dispatch(routerRedux.push(`/enterprise/${eid}/shared/local`));

            return;
          }
          if (data.bean && data.bean.status === 'failed') {
            notification.warning({
              message: '应用导入失败'
            });
            this.setState({
              import_file_status: []
            });
            return;
          }
          if (this.statusloop) {
            setTimeout(() => {
              this.queryImportStatus();
            }, 3000);
          }
        }
      },
      handleError: () => {}
    });
  };

  handleQueryImportDir = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'market/queryImportDirApp',
      payload: {
        enterprise_id: eid,
        event_id: this.state.event_id
      },
      callback: data => {
        if (data) {
          this.setState({ existFileList: data.list });
        }
        if (this.loop) {
          setTimeout(() => {
            this.handleQueryImportDir();
          }, 6000);
        }
      },
      handleError: () => {}
    });
  };

  onChangeRadio = e => {
    this.setState({
      scopeValue: e.target.value
    });
  };

  getUserTeams = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'global/fetchMyTeams',
      payload: {
        enterprise_id: eid,
        page: 1,
        page_size: 999
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            userTeamList: res.list
          });
        }
      }
    });
  };

  handleChangeTeam = tenant_name => {
    this.setState({
      tenant_name
    });
  };

  render() {
    const upSvg = () => (
      <svg
        t="1582646117495"
        viewBox="0 0 1026 1024"
        p-id="5405"
        width="23"
        height="23"
      >
        <path
          d="M536.149154 400.348544c56.251093 47.113428 112.500379 94.243113 168.749666 141.372797 20.850997 17.471561 22.241786 33.339199 4.763001 54.179359-17.460724 20.858222-33.353649 22.249011-54.20284 4.779257-34.630646-29.020528-69.259485-58.042862-103.906387-87.045328v448.330764c0 27.203471-11.259972 38.458025-38.477893 38.458024-27.201665 0-38.477893-11.254553-38.477894-38.458024V513.634629a541926.23157 541926.23157 0 0 0-103.906387 87.045328c-20.850997 17.469755-36.72586 16.078966-54.206452-4.779257-17.478786-20.84016-16.086191-36.707798 4.763001-54.179359 56.252899-47.129684 112.502185-94.259369 168.751472-141.372797 16.660568-13.953045 29.490145-13.953045 46.150713 0z"
          fill="#4D73B1"
          p-id="5406"
        />
        <path
          d="M923.532655 8.543418H102.61494C45.939386 8.543418 0 54.477385 0 111.113203v512.865179c0 56.632205 45.939386 102.569785 102.61494 102.569784h217.178022c27.216115 0 38.494149-11.272616 38.494149-38.476087 0-27.187215-11.276228-38.459831-38.494149-38.459831H102.61494c-18.148893 0-25.662766-7.506648-25.662766-25.63206V111.115009c0-18.125412 7.513873-25.633867 25.662766-25.633867h820.917715c18.148893 0 25.66096 7.508454 25.66096 25.633867v512.865179c0 18.125412-7.512067 25.63206-25.66096 25.63206H706.356439c-27.216115 0-38.494149 11.272616-38.494149 38.459831 0 27.205278 11.276228 38.476087 38.494149 38.476087h217.176216c56.675554 0 102.61494-45.93758 102.61494-102.569784V111.113203c0-56.635817-45.939386-102.569785-102.61494-102.569785z"
          fill="#4D73B1"
          p-id="5407"
        />
      </svg>
    );

    const myheaders = {};
    const {
      existFileList,
      percents,
      userTeamList,
      record,
      region_name,
      enterpriseAdmin,
      import_file_status
    } = this.state;

    const existFiles =
      existFileList && existFileList.length > 0 && existFileList;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px'
    };
    const userTeam = userTeamList && userTeamList.length > 0 && userTeamList;

    return (
      <PageHeaderLayout
        title="离线应用模版导入"
        content="离线应用模版导入是创建本地共享库应用模型的方式之一，离线应用包可以来自其他在线平台导出或云应用商店导出"
      >
        <div>
          <div className={styles.tit}>离线应用模版导入</div>
          <div className={styles.status}>
            正在使用<span>“{region_name}”</span>完成本次导入任务
          </div>
          {/* <Card
            bodyStyle={{ padding: '25px 0 25px 29px' }}
            className={styles.mb10}
          >
            <Row className={styles.box}>
              <Col span={24} className={styles.desc}>
                正在使用<span>“{region_name}”</span>完成本次导入任务
              </Col>
            </Row>
          </Card> */}

          <Card
            bodyStyle={{ padding: '0 0 0 27px' }}
            className={styles.mb10}
            bordered={false}
          >
            <Row className={styles.box}>
              <Col span={23} className={styles.con}>
                上传APP文件
                {percents && (
                  <Progress
                    percent={parseInt(percents)}
                    size="small"
                    style={{ width: '98%' }}
                  />
                )}
              </Col>
              <Col span={1} className={styles.rl}>
                <Upload
                  showUploadList={false}
                  name="appTarFile"
                  accept=".zip,.tar,.gz"
                  action={record.upload_url}
                  fileList={this.state.fileList}
                  onChange={this.onChangeUpload}
                  onRemove={this.onRemove}
                  headers={myheaders}
                  disabled={region_name === ''}
                >
                  <img src={UploadImg} />
                  <div className={styles.upText}>上传</div>
                </Upload>
              </Col>
            </Row>
          </Card>

          {existFiles && (
            <div>
              <div className={styles.tit}>已上传文件列表</div>
              <Card className={styles.mb10}>
                <Checkbox.Group
                  style={{ width: '100%' }}
                  onChange={this.onFileChange}
                >
                  <Row>
                    {existFiles.map(order => {
                      return (
                        <Col key={`col${order}`} span={24}>
                          <Checkbox key={order} value={order}>
                            {order}{' '}
                            {import_file_status.map(item => {
                              if (item.file_name === order) {
                                switch (item.status) {
                                  case 'failed':
                                    return (
                                      <Icon
                                        type="check-circle"
                                        theme="twoTone"
                                        twoToneColor="red"
                                      />
                                    );
                                  case 'success':
                                    return (
                                      <Icon
                                        type="check-circle"
                                        theme="twoTone"
                                        twoToneColor="#52c41a"
                                      />
                                    );
                                  default:
                                    return <Icon type="sync" spin />;
                                }
                              }
                            })}
                          </Checkbox>
                        </Col>
                      );
                    })}
                  </Row>
                </Checkbox.Group>
              </Card>

              <div className={styles.tit}>导入范围</div>

              <Card className={styles.mb10}>
                <Radio.Group
                  onChange={this.onChangeRadio}
                  value={this.state.scopeValue}
                >
                  <Radio
                    style={radioStyle}
                    value="enterprise"
                    disabled={!enterpriseAdmin}
                  >
                    上传到企业
                  </Radio>
                  <Radio style={radioStyle} value="team">
                    上传到团队
                    <Select
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      size="small"
                      defaultValue="请选择一个团队"
                      style={{ width: 150, marginLeft: '15px' }}
                      onChange={this.handleChangeTeam}
                    >
                      {userTeam &&
                        userTeam.map(item => {
                          const { team_id, team_alias, team_name } = item;
                          return (
                            <Option key={team_id} value={team_name}>
                              {team_alias}
                            </Option>
                          );
                        })}
                    </Select>
                  </Radio>
                </Radio.Group>
              </Card>
              <Row style={{ marginTop: '25px' }}>
                <Col span={24} className={styles.btn}>
                  <Button
                    onClick={() => {
                      this.cancelImport();
                    }}
                  >
                    放弃导入
                  </Button>
                  {this.state.import_file_status.length === 0 && (
                    <Button
                      type="primary"
                      onClick={() => {
                        this.handleSubmit();
                      }}
                    >
                      确认导入
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </div>
      </PageHeaderLayout>
    );
  }
}
