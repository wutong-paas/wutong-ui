/**
 * @content  企业总览页-new
 * @author   Leon
 * @date     2022-07-22
 *
 */

import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tabs, Table, Tooltip, Spin, Empty } from 'antd';
import { Text } from '../../contanst';
import {
  GroupNodeColunms,
  GroupEventColunms,
  tabList,
  useInfoList,
  serviceMonitorList,
  radarOption,
  pieOptions,
  appPieOptions,
  tagColorList,
  computedPercentage
} from './conf';
import HomeCloud from '../../../public/images/home/home_cloud.svg';
import Tooltips from '../../../public/images/home/tooltip.svg';
import Close from '../../../public/images/home/home_close.svg';
import HomeTeam from '../../../public/images/home/home_team.svg';
import GroupImg from '../../../public/images/home/group.svg';
import RightImg from '../../../public/images/home/right.svg';
import GroupHoverImg from '../../../public/images/home/group_hover.svg';
import RightHoverImg from '../../../public/images/home/right_hover.svg';
import HomeGropu from '../../../public/images/home/home_group.png';
import { routerRedux } from 'dva/router';
import * as echarts from 'echarts';
import classNames from 'classnames';
import styles from './index.less';

const { TabPane } = Tabs;
const { enterprise } = Text;

const {
  HOME_HEAD_TITLE,
  HOME_HEAD_INTRODUCE,
  HOME_CONTENT_USEINFO_TITLE,
  HOME_CONTENT_USEINFO_TOTAL,
  HOME_CONTENT_USEINFO_USED,
  HOME_CONTENT_USEINFO_TOOLTIP
} = enterprise;

