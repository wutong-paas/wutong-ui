/**
 * @contnet  梧桐云市场店铺管理
 * @author   Leon
 * @date     2022-06-20
 *
 */

import {
  Tabs,
  Icon,
  Col,
  Tooltip,
  Input,
  Button,
  Pagination,
  Spin,
  notification
} from 'antd';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import CreateMarketModal from './component/CreateMarktModal';
import CreateTemplateModal from './component/CreateTemplateModal';
import CreateHelmAppModels from '../../components/CreateHelmAppModels';
import { useEffect, useState } from 'react';
import Lists from '../../components/Lists';
import globalUtil from '../../utils/global';
import NoComponent from '../../../public/images/noComponent.png';
import { connect } from 'dva';
import cookie from '../../utils/cookie';
import styles from './index.less';

const { TabPane } = Tabs;
const { Search } = Input;

const CloudStore = props => {
  const { eid } = props.match.params;
  const { dispatch } = props;
  const [activeTabKey, setActiveTabKey] = useState('');
  const [tabpaneList, setTabPaneList] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [installApplication, setInstallApplication] = useState(false);
  const [appInfo, setAppInfo] = useState({});
  const [queryApplicationListParam, setApplicationListParam] = useState({
    current: 1,
    size: 10,
    queryVO: {
      del_flag: false,
      store_id: ''
    }
  });
  const [createMarketModalVisible, setCreateMarketModalVisible] = useState(
    false
  );
  const [createTemplateModalVisible, setCreateTemplateModalVisible] = useState(
    false
  );

  useEffect(() => {
    fetchStoreList();
  }, []);

  useEffect(() => {
    if (queryApplicationListParam.market_id) fetchStoreApplicationList();
  }, [queryApplicationListParam]);

  const handleTabChange = activeKey => {
    if (activeKey === 'add') {
      setCreateMarketModalVisible(true);
      return;
    }
    setActiveTabKey(activeKey);
    setApplicationListParam(
      Object.assign({}, queryApplicationListParam, {
        market_id: activeKey.split(',')[1],
        queryVO: {
          del_flag: false,
          store_id: activeKey.split(',')[0]
        }
      })
    );
  };

  const handleCancelCreateMarketModal = () =>
    setCreateMarketModalVisible(false);

  const fetchStoreList = async () => {
    dispatch({
      type: 'store/fetchStoreList',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (res?.status_code) {
          const store_id = res?.list[0]?.store_id;
          const market_id = res?.list[0]?.ID;
          setTabPaneList(res?.list);
          setActiveTabKey(`${store_id},${market_id}`);
          setApplicationListParam(
            Object.assign({}, queryApplicationListParam, {
              market_id,
              queryVO: { del_flag: false, store_id }
            })
          );
        }
      }
    });
  };

  const fetchStoreApplicationList = () => {
    const params = { enterprise_id: eid, ...queryApplicationListParam };
    setLoading(true);
    dispatch({
      type: 'store/fetchStoreApplicationList',
      payload: params,
      callback: res => {
        if (res?.status_code) {
          setStoreList(res?.bean?.records || []);
          setTotal(res?.bean?.total);
        }
        setLoading(false);
      },
      handleError: err => {
        setLoading(false);
        setStoreList([]);
        notification.error({ message: err?.data?.msg || '请求出错' });
      }
    });
  };

  const handleInstall = appInfo => {
    setAppInfo(appInfo);
    setInstallApplication(true);
  };

  const handleApplicationDetail = app_id => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = props;
    dispatch(routerRedux.push(`/enterprise/${eid}/shared/app/${app_id}`));
  };

  const handlePage = (page, pageSize) => {
    setApplicationListParam({}, queryApplicationListParam, {
      current: page,
      size: pageSize
    });
  };

  const handleSearch = value => {
    setApplicationListParam(
      Object.assign({}, queryApplicationListParam, {
        queryVO: {
          ...queryApplicationListParam.queryVO,
          name: value
        }
      })
    );
  };

  const handleupDataAppModel = () => {
    setInstallApplication(false);
    setAppInfo(null);
  };

  const handleCancelupDataAppModel = () => {
    setInstallApplication(false);
  };

  const renderContent = () => {
    const defaulAppImg = globalUtil.fetchSvg('defaulAppImg');
    if (storeList?.length === 0) {
      return (
        <>
          <div className={styles.empty}>
            <img src={NoComponent} />
            <p>当前店铺无应用，请先发布应用</p>
          </div>
        </>
      );
    }

    return storeList.map((item, index) => {
      const {
        id: appId,
        name,
        intro_short,
        icon,
        appVersion,
        installNumber = 0,
        shift_status,
        front_url
      } = item;
      // const token =  `Bearer ${cookie.get('third_token')}`;
      return (
        <>
          <Lists
            key={appId}
            stylePro={{ marginBottom: '10px' }}
            Cols={
              <div
                className={styles.h70}
                onClick={e => {
                  e.stopPropagation();
                  if (shift_status === 0) {
                    notification.warning({
                      message: '当前应用未上架，暂不可查看详情!'
                    });
                    return;
                  }
                  if (!front_url) {
                    notification.warning({
                      message: '非法地址！'
                    });
                    return;
                  }
                  window.open(front_url, '_blank');
                }}
              >
                <Col span={3} style={{ display: 'flex' }}>
                  {/* {
                    <div
                      className={styles.lt}
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      <Tooltip title="安装量">
                        <div title={installNumber}>
                          {globalUtil.nFormatter(installNumber)}
                        </div>
                      </Tooltip>
                    </div>
                  } */}
                  <div className={styles.imgs}>
                    {icon ? <img src={icon} alt="" /> : defaulAppImg}
                  </div>
                </Col>
                <Col span={13} className={styles.tits}>
                  <div>
                    <p>
                      <a
                      // onClick={e => {
                      //   e.stopPropagation();
                      //   if (shift_status === 0) {
                      //     e.preventDefault();
                      //     notification.warning({
                      //       message: '当前应用未上架，暂不可查看详情!'
                      //     });
                      //     return;
                      //   }
                      //   if (!front_url) {
                      //     e.preventDefault();
                      //     notification.warning({
                      //       message: '非法地址!'
                      //     });
                      //     return;
                      //   }
                      //   this.showMarketAppDetail(item);
                      // }}
                      // href={front_url}
                      // target="_blank"
                      >
                        {name}
                      </a>
                    </p>
                    <p>
                      <Tooltip placement="topLeft" title={intro_short || '-'}>
                        {intro_short || '-'}
                      </Tooltip>
                    </p>
                  </div>
                </Col>
                <Col span={3} className={styles.status}>
                  <div>
                    {appVersion ? (
                      <p className={styles.dev_version}>{appVersion}</p>
                    ) : (
                      <p className={styles.dev_version}>无版本</p>
                    )}
                  </div>
                </Col>
                <Col span={4} className={styles.status}>
                  <div>
                    <p className={styles.dev_version}>
                      {shift_status ? '已上架' : '未上架'}
                    </p>
                  </div>
                </Col>
                <Col
                  span={1}
                  className={styles.tags}
                  style={{ justifyContent: 'center' }}
                >
                  <div
                    className={styles.installBox}
                    style={{ background: '#fff' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleInstall(item);
                    }}
                  >
                    {globalUtil.fetchSvg('InstallApp')}
                    <div style={{ background: '#fff' }}>安装</div>
                  </div>
                </Col>
              </div>
            }
          />
        </>
      );
    });
  };

  return (
    <div className={styles.local}>
      <PageHeaderLayout
        title="云市场应用店铺"
        content="在云市场应用店铺中创建并发布自己的应用，成功发布的应用可作为后续应用上架至云市场门户、以及应用交付的基础"
      >
        <div className={styles.header}>
          <Tabs
            activeKey={activeTabKey}
            className={styles.setTabs}
            onChange={handleTabChange}
          >
            {tabpaneList.length !== 0 &&
              tabpaneList.map((item, index) => {
                const { name, store_id } = item;
                return (
                  <TabPane
                    tab={
                      <span className={styles.verticalCen}>
                        <Icon type="shop" />
                        {name}
                      </span>
                    }
                    key={`${item?.store_id},${item?.ID}`}
                  >
                    <div className={styles.actions}>
                      <Search
                        style={{ width: '320px' }}
                        placeholder="请输入名称进行搜索"
                        onSearch={handleSearch}
                      />
                      <div className={styles.right}>
                        <div className={styles.icon}>
                          <Tooltip title="刷新" placement="top">
                            <Icon
                              type="redo"
                              onClick={fetchStoreApplicationList}
                            />
                          </Tooltip>
                        </div>
                        <Button
                          type="primary"
                          onClick={() => setCreateTemplateModalVisible(true)}
                        >
                          创建应用模板
                        </Button>
                      </div>
                    </div>
                    <Spin spinning={loading}>
                      {renderContent()}
                      <div style={{ textAlign: 'right' }}>
                        <Pagination
                          showQuickJumper
                          current={queryApplicationListParam.current}
                          pageSize={queryApplicationListParam.size}
                          total={total}
                          showTotal={total => `共${total}条`}
                          onChange={handlePage}
                        />
                      </div>
                    </Spin>
                  </TabPane>
                );
              })}
            <TabPane
              tab={
                <Tooltip placement="top" title="添加应用店铺">
                  <Icon type="plus" className={styles.addSvg} />
                </Tooltip>
              }
              key="add"
            />
          </Tabs>
          {tabpaneList.length === 0 && (
            <div className={styles.empty}>
              <img src={NoComponent} />
              <p>当前无可用店铺，请先添加一个店铺</p>
            </div>
          )}
          {installApplication && (
            <CreateHelmAppModels
              title="安装应用"
              eid={eid}
              appTypes={'localsContent'}
              appInfo={appInfo}
              helmInfo={false}
              onOk={handleupDataAppModel}
              onCancel={handleCancelupDataAppModel}
              marketId={queryApplicationListParam.market_id}
            />
          )}
          {createMarketModalVisible && (
            <CreateMarketModal
              createMarketModalVisible={createMarketModalVisible}
              eid={eid}
              onCancel={handleCancelCreateMarketModal}
              fetchStoreList={fetchStoreList}
            />
          )}
          {createTemplateModalVisible && (
            <CreateTemplateModal
              createTemplateModalVisible={createTemplateModalVisible}
              eid={eid}
              onCancel={() => setCreateTemplateModalVisible(false)}
              createdCallback={fetchStoreList}
            />
          )}
        </div>
      </PageHeaderLayout>
    </div>
  );
};

const CloudStoreMarket = connect()(CloudStore);

export default CloudStoreMarket;
