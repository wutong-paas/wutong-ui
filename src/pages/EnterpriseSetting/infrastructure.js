/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import { Card, Col, notification, Row, Spin, Switch } from 'antd';
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
        { key: 'alioss', name: '?????????????????????' },
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
            message: enable ? '??????Oauth2.0??????' : '????????????'
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
              ? '????????????'
              : enable && value
              ? '????????????'
              : '????????????'
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
              ? '????????????'
              : enable && value
              ? '????????????'
              : '????????????'
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
              ? '????????????'
              : enable && value
              ? '????????????'
              : '????????????'
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
              ? '????????????'
              : !AutomaticCertificate
              ? '????????????'
              : '????????????'
          });
          this.fetchEnterpriseInfo();
        }
      }
    });
  };

  isJSON = str => {
    const clues = () => {
      notification.warning({
        message: '?????????????????????????????????JSON??????'
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
        hoverable
        bordered={false}
        style={{ borderTop: enterpriseEdition ? '1px solid  #ccc' : 'none' }}
      >
        <Row type="flex" align="middle">
          <Col span={3}>????????????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ???????????????????????????????????????
            </span>
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
      <div>
        <Card
          style={{ borderTop: '1px solid  #ccc' }}
          hoverable
          bordered={false}
        >
          <Row type="flex" align="middle">
            <Col span={3}>Oauth ?????????????????????</Col>
            <Col span={17}>
              <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                ??????Github???Gitlab???????????????????????????OAuth???????????????????????????????????????????????????????????????Aliyun???????????????????????????????????????
              </span>
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              {iswutongTird && (
                <a
                  onClick={() => {
                    this.setState({ openOauthTable: true });
                  }}
                  style={{ marginRight: '10px' }}
                >
                  ????????????
                </a>
              )}
              <Switch
                onChange={this.handlChooseeOpen}
                checked={iswutongTird}
                className={styles.automaTictelescopingSwitch}
              />
            </Col>
          </Row>
        </Card>
      </div>
    );
    const AutomaticCertificate = wutongUtil.CertificateIssuedByEnable(
      enterprise
    );
    const AutomaticIssueCertificate = (
      <Card hoverable bordered={false} style={{ borderTop: '1px solid  #ccc' }}>
        <Row type="flex" align="middle">
          <Col span={3}>??????????????????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ?????????????????????????????????????????????????????????????????????????????????
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {AutomaticCertificate && (
              <a
                onClick={this.handelOpenCertificate}
                style={{ marginRight: '10px' }}
              >
                ????????????
              </a>
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
      <Card hoverable bordered={false} style={{ borderTop: '1px solid  #ccc' }}>
        <Row type="flex" align="middle">
          <Col span={3}>???????????????????????????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ??????????????????????????????????????????????????????????????????????????????????????????
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableAppstoreImageHub && (
              <a
                onClick={this.handelOpenImageHub}
                style={{ marginRight: '10px' }}
              >
                ????????????
              </a>
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
      <Card hoverable bordered={false} style={{ borderTop: '1px solid  #ccc' }}>
        <Row type="flex" align="middle">
          <Col span={3}>????????????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ?????????????????????????????????????????????????????????????????????
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableObjectStorage && (
              <a
                onClick={this.handelOpenCloudBackup}
                style={{ marginRight: '10px' }}
              >
                ????????????
              </a>
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
      <Card hoverable bordered={false} style={{ borderTop: '1px solid  #ccc' }}>
        <Row type="flex" align="middle">
          <Col span={3}>??????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ?????????????????????????????????????????????????????????
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            {isEnableMonitoring && (
              <a
                onClick={this.handelOpenisEnableMonitoring}
                style={{ marginRight: '10px' }}
              >
                ????????????
              </a>
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
    const BasicInformation = (
      <Card style={{ marginTop: '10px' }} hoverable bordered={false}>
        <Row type="flex" align="middle">
          <Col span={3}>????????????</Col>
          <Col span={17}>
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              ?????????????????????????????????????????????LOGO??????????????????
            </span>
          </Col>
          <Col span={4} style={{ textAlign: 'right' }}>
            <a
              onClick={this.handelOpenBasicInformation}
              style={{ marginRight: '10px' }}
            >
              ????????????
            </a>
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
                ? '???????????????????????????'
                : '?????????????????????'
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
            title="????????????"
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
            title={!isEnableObjectStorage ? '??????????????????????????????' : '????????????'}
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
            title="????????????"
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
            title="??????"
            desc={
              closeMonitoring
                ? '????????????????????????'
                : closeImageHub
                ? '???????????????????????????????????????'
                : closeCertificate
                ? '????????????????????????????????????'
                : showDeleteDomain
                ? '???????????????Oauth2.0?????????'
                : closeCloudBackup
                ? '??????????????????????????????'
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
          <div>
            {enterpriseEdition && BasicInformation}
            {UserRegistered}
            {AutomaticIssueCertificate}
            {Oauth}
            {MirrorWarehouseInformation}
            {CloudBackup}
            {Monitoring}
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
