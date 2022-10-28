/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import { Card, Col, notification, Row, Spin, Switch, Divider } from 'antd';
import { connect } from 'dva';
import React, { Fragment, PureComponent } from 'react';
import CertificateForm from '../../components/CertificateForm';
import CloudBackupForm from '../../components/CloudBackupForm';
import ConfirmModal from '../../components/ConfirmModal';
import ImageHubForm from '../../components/ImageHubForm';
import MonitoringForm from '../../components/MonitoringForm';
import PlatformBasicInformationForm from '../../components/PlatformBasicInformationForm';
import wutongUtil from '../../utils/wutong';
import styles from './index.less';
import OauthTable from './oauthTable';

@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
  wutongInfo: global.wutongInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  certificateLongin: loading.effects['global/putCertificateType'],
  imageHubLongin: loading.effects['global/editImageHub'],
  monitoringLongin: loading.effects['global/editImageHub'],
  objectStorageLongin: loading.effects['global/editCloudBackup'],
  overviewInfo: index.overviewInfo
}))
class Infrastructure extends PureComponent {
  constructor(props) {
    super(props);
    const { enterprise } = this.props;
    this.state = {
      enterpriseAdminLoading: false,
      showDeleteDomain: false,
      openCertificate: false,
      closeCertificate: false,
      closeImageHub: false,
      closeMonitoring: false,
      openImageHub: false,
      openEnableMonitoring: false,
      openCloudBackup: false,
      closeCloudBackup: false,
      openBasicInformation: false,
      iswutongTird: wutongUtil.OauthEnterpriseEnable(enterprise),
      isEnableAppstoreImageHub: wutongUtil.isEnableAppstoreImageHub(enterprise),
      AppstoreImageHubValue: wutongUtil.fetchAppstoreImageHub(enterprise),
      isEnableObjectStorage: wutongUtil.isEnableObjectStorage(enterprise),
      MonitoringValue: wutongUtil.fetchMonitoring(enterprise),
      isEnableMonitoring: wutongUtil.isEnableMonitoring(enterprise),
      ObjectStorageValue: wutongUtil.fetchObjectStorage(enterprise),

      providers: [
        { key: 'alioss', name: '阿里云对象存储' },
        { key: 's3', name: 'S3' }
      ]
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/getIsRegist'
    });
  }

  onRegistChange = checked => {
    this.props.dispatch({
      type: 'global/putIsRegist',
      payload: {
        isRegist: checked
      }
    });
  };

  onQueryLogChange = checked => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'global/putSetLogQuery',
      payload: {
        enable: checked,
        enterprise_id: eid
      },
      callback: res => {
        dispatch({
          type: 'global/fetchWutongInfo'
        });
      }
    });
  };

  onQueryCallLinkChange = checked => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'global/putSetCallLinkQuery',
      payload: {
        enable: checked,
        enterprise_id: eid
      },
      callback: res => {
        dispatch({
          type: 'global/fetchWutongInfo'
        });
      }
    });
  };

  handlChooseeOpen = () => {
    const { iswutongTird } = this.state;
    iswutongTird ? this.handleOpenDomain() : this.handelIsOpen(true);
  };

  handleOpenDomain = () => {
    this.setState({
      showDeleteDomain: true
    });
  };

  handelIsOpen = enable => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/editOauth',
      payload: {
        arr: { enable, value: null }
      },
      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({
            message: enable ? '开启Oauth2.0认证' : '关闭成功'
          });
          this.fetchEnterpriseInfo();
        }
      }
    });
  };

  handelIsOpenImageHub = (enable, value) => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { AppstoreImageHubValue, isEnableAppstoreImageHub } = this.state;
    const params = value || AppstoreImageHubValue || {};
    dispatch({
      type: 'global/editImageHub',
      payload: {
        enterprise_id: eid,
        enable,
        hub_url: params.hub_url,
        namespace: params.namespace,
        hub_user: params.hub_user,
        hub_password: params.hub_password
      },

      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({
            message: !isEnableAppstoreImageHub
              ? '开通成功'
              : enable && value
              ? '修改成功'
              : '关闭成功'
          });
          this.fetchEnterpriseInfo();
          this.handelCloseImageHub();
        }
      }
    });
  };

  handelIsOpenMonitorin = (enable, value) => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { MonitoringValue, isEnableMonitoring } = this.state;
    const params = value || MonitoringValue || {};
    dispatch({
      type: 'global/editMonitorin',
      payload: {
        enterprise_id: eid,
        enable,
        ...params
      },

      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({
            message: !isEnableMonitoring
              ? '开通成功'
              : enable && value
              ? '修改成功'
              : '关闭成功'
          });
          this.fetchEnterpriseInfo();
          this.handelCloseMonitoring();
        }
      }
    });
  };

  handelIsOpenCloudBackup = (enable, value) => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { ObjectStorageValue, isEnableObjectStorage } = this.state;
    const params = value || ObjectStorageValue || {};
    dispatch({
      type: 'global/editCloudBackup',
      payload: {
        enterprise_id: eid,
        enable,
        provider: params.provider,
        endpoint: params.endpoint,
        bucket_name: params.bucket_name,
        access_key: params.access_key,
        secret_key: params.secret_key
      },

      callback: res => {
        if (res && res.status_code === 200) {
          notification.success({
            message: !isEnableObjectStorage
              ? '开通成功'
              : enable && value
              ? '修改成功'
              : '关闭成功'
          });
          this.fetchEnterpriseInfo();
          this.handelCloseCloudBackup();
        }
      }
    });
  };

  fetchEnterpriseInfo = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { openCertificate, closeCertificate } = this.state;
    dispatch({
      type: 'global/fetchEnterpriseInfo',
      payload: {
        enterprise_id: eid
      },
      callback: info => {
        if (info && !openCertificate && !closeCertificate) {
          this.setState({
            iswutongTird: wutongUtil.OauthEnterpriseEnable(info.bean),
            isEnableAppstoreImageHub: wutongUtil.isEnableAppstoreImageHub(
              info.bean
            ),
            isEnableMonitoring: wutongUtil.isEnableMonitoring(info.bean),
            isEnableObjectStorage: wutongUtil.isEnableObjectStorage(info.bean),
            AppstoreImageHubValue: wutongUtil.fetchAppstoreImageHub(info.bean),
            MonitoringValue: wutongUtil.fetchMonitoring(info.bean),
            ObjectStorageValue: wutongUtil.fetchObjectStorage(info.bean)
          });
        }
      }
    });
    if (openCertificate || closeCertificate) {
      this.handelCloseCertificate();
      return null;
    }
    dispatch({ type: 'user/fetchCurrent' });
    this.handelClone();
  };

  handelClone = () => {
    this.setState({
      showDeleteDomain: false
    });
  };
  handelOpenCertificate = () => {
    this.setState({ openCertificate: true });
  };
  handelOpenCloseCertificate = () => {
    this.setState({ closeCertificate: true });
  };
  handelOpenCloseImageHub = () => {
    this.setState({ closeImageHub: true });
  };
  handelOpenImageHub = () => {
    this.setState({ openImageHub: true });
  };
  handelCloseCertificate = () => {
    this.setState({ closeCertificate: false, openCertificate: false });
  };
  handelCloseImageHub = () => {
    this.setState({ closeImageHub: false, openImageHub: false });
  };

  handelOpenCloudBackup = () => {
    this.setState({ openCloudBackup: true });
  };
  handelOpenCloseCloudBackup = () => {
    this.setState({ closeCloudBackup: true });
  };
  handelOpenCloseCloudMonitoring = () => {
    this.setState({ closeMonitoring: true });
  };
  handelOpenisEnableMonitoring = () => {
    this.setState({ openEnableMonitoring: true });
  };
  handelCloseMonitoring = () => {
    this.setState({ closeMonitoring: false, openEnableMonitoring: false });
  };
  handelCloseCloudBackup = () => {
    this.setState({ closeCloudBackup: false, openCloudBackup: false });
  };
  handelOpenBasicInformation = () => {
    this.setState({ openBasicInformation: true });
  };
  handelCloseBasicInformation = () => {
    this.setState({ openBasicInformation: false });
  };
  handelIsOpenBasicInformation = value => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'global/putBasicInformation',
      payload: {
        ...value,
        enterprise_id: eid
      }
    });
  };
  createClusters = values => {
    const {
      dispatch,
      enterprise,
      match: {
        params: { eid }
      }
    } = this.props;

    const AutomaticCertificate = wutongUtil.CertificateIssuedByEnable(
      enterprise
    );
    if (values && values.auto_ssl_config) {
      if (!this.isJSON(values.auto_ssl_config)) {
        return null;
      }
    }

    dispatch({
      type: 'global/putCertificateType',
      payload: {
        enterprise_id: eid,
        auto_ssl: {
          enable: !!values,
          value: values ? values.auto_ssl_config : false
        }
      },
      callback: res => {
        if (res && res._condition === 200) {
          notification.success({
            message: !values
              ? '关闭成功'
              : !AutomaticCertificate
              ? '开通成功'
              : '编辑成功'
          });
          this.fetchEnterpriseInfo();
        }
      }
    });
  };

  isJSON = str => {
    const clues = () => {
      notification.warning({
        message: '格式错误、请输入正确的JSON格式'
      });
    };
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        }
        clues();
        return false;
      } catch (e) {
        clues();
        return false;
      }
    }
    clues();
    return false;
  };

  render() {
    const {
      enterprise,
      oauthLongin,
      certificateLongin,
      imageHubLongin,
      monitoringLongin,
      objectStorageLongin,
      wutongInfo,
      match: {
        params: { eid }
      }
    } = this.props;
    let infos = {};
    if (wutongInfo) {
      const fetchLogo = wutongUtil.fetchLogo(wutongInfo, enterprise);
      // const fetchFavicon = wutongUtil.fetchFavicon(enterprise);

      const title = wutongInfo && wutongInfo.title && wutongInfo.title.value;
      const enterpriseTitle =
        (enterprise && enterprise.enterprise_alias) ||
        (wutongInfo && wutongInfo.enterprise_alias);
      const doc_url = wutongUtil.documentPlatform_url(wutongInfo);
      const officialDemo = wutongUtil.officialDemoEnable(enterprise);

      // eslint-disable-next-line no-const-assign
      infos = {
        logo: fetchLogo,
        title,
        doc_url,
        // officialDemo,
        enterprise_alias: enterpriseTitle
        // favicon: fetchFavicon
      };
    }
    const enterpriseEdition = wutongUtil.isEnterpriseEdition(wutongInfo);

    const {
      enterpriseAdminLoading,
      showDeleteDomain,
      iswutongTird,
      isEnableAppstoreImageHub,
      AppstoreImageHubValue,
      MonitoringValue,
      isEnableObjectStorage,
      isEnableMonitoring,
      ObjectStorageValue,
      openCertificate,
      closeCertificate,
      openOauthTable,
      openImageHub,
      openEnableMonitoring,
      closeImageHub,
      closeMonitoring,
      openCloudBackup,
      closeCloudBackup,
      providers,
      openBasicInformation
    } = this.state;
    const UserRegistered = (
      <Card
        // hoverable
        className={styles.card}
        bordered={false}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            用户注册
          </Col>
          <Col span={17} className={styles.description}>
            <span>控制用户是否可以注册功能。</span>
          </Col>

          <Col span={4} style={{ textAlign: 'right' }}>
            <Switch
              onChange={this.onRegistChange}
              className={styles.automaTictelescopingSwitch}
              checked={this.props.isRegist}
            />
          </Col>
        </Row>
      </Card>
    );
    const Oauth = (
      <Card
        //hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            Oauth 第三方服务集成
          </Col>
          <Col span={17} className={styles.description}>
            <span>
              支持Github、Gitlab、码云等多种第三方OAuth服务，用户互联后可获取仓库项目。支持钉钉、Aliyun等服务进行第三方登录认证。
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {iswutongTird && (
              <Fragment>
                <a
                  onClick={() => {
                    this.setState({ openOauthTable: true });
                  }}
                  style={{ verticalAlign: 'middle' }}
                >
                  查看配置
                </a>
                <Divider style={{ margin: '0 16px' }} type="vertical" />
              </Fragment>
            )}

            <Switch
              onChange={this.handlChooseeOpen}
              checked={iswutongTird}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const AutomaticCertificate = wutongUtil.CertificateIssuedByEnable(
      enterprise
    );
    const AutomaticIssueCertificate = (
      <Card
        //hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            自动签发证书
          </Col>
          <Col span={17} className={styles.description}>
            <span>这是一个外部扩充功能，实现网关策略所需证书的自动签发。</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {AutomaticCertificate && (
              <Fragment>
                <a
                  onClick={this.handelOpenCertificate}
                  style={{ verticalAlign: 'middle' }}
                >
                  查看配置
                </a>
                <Divider style={{ margin: '0 16px' }} type="vertical" />
              </Fragment>
            )}

            <Switch
              onChange={() => {
                AutomaticCertificate
                  ? this.handelOpenCloseCertificate()
                  : this.handelOpenCertificate();
              }}
              checked={AutomaticCertificate}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );

    const MirrorWarehouseInformation = (
      <Card
        //hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            内部组件库镜像仓库
          </Col>
          <Col span={17} className={styles.description}>
            <span>
              用于存储发布到组件库的应用模型镜像，其需要能被所有集群访问。
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableAppstoreImageHub && (
              <Fragment>
                <a
                  onClick={this.handelOpenImageHub}
                  style={{ verticalAlign: 'middle' }}
                >
                  查看配置
                </a>
                <Divider style={{ margin: '0 16px' }} type="vertical" />
              </Fragment>
            )}

            <Switch
              onChange={() => {
                isEnableAppstoreImageHub
                  ? this.handelOpenCloseImageHub()
                  : this.handelOpenImageHub();
              }}
              checked={isEnableAppstoreImageHub}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const CloudBackup = (
      <Card
        //hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            对象存储
          </Col>
          <Col span={17} className={styles.description}>
            <span>对象存储用于云端备份功能，存储应用的备份文件。</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableObjectStorage && (
              <Fragment>
                <a onClick={this.handelOpenCloudBackup}>查看配置</a>
                <Divider style={{ margin: '0 16px' }} type="vertical" />
              </Fragment>
            )}

            <Switch
              onChange={() => {
                isEnableObjectStorage
                  ? this.handelOpenCloseCloudBackup()
                  : this.handelOpenCloudBackup();
              }}
              checked={isEnableObjectStorage}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const Monitoring = (
      <Card
        // hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            监控
          </Col>
          <Col span={17} className={styles.description}>
            <span>用于监控：集群、节点、组件、服务数据。</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableMonitoring && (
              <Framegent>
                <a
                  onClick={this.handelOpenisEnableMonitoring}
                  style={{ verticalAlign: 'middle' }}
                >
                  查看配置
                </a>
                <Divider style={{ margin: '0 16px' }} type="vertical" />
              </Framegent>
            )}

            <Switch
              onChange={() => {
                isEnableMonitoring
                  ? this.handelOpenCloseCloudMonitoring()
                  : this.handelOpenisEnableMonitoring();
              }}
              checked={isEnableMonitoring}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const QueryLog = (
      <Card
        // hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            日志查询
          </Col>
          <Col span={17} className={styles.description}>
            <span>用于对采集到的日志进行筛选查询与分析</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Switch
              // onChange={() => {
              //   isEnableMonitoring
              //     ? this.handelOpenCloseCloudMonitoring()
              //     : this.handelOpenisEnableMonitoring();
              // }}
              checked={
                wutongInfo &&
                wutongInfo.log_query &&
                wutongInfo.log_query.enable
              }
              onChange={this.onQueryLogChange}
              defaultChecked={true}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const QueryCallLink = (
      <Card
        // hoverable
        bordered={false}
        className={styles.card}
      >
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            调用链路查询
          </Col>
          <Col span={17} className={styles.description}>
            <span>用于对采集到的调用链路进行查询与分析</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Switch
              // onChange={() => {
              //   isEnableMonitoring
              //     ? this.handelOpenCloseCloudMonitoring()
              //     : this.handelOpenisEnableMonitoring();
              // }}
              checked={
                wutongInfo &&
                wutongInfo.call_link_query &&
                wutongInfo.call_link_query.enable
              }
              onChange={this.onQueryCallLinkChange}
              defaultChecked={true}
              className={styles.automaTictelescopingSwitch}
            />
          </Col>
        </Row>
      </Card>
    );
    const BasicInformation = (
      <Card style={{ marginTop: '10px' }} hoverable bordered={false}>
        <Row type="flex" align="middle">
          <Col span={3} className={styles.title}>
            基础信息
          </Col>
          <Col span={17} className={styles.description}>
            <span>可以修改网站的标题、企业名称、LOGO、网页图标。</span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <Fragment>
              <a
                onClick={this.handelOpenBasicInformation}
                style={{ marginRight: '10px', verticalAlign: 'middle' }}
              >
                查看配置
              </a>
              <Divider style={{ margin: '0 8px' }} type="vertical" />
            </Fragment>
          </Col>
        </Row>
      </Card>
    );

    return (
      <Fragment>
        {openCertificate && (
          <CertificateForm
            eid={eid}
            AutomaticCertificate={AutomaticCertificate}
            loading={certificateLongin}
            onCancel={this.handelCloseCertificate}
            onOk={values => {
              this.createClusters(values);
            }}
          />
        )}
        {openImageHub && (
          <ImageHubForm
            eid={eid}
            title={
              !isEnableAppstoreImageHub
                ? '开通组件库镜像仓库'
                : '组件库镜像仓库'
            }
            loading={imageHubLongin}
            onCancel={this.handelCloseImageHub}
            data={AppstoreImageHubValue}
            onOk={values => {
              this.handelIsOpenImageHub(true, values);
            }}
          />
        )}
        {openEnableMonitoring && (
          <MonitoringForm
            eid={eid}
            title="监控配置"
            loading={monitoringLongin}
            onCancel={this.handelCloseMonitoring}
            data={MonitoringValue}
            onOk={values => {
              this.handelIsOpenMonitorin(true, values);
            }}
          />
        )}
        {openCloudBackup && (
          <CloudBackupForm
            eid={eid}
            title={!isEnableObjectStorage ? '配置云端备份对象存储' : '对象存储'}
            loading={objectStorageLongin}
            onCancel={this.handelCloseCloudBackup}
            data={ObjectStorageValue}
            providers={providers}
            onOk={values => {
              this.handelIsOpenCloudBackup(true, values);
            }}
          />
        )}
        {openBasicInformation && (
          <PlatformBasicInformationForm
            title="基础信息"
            eid={eid}
            loading={objectStorageLongin}
            data={infos}
            onCancel={this.handelCloseBasicInformation}
            onOk={this.handelIsOpenBasicInformation}
          />
        )}

        {(closeMonitoring ||
          closeImageHub ||
          closeCertificate ||
          showDeleteDomain ||
          closeCloudBackup) && (
          <ConfirmModal
            loading={
              closeMonitoring
                ? monitoringLongin
                : closeImageHub
                ? imageHubLongin
                : closeCertificate
                ? certificateLongin
                : showDeleteDomain
                ? oauthLongin
                : closeCloudBackup
                ? objectStorageLongin
                : false
            }
            title="关闭"
            desc={
              closeMonitoring
                ? '确定要关闭监控？'
                : closeImageHub
                ? '确定要关闭组件库镜像仓库？'
                : closeCertificate
                ? '确定要关闭自动签发证书？'
                : showDeleteDomain
                ? '确定要关闭Oauth2.0认证？'
                : closeCloudBackup
                ? '确定要关闭对象存储？'
                : ''
            }
            onOk={() => {
              closeMonitoring
                ? this.handelIsOpenMonitorin(false)
                : closeImageHub
                ? this.handelIsOpenImageHub(false)
                : closeCertificate
                ? this.createClusters(false)
                : showDeleteDomain
                ? this.handelIsOpen(false)
                : closeCloudBackup
                ? this.handelIsOpenCloudBackup(false)
                : '';
            }}
            onCancel={() => {
              closeMonitoring
                ? this.handelCloseMonitoring()
                : closeImageHub
                ? this.handelCloseImageHub()
                : closeCertificate
                ? this.handelCloseCertificate()
                : showDeleteDomain
                ? this.handelClone()
                : closeCloudBackup
                ? this.handelCloseCloudBackup()
                : '';
            }}
          />
        )}
        {openOauthTable && (
          <OauthTable
            eid={eid}
            onOk={() => {
              this.setState({ openOauthTable: false });
            }}
            onCancel={() => {
              this.setState({ openOauthTable: false });
            }}
          />
        )}
        {enterpriseAdminLoading ? (
          <div className={styles.example}>
            <Spin />
          </div>
        ) : (
          <div className={styles.base}>
            <Card bordered={false}>
              {enterpriseEdition && BasicInformation}
              {UserRegistered}
              {AutomaticIssueCertificate}
              {Oauth}
              {MirrorWarehouseInformation}
              {CloudBackup}
              {Monitoring}
              {QueryLog}
              {QueryCallLink}
            </Card>
          </div>
        )}
      </Fragment>
    );
  }
}

// eslint-disable-next-line react/no-multi-comp
@connect(({ global }) => ({
  enterprise: global.enterprise
}))
export default class Index extends PureComponent {
  render() {
    const { enterprise } = this.props;
    if (enterprise) {
      return <Infrastructure {...this.props} />;
    }
    return null;
  }
}