const Home = props => {
  const {
    dispatch,
    match,
    homeInfoLoading,
    groupEventLoading,
    teamListLoading,
    homeAppLoading
  } = props;
  const { params } = match;
  const [radarCharts, setRadarCharts] = useState();
  const [pieChartsId, setPieChartsId] = useState([]);
  const [activeKey, setActiveKey] = useState(0);
  const [isShowAdvice, setIsShowAdvice] = useState(true);
  const [useList, setUseList] = useState([]);
  const [groupList, setGroupList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [groupInfo, setGroupInfo] = useState({});
  const [serviceInfo, setServiceInfo] = useState({});
  const [groupNodeList, setGroupNodeList] = useState([]);
  const [groupEventList, setGroupEventList] = useState([]);
  const [overviewInfo, setOverviewInfo] = useState([]);
  const [overviewMonitorInfo, setOverviewMonitorInfo] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [isHover, setIsHover] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentParentIndex, setCurrentParentIndex] = useState(-1);

  useEffect(() => {
    fetchHomeInfoList();
    fetchHomeAppInfoList();
    fetchHomeGroupEventList();
    getOverview();
    getOverviewMonitor();
    getUserTeams();
  }, []);

  useEffect(() => {
    if (activeKey === 0) initServiceCharts(groupInfo, serviceInfo);
  }, [activeKey, groupInfo, serviceInfo]);

  const initRadarCharts = res => {
    const radarChartsEntity = echarts.init(document.getElementById('radar'));
    radarChartsEntity.setOption(radarOption(res));
    window.onresize = () => {
      radarChartsEntity.resize();
    };
  };

  const initPieCharts = (ref, item) => {
    const { percentage } = item;
    const pieCharts = echarts.init(ref);
    pieCharts.setOption(pieOptions(percentage));
  };

  const initServiceCharts = (groupInfo, serviceInfo) => {
    const appPieCharts = echarts.init(document.getElementById('app-charts'));
    const serficePieCharts = echarts.init(
      document.getElementById('service-charts')
    );
    appPieCharts.setOption(appPieOptions('应用', groupInfo));
    serficePieCharts.setOption(appPieOptions('服务', serviceInfo));
  };

  const fetchHomeInfoList = () => {
    dispatch({
      type: 'global/fetchHomeInfo',
      payload: {
        enterprise_id: params?.eid
      },
      callback: res => {
        if (res) {
          const { node, pod, store } = res?.bean || {};
          setUseList(useInfoList(res?.bean));
          initRadarCharts(res?.bean);
          if (node?.info) {
            const list = node.info.map(i => {
              const {
                name,
                used_cpu,
                total_cpu,
                used_memory,
                total_memory,
                used_pod,
                total_pod
              } = i;
              const cpuPercentAge = computedPercentage(used_cpu, total_cpu);
              const memoryPercentAge = computedPercentage(
                used_memory,
                total_memory
              );
              const diskPercentAge = computedPercentage(used_pod, total_pod);
              return {
                name,
                cpu: `${cpuPercentAge}%\u00A0\u00A0\u00A0${used_cpu}/${total_cpu}`,
                memory: `${memoryPercentAge}%\u00A0\u00A0\u00A0${used_memory}/${total_memory}`,
                pod: `${diskPercentAge}%\u00A0\u00A0\u00A0${used_pod}/${total_pod}`
              };
            });
            setGroupNodeList(list);
          }
          if (pieChartsId.length > 0) {
            pieChartsId.map(i => {
              initPieCharts(document.getElementById(i.id), i.item);
            });
          }
        }
      }
    });
  };

  const fetchHomeAppInfoList = () => {
    dispatch({
      type: 'global/fetchHomeAppInfo',
      payload: {
        enterprise_id: params?.eid
      },
      callback: res => {
        if (res) {
          setGroupList(serviceMonitorList(res?.bean?.group_info));
          setServiceList(serviceMonitorList(res?.bean?.service_info));
          setGroupInfo(res?.bean?.group_info);
          setServiceInfo(res?.bean?.service_info);
        }
      }
    });
  };

  const fetchHomeGroupEventList = () => {
    dispatch({
      type: 'global/fetchHomeGroupEvent',
      payload: {
        enterprise_id: params?.eid
      },
      callback: res => {
        if (res) {
          setGroupEventList(res?.bean);
        }
      }
    });
  };

  const getOverview = () => {
    const { dispatch } = props;

    dispatch({
      type: 'global/fetchOverview',
      payload: {
        enterprise_id: params?.eid
      },
      callback: res => {
        if (res) {
          setOverviewInfo(res?.bean);
        }
      }
    });
  };

  const getOverviewMonitor = () => {
    const { dispatch } = props;

    dispatch({
      type: 'global/fetchOverviewMonitor',
      payload: {
        enterprise_id: params?.eid
      },
      callback: res => {
        if (res) {
          setOverviewMonitorInfo(res?.bean);
        }
      }
    });
  };

  const getUserTeams = () => {
    const { dispatch } = props;
    dispatch({
      type: 'global/fetchMyTeams',
      payload: {
        enterprise_id: params?.eid,
        page: 0,
        page_size: 5
        //name
      },
      callback: res => {
        if (res) {
          const list = res?.list;
          setTeamList(list);
        }
      }
    });
  };

  const handleTabsChange = key => setActiveKey(key);

  const handleClose = () => setIsShowAdvice(false);

  return (
    <>
      <div className={styles['home-view']}>
        <Row className={styles['home-view-header']}>
          <div className={styles['home-view-header-wrap']}>
            <Row className={styles['home-view-header-wrap-title']}>
              <img src={HomeCloud} alt="" style={{ marginRight: 8 }} />
              <span>{HOME_HEAD_TITLE}</span>
            </Row>
            <Row className={styles['home-view-header-wrap-introduce']}>
              {HOME_HEAD_INTRODUCE}
            </Row>
          </div>
        </Row>
        <div className={styles['home-view-content']}>
          <Row gutter={16}>
            <Col span={18} className={styles['home-view-content-left']}>
              <Row className={styles['home-view-content-left-useinfo']}>
                <Row className={styles['home-view-content-left-useinfo-title']}>
                  {HOME_CONTENT_USEINFO_TITLE}
                  <Tooltip placement="top" title={HOME_CONTENT_USEINFO_TOOLTIP}>
                    <img
                      src={Tooltips}
                      alt=""
                      style={{ cursor: 'pointer', marginLeft: 4 }}
                    />
                  </Tooltip>
                </Row>
                <Card
                  bordered={false}
                  className={styles['home-view-content-left-useinfo-card']}
                >
                  <Spin spinning={homeInfoLoading}>
                    {useList.length !== 0 ? (
                      <Row gutter={40}>
                        <Col span={8}>
                          <div
                            id="radar"
                            className={
                              styles[
                                'home-view-content-left-useinfo-card-radar'
                              ]
                            }
                          ></div>
                        </Col>
                        <Col span={16} style={{ margin: '16px 0px 0px' }}>
                          {useList.map(item => {
                            pieChartsId.push({
                              id: `pie-charts-${item.id}`,
                              item
                            });
                            return (
                              <>
                                <Row
                                  className={
                                    styles[
                                      'home-view-content-left-useinfo-card-list'
                                    ]
                                  }
                                  key={item.id}
                                >
                                  <div
                                    className={
                                      styles[
                                        'home-view-content-left-useinfo-card-list-type'
                                      ]
                                    }
                                    // span={8}
                                  >
                                    <div
                                      className={
                                        styles[
                                          'home-view-content-left-useinfo-card-list-type-pie'
                                        ]
                                      }
                                      id={`pie-charts-${item.id}`}
                                    ></div>
                                  </div>
                                  <Row
                                    className={
                                      styles[
                                        'home-view-content-left-useinfo-card-list-wrap'
                                      ]
                                    }
                                  >
                                    <Col span={8}>
                                      <div
                                        className={
                                          styles[
                                            'home-view-content-left-useinfo-card-list-wrap-info'
                                          ]
                                        }
                                      >
                                        <div
                                          className={
                                            styles[
                                              'home-view-content-left-useinfo-card-list-wrap-info-text'
                                            ]
                                          }
                                        >
                                          {item.percentage}
                                          <span className={styles.unit}>%</span>
                                        </div>
                                        <div
                                          className={
                                            styles[
                                              'home-view-content-left-useinfo-card-list-wrap-title'
                                            ]
                                          }
                                        >
                                          {item.whoUse}
                                        </div>
                                      </div>
                                    </Col>
                                    <Col
                                      span={8}
                                      className={
                                        styles[
                                          'home-view-content-left-useinfo-card-list-wrap-info'
                                        ]
                                      }
                                    >
                                      <div
                                        className={
                                          styles[
                                            'home-view-content-left-useinfo-card-list-wrap-info-text'
                                          ]
                                        }
                                      >
                                        {item.use}
                                        <span className={styles.unit}>
                                          {item.unit}
                                        </span>
                                      </div>
                                      <div
                                        className={
                                          styles[
                                            'home-view-content-left-useinfo-card-list-wrap-title'
                                          ]
                                        }
                                      >
                                        {HOME_CONTENT_USEINFO_USED}
                                      </div>
                                    </Col>
                                    <Col
                                      span={8}
                                      className={
                                        styles[
                                          'home-view-content-left-useinfo-card-list-wrap-total'
                                        ]
                                      }
                                    >
                                      <div
                                        className={
                                          styles[
                                            'home-view-content-left-useinfo-card-list-wrap-info-text'
                                          ]
                                        }
                                      >
                                        {item.total}
                                        <span className={styles.unit}>
                                          {item.unit}
                                        </span>
                                      </div>
                                      <div
                                        className={
                                          styles[
                                            'home-view-content-left-useinfo-card-list-wrap-title'
                                          ]
                                        }
                                      >
                                        {HOME_CONTENT_USEINFO_TOTAL}
                                      </div>
                                    </Col>
                                  </Row>
                                </Row>
                              </>
                            );
                          })}
                        </Col>
                      </Row>
                    ) : (
                      <Empty description="暂无数据" />
                    )}
                  </Spin>
                </Card>
              </Row>
              <Row className={styles['home-view-content-left-eventinfo']}>
                <Row>
                  <div className={styles.tabs}>
                    {tabList.map((item, index) => {
                      return (
                        <div
                          className={
                            index === activeKey
                              ? styles['tab-active']
                              : styles.tabpane
                          }
                          onClick={() => {
                            setActiveKey(index);
                          }}
                        >
                          {item.name}
                          <Tooltip placement="top" title={item.tooltip}>
                            <img
                              src={Tooltips}
                              alt=""
                              style={{ cursor: 'pointer', marginLeft: 4 }}
                            />
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                </Row>
                <>
                  <Card
                    bordered={false}
                    className={
                      styles['home-view-content-left-eventinfo-service']
                    }
                  >
                    <Spin spinning={homeAppLoading}>
                      {activeKey === 0 && (
                        <Row>
                          <Row className={styles.header}>
                            <Col
                              span={12}
                              style={{
                                display: 'flex',
                                justifyContent: 'center'
                              }}
                            >
                              <div className={styles['header-wrap-overview']}>
                                {groupList.map((item, index) => {
                                  return (
                                    <div
                                      className={
                                        styles['header-wrap-overview-container']
                                      }
                                    >
                                      <div className={styles.count}>
                                        {item.count}
                                      </div>
                                      <div className={styles.title}>
                                        {index !== 0 && (
                                          <span
                                            className={styles.tag}
                                            style={{
                                              backgroundColor: `${tagColorList[index]}`
                                            }}
                                          ></span>
                                        )}
                                        {item.text}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Col>
                            <Col
                              span={12}
                              style={{
                                display: 'flex',
                                justifyContent: 'center'
                              }}
                            >
                              <div className={styles['header-wrap-overview']}>
                                {serviceList.map((item, index) => {
                                  return (
                                    <div
                                      className={
                                        styles['header-wrap-overview-container']
                                      }
                                    >
                                      <div className={styles.count}>
                                        {item.count}
                                      </div>
                                      <div className={styles.title}>
                                        {index !== 0 && (
                                          <span
                                            className={styles.tag}
                                            style={{
                                              backgroundColor: `${tagColorList[index]}`
                                            }}
                                          ></span>
                                        )}
                                        {item.text}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col span={12}>
                              <div className={styles.wrap}>
                                <div
                                  className={styles.appcharts}
                                  id="app-charts"
                                ></div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className={styles.wrap}>
                                <div
                                  className={styles.appcharts}
                                  id="service-charts"
                                ></div>
                              </div>
                            </Col>
                          </Row>
                        </Row>
                      )}
                      {activeKey === 1 && (
                        <div style={{ padding: '20px 24px' }}>
                          <Table
                            columns={GroupNodeColunms}
                            dataSource={groupNodeList}
                            loading={homeInfoLoading}
                            pagination={{
                              pageSize: 5,
                              total: groupNodeList.length,
                              showTotal: total => `总共${total}条`
                            }}
                          />
                        </div>
                      )}
                      {activeKey === 2 && (
                        <div style={{ padding: '20px 24px' }}>
                          <Table
                            columns={GroupEventColunms}
                            dataSource={groupEventList}
                            loading={groupEventLoading}
                            pagination={{
                              pageSize: 5,
                              total: groupEventList.length,
                              showTotal: total => `总共${total}条`
                            }}
                          />
                        </div>
                      )}
                    </Spin>
                  </Card>
                </>
              </Row>
            </Col>
            <Col span={6} className={styles['home-view-content-right']}>
              <Row className={styles['home-view-content-right-teaminfo']}>
                <Card
                  bordered={false}
                  className={styles['home-view-content-right-teaminfo-card']}
                >
                  <Row>
                    <Col span={8} className={styles.wrap}>
                      <div className={styles.count}>
                        {overviewInfo?.total_teams || '0'}
                      </div>
                      <div className={styles.title}>
                        <span style={{ verticalAlign: 'middle' }}>
                          团队数量
                        </span>
                        <Tooltip placement="top" title="平台管理的团队数">
                          <img
                            src={Tooltips}
                            alt=""
                            style={{ cursor: 'pointer', marginLeft: 4 }}
                          />
                        </Tooltip>
                      </div>
                    </Col>
                    <Col span={8} className={styles.wrap}>
                      <div className={styles.count}>
                        {overviewInfo?.total_users || '0'}
                      </div>
                      <div className={styles.title}>
                        <span style={{ verticalAlign: 'middle' }}>
                          用户数量
                        </span>
                        <Tooltip placement="top" title="所有团队的用户总数">
                          <img
                            src={Tooltips}
                            alt=""
                            style={{ cursor: 'pointer', marginLeft: 4 }}
                          />
                        </Tooltip>
                      </div>
                    </Col>
                    <Col span={8} className={styles.wrap}>
                      <div className={styles.count}>
                        {overviewMonitorInfo?.total_regions || 0}
                      </div>
                      <div className={styles.title}>
                        <span style={{ verticalAlign: 'middle' }}>
                          集群数量
                        </span>
                        <Tooltip placement="top" title="平台纳管的集群数量">
                          <img
                            src={Tooltips}
                            alt=""
                            style={{ cursor: 'pointer', marginLeft: 4 }}
                          />
                        </Tooltip>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Row>
              {isShowAdvice && (
                <Row>
                  <div className={styles['home-view-content-right-advice']}>
                    <div>
                      <img
                        className={styles.close}
                        src={Close}
                        alt=""
                        onClick={handleClose}
                      />
                    </div>
                  </div>
                </Row>
              )}
              <Row className={styles['home-view-content-right-myteam']}>
                <div className={styles['home-view-content-right-myteam-title']}>
                  <div>我的团队</div>
                </div>
                <Card
                  bordered={false}
                  className={styles['home-view-content-right-myteam-card']}
                  style={{ height: isShowAdvice ? 438 : 620 }}
                >
                  <Row>
                    <Spin spinning={teamListLoading}>
                      {teamList.length > 0 ? (
                        teamList.map((item, n) => {
                          return (
                            <div
                              className={
                                styles[
                                  'home-view-content-right-myteam-card-group'
                                ]
                              }
                            >
                              <div
                                className={
                                  styles[
                                    'home-view-content-right-myteam-card-group-title'
                                  ]
                                }
                              >
                                <img
                                  src={HomeTeam}
                                  alt=""
                                  style={{ marginRight: 14 }}
                                />
                                {item.team_alias}
                              </div>
                              <div
                                className={
                                  styles[
                                    'home-view-content-right-myteam-card-group-cluster'
                                  ]
                                }
                              >
                                {item.region_list.length > 0 &&
                                  item.region_list.map((i, index) => (
                                    <div style={{ marginRight: 24 }}>
                                      <span
                                        onMouseEnter={() => {
                                          setIsHover(true);
                                          setCurrentIndex(index);
                                          setCurrentParentIndex(n);
                                        }}
                                        onMouseLeave={() => {
                                          setIsHover(true);
                                          setCurrentIndex(-1);
                                          setCurrentParentIndex(-1);
                                        }}
                                        onClick={() => {
                                          dispatch(
                                            routerRedux.push(
                                              `/team/${item.team_name}/region/${i.region_name}/index`
                                            )
                                          );
                                        }}
                                      >
                                        <img
                                          src={
                                            isHover &&
                                            currentIndex === index &&
                                            currentParentIndex === n
                                              ? GroupHoverImg
                                              : GroupImg
                                          }
                                          alt=""
                                        />
                                        <span
                                          style={{
                                            verticalAlign: 'middle',
                                            margin: '0 4px 0 8px'
                                          }}
                                        >
                                          {i.region_alias}
                                        </span>
                                        <img
                                          src={
                                            isHover &&
                                            currentIndex === index &&
                                            currentParentIndex === n
                                              ? RightHoverImg
                                              : RightImg
                                          }
                                          alt=""
                                        />
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <Empty description="暂无数据" />
                      )}
                    </Spin>
                  </Row>
                </Card>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default connect(({ user, global, index, loading }) => ({
  user: user.currentUser,
  wutongInfo: global.wutongInfo,
  overviewInfo: index.overviewInfo,
  homeInfoLoading: loading.effects['global/fetchHomeInfo'],
  groupEventLoading: loading.effects['global/fetchHomeGroupEvent'],
  teamListLoading: loading.effects['global/fetchMyTeams'],
  homeAppLoading: loading.effects['global/fetchHomeAppInfo']
}))(Home);
