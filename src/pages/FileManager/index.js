/* eslint-disable jsx-a11y/iframe-has-title */
import { connect } from 'dva';
import React, { PureComponent } from 'react';

@connect(({ user, list, loading, global, index }) => ({
  user: user.currentUser,
  list,
  loading: loading.models.list,
  wutongInfo: global.wutongInfo,
  enterprise: global.enterprise,
  isRegist: global.isRegist,
  oauthLongin: loading.effects['global/creatOauth'],
  overviewInfo: index.overviewInfo
}))
export default class FileManager extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
  }

  componentDidMount() {
    this.loadCluster();
  }

  loadCluster = () => {
    const {
      dispatch,
      match: {
        params: { eid, clusterID }
      }
    } = this.props;
    dispatch({
      type: 'region/fetchEnterpriseCluster',
      payload: {
        enterprise_id: eid,
        region_id: clusterID
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            regionInfo: res.bean
          });
        }
      }
    });
  };

  render() {
    const {
      match: {
        params: { teamName, regionName, appAlias, serviceID }
      }
    } = this.props;

    return (
      <iframe
        // src={`/console/team/${teamName}/region/${regionName}/components/${appAlias}/filemanager/service_id/${serviceID}`}
        src={`/console/filebrowser/${serviceID}`}
        // src={`https://wutong.talkweb.com.cn/console/filebrowser/${serviceID}`}
        style={{
          width: '100%',
          height: 'calc(100vh - 150px)'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        scrolling="auto"
        frameBorder="no"
        border="0"
        marginWidth="0"
        marginHeight="0"
      />
    );
  }
}
