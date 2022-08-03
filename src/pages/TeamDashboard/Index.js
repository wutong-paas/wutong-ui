/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable eqeqeq */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/sort-comp */
import {
  Button,
  Empty,
  Form,
  Input,
  notification,
  Pagination,
  Row,
  Col,
  Spin,
  Card,
  Table,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import EditGroupName from '../../components/AddOrEditGroup';
import AppState from '../../components/ApplicationState';
import Result from '../../components/Result';
import VisterBtn from '../../components/visitBtnForAlllink';
import globalUtil from '../../utils/global';
import userUtil from '../../utils/user';
import Tooltips from '../../../public/images/home/tooltip.svg';
import AppTotal from '../../../public/images/team/app_total.svg';
import MemoryImg from '../../../public/images/team/memory.svg';
import CpuImg from '../../../public/images/team/cpu.svg';
import ComponentImg from '../../../public/images/team/component.svg';
import styles from './Index.less';
import roleUtil from '@/utils/role';
import { listColunms } from './conf';
import { computedPercentage } from '../../utils/utils';

const { Search } = Input;
const echarts = require('echarts');
const appLogo = require('@/assets/teamAppLogo.svg');
const defaultAppLogo = require('@/assets/application.png');
const componentLogo = require('@/assets/teamComponentLogo.svg');
const statusList = [
  { title: '全部', count: 0, key: 'total', color: 'rgba(204, 217, 255, 1)' },
  { title: '运行中', count: 0, key: 'running', color: 'rgba(8, 199, 127, 1)' },
  { title: '启动中', count: 0, key: 'starting', color: 'rgba(0, 112, 255, 1)' },
  { title: '关闭', count: 0, key: 'closed', color: 'rgba(133, 137, 150, 1)' },
  { title: '异常', count: 0, key: 'abnormal', color: 'rgba(253, 106, 106, 1)' },
  { title: '闲置', count: 0, key: 'nil', color: 'rgba(255, 191, 119, 1)' }
];
@connect(({ user, index, loading, global, teamControl, enterprise }) => ({
  currUser: user.currentUser,
  index,
  enterprise: global.enterprise,
  events: index.events,
  pagination: index.pagination,
  wutongInfo: global.wutongInfo,
  currentTeam: teamControl.currentTeam,
  currentRegionName: teamControl.currentRegionName,
  currentEnterprise: enterprise.currentEnterprise,
  loading,
  currentTeamPermissionsInfo: teamControl.currentTeamPermissionsInfo
}))
@Form.create()
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 团队应用的图表数据
      appColorData: {
        value: 70,
        company: '%',
        ringColor: [
          {
            offset: 0,
            color: '#4f75af' // 0% 处的颜色
          },
          {
            offset: 1,
            color: '#4f75af' // 100% 处的颜色
          }
        ]
      },
      // 分页的总数据
      total: null,
      // 页面加载的loading
      loadingOverview: true,
      loadedOverview: false,
      loadingOfApp: true,
      // 热门应用查询参数
      page: 1,
      page_size: 10,
      query: '',
      // 热门应用列表
      teamHotAppList: [],
      pageSizeOptions: ['12', '16', '20', '24', '28'],
      // 新建应用显示与隐藏
      createAppVisible: false,
      emptyConfig: false,
      searchVisible: false,
      permissionsInfo: {},
      activeKey: 0,
      tablist: [],
      stauts: undefined
    };
  }
  componentDidMount() {
    //  获取团队的权限
    const { currUser, currentTeamPermissionsInfo } = this.props;
    const teamPermissions = userUtil.getTeamByTeamPermissions(
      currUser.teams,
      globalUtil.getCurrTeamName()
    );
    if (teamPermissions && teamPermissions.length !== 0) {
      // 加载团队下的资源
      this.loadOverview();
    }
    if (currentTeamPermissionsInfo) {
      const permissionsInfo = roleUtil.querySpecifiedPermissionsInfo(
        currentTeamPermissionsInfo,
        'queryAppInfo'
      );
      this.setState({
        permissionsInfo
      });
    }
  }
  // 组件销毁停止计时器
  componentWillUnmount() {
    // 组件销毁时,清除应用列表定时器
    this.handleClearTimeout(this.loadHotAppTimer);
    // 组件销毁  清除团队下资源的定时器
    this.handleClearTimeout(this.loadTeamTimer);
  }
  // 应用图标
  initAppCharts = () => {
    const { index } = this.props;
    const appCharts = echarts.init(document.querySelector('#app-pies'));
    const components = echarts.init(document.querySelector('#components-pies'));
    // const option = {
    //   series: [
    //     {
    //       type: 'pie',
    //       radius: ['30%', '47%'],
    //       avoidLabelOverlap: false,
    //       startAngle: 0,
    //       center: ['50%', '70%'],
    //       label: {
    //         show: false,
    //         position: 'center'
    //       },
    //       emphasis: {
    //         // label: {
    //         //   show: true,
    //         //   fontSize: '40',
    //         //   fontWeight: 'bold'
    //         // }
    //         scale: false
    //       },
    //       labelLine: {
    //         show: false
    //       },
    //       data: [
    //         { value: 5, itemStyle: { color: '#08153A' } },
    //         { value: 10, itemStyle: { color: '#CCD9FF' } }
    //       ]
    //     }
    //   ]
    // };
    const option = (title, index) => {
      return {
        title: {
          text: title,
          textStyle: {
            color: '#000',
            fontSize: 12,
            fontWeight: 'bold'
          },
          left: 'center',
          top: 140,
          bottom: '10%',
          itemGap: 60
        },
        tooltip: {
          show: false
        },
        color: ['#01dadc', '#23cea7', '#5096e0'],
        series: [
          {
            name: '危急',
            type: 'pie',
            startAngle: 0,
            hoverAnimation: false,
            radius: ['60%', '87%'],
            center: ['50%', '100%'],
            itemStyle: {
              borderColor: '#fff',
              borderWidth:
                title === '应用统计'
                  ? index?.overviewInfo?.running_app_num === 0 &&
                    index?.overviewInfo?.team_app_num === 0
                    ? 0
                    : 4
                  : index?.overviewInfo?.running_component_num === 0 &&
                    index?.overviewInfo?.team_service_num === 0
                  ? 0
                  : 4
            },
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '10',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              {
                value:
                  title === '应用统计'
                    ? index?.overviewInfo?.team_app_num
                    : index?.overviewInfo?.team_service_num,
                itemStyle: {
                  normal: {
                    color: 'rgba(1,218,220,0)'
                  }
                }
              },
              {
                value:
                  title === '应用统计'
                    ? index?.overviewInfo?.running_app_num
                    : index?.overviewInfo?.running_component_num,
                itemStyle: {
                  normal: {
                    color:
                      title === '应用统计'
                        ? index?.overviewInfo?.running_app_num === 0 &&
                          index?.overviewInfo?.team_app_num === 0
                          ? 'rgba(204, 217, 255, 1)'
                          : 'rgba(8, 21, 58, 1)'
                        : index?.overviewInfo?.running_component_num === 0 &&
                          index?.overviewInfo?.team_service_num === 0
                        ? 'rgba(204, 217, 255, 1)'
                        : 'rgba(8, 21, 58, 1)'
                  }
                }
              },
              {
                value:
                  title === '应用统计'
                    ? index?.overviewInfo?.team_app_num -
                      index?.overviewInfo?.running_app_num
                    : index?.overviewInfo?.team_service_num -
                      index?.overviewInfo?.running_component_num,
                itemStyle: {
                  normal: {
                    color: 'rgba(204, 217, 255, 1)'
                  }
                }
              }
            ]
          }
        ]
      };
    };
    appCharts.setOption(option('应用统计', index));
    components.setOption(option('组件统计', index));
    window.addEventListener('resize', function() {
      // 让我们的图表调用 resize这个方法
      appCharts.resize();
      components.resize();
    });
  };
  // 搜索应用
  onSearch = value => {
    this.setState(
      {
        query: value,
        loadingOfApp: true,
        page: 1,
        searchVisible: true
      },
      () => {
        this.loadHotApp();
      }
    );
  };
  // 筛选应用
  handleFilter = key => {
    const { loadingOfApp } = this.state;
    if (!loadingOfApp) {
      this.setState(
        {
          status: key === 'total' ? undefined : key,
          loadingOfApp: true,
          searchVisible: true,
          page: 1
        },
        () => {
          this.loadHotApp();
        }
      );
    }
  };

  // pageSize变化的回调
  handleChangePageSize = (current, size) => {
    this.setState(
      {
        page_size: size,
        loadingOfApp: true
      },
      () => {
        this.loadHotApp();
      }
    );
  };
  // pageNum变化的回调
  handleChangePage = (page, pageSize) => {
    this.setState(
      {
        page,
        loadingOfApp: true
      },
      () => {
        this.loadHotApp();
      }
    );
  };
  // 获取团队下的基本信息
  loadOverview = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'index/fetchOverview',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName()
      },
      callback: res => {
        if (res && res.bean && res.bean.region_health) {
          this.setState(
            { loadingOverview: false, loadedOverview: true },
            () => {
              const { index } = this.props;
              // 加载echarts图表
              this.initAppCharts();
              // this.loadTeamAppEcharts();
              // 加载热门应用模块
              if (!this.loadHotAppTimer) {
                this.loadHotApp();
              }
            }
          );
          // 每隔10s获取最新的团队下的资源
          this.handleTimers(
            'loadTeamTimer',
            () => {
              this.loadOverview();
            },
            10000
          );
        } else {
          this.handleCloseLoading();
        }
      },
      handleError: () => {
        this.handleCloseLoading();
      }
    });
  };
  // 加载热门应用数据源
  loadHotApp = () => {
    const { page, page_size, query, emptyConfig, status } = this.state;
    this.props.dispatch({
      type: 'global/getTeamAppList',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region: globalUtil.getCurrRegionName(),
        query,
        page,
        page_size,
        status
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const list = statusList.map(item => {
            if (typeof res?.bean[item.key] === 'number') {
              item.count = res?.bean[item.key];
            }
            return item;
          });
          this.setState({
            teamHotAppList: res.list,
            total: res.bean && res.bean.total,
            tablist: list,
            loadingOfApp: false,
            emptyConfig: false,
            searchVisible: false
          });
          // 每隔10s获取最新的列表数据
          this.handleTimers(
            'loadHotAppTimer',
            () => {
              this.loadHotApp();
            },
            10000
          );
        }
        if (res && res.list && res.list.length === 0 && query) {
          this.setState({
            emptyConfig: true
          });
        }
      },
      handleError: err => {
        if (err && err.data && err.data.code === 10401) {
          this.setState(
            {
              page: 1
            },
            () => {
              this.loadHotApp();
            }
          );
        }
      }
    });
  };
  // 计算资源大小和单位
  handlUnit = (num, unit) => {
    if (num || unit) {
      let nums = num;
      let units = unit;
      if (nums >= 1024) {
        nums = num / 1024;
        units = 'GB';
      }
      return unit ? units : nums.toFixed(1);
    }
    return num;
  };
  // 关闭loading
  handleCloseLoading = () => {
    this.setState({ loadingOverview: false, loadedOverview: true });
  };
  // 加载当前团队的权限
  handleTeamPermissions = callback => {
    const { currUser } = this.props;
    const teamPermissions = userUtil.getTeamByTeamPermissions(
      currUser.teams,
      globalUtil.getCurrTeamName()
    );
    if (teamPermissions && teamPermissions.length !== 0) {
      callback();
    }
  };
  // 定时器获取最新的接口数据
  handleTimers = (timerName, callback, times) => {
    if (this[timerName]) {
      this.handleClearTimeout(this[timerName]);
    }
    this.handleTeamPermissions(() => {
      this[timerName] = setTimeout(() => {
        callback();
      }, times);
    });
  };
  // 组件销毁 停止定时器
  handleClearTimeout = timer => {
    if (timer) {
      clearTimeout(timer);
    }
  };
  // OK
  handleOkApplication = () => {
    notification.success({ message: '添加成功' });
    this.handleCancelApplication();
    // 重新加载页面数据
    this.loadOverview();
  };
  // Cancel
  handleCancelApplication = () => {
    this.setState({
      createAppVisible: false
    });
  };
  // 新建应用时的loading优化
  handleAppLoading = () => {
    this.setState({
      loadingOfApp: true
    });
  };

  handleGotoApplication = (teamName, regionName, record) => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push(
        `/team/${teamName}/region/${regionName}/apps/${record.group_id}`
      )
    );
  };

  render() {
    const {
      loadingOverview,
      loadedOverview,
      teamHotAppList,
      total,
      pageSizeOptions,
      createAppVisible,
      loadingOfApp,
      page,
      page_size,
      query,
      emptyConfig,
      searchVisible,
      permissionsInfo,
      activeKey,
      tablist
    } = this.state;
    const {
      index,
      dispatch,
      location: {
        query: { team_alias }
      }
    } = this.props;
    // 当前团队名称
    const teamName = globalUtil.getCurrTeamName();
    // 当前集群名称
    const regionName = globalUtil.getCurrRegionName();
    // 团队应用
    return (
      <Fragment>
        {index.overviewInfo.region_health && (
          <div className={styles.teamAppTitle}>
            {/* <span>{globalUtil.fetchSvg('teamViewTitle')}</span>
            <h2 className={styles.topContainerTitle}>
              {index.overviewInfo.team_alias}
            </h2> */}
            <div className={styles.left}>
              <div className={styles.title}>团队名称</div>
              <div className={styles.teamname}>
                {index?.overviewInfo?.team_alias || '-'}
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.title}>成员人数</div>
              <div
                className={styles.usercount}
                title="点击可跳转至成员页面"
                onClick={() => {
                  dispatch(
                    routerRedux.push({
                      pathname: `/team/${teamName}/region/${regionName}/team`,
                      state: { config: 'member' }
                    })
                  );
                }}
              >
                {(index.overviewInfo && index.overviewInfo.user_nums) || 0}
              </div>
            </div>
          </div>
        )}
        {index.overviewInfo.region_health && (
          <Row className={styles.info} gutter={16}>
            <Col span={8}>
              <Card className={styles.card} bordered={false}>
                <Row className={styles.wrap}>
                  <Col span={12} className={styles.left}>
                    <div className={styles.title}>
                      应用
                      <Tooltip
                        placement="top"
                        title="团队所有应用运行情况统计信息"
                      >
                        <img
                          src={Tooltips}
                          alt=""
                          style={{ cursor: 'pointer', marginLeft: 4 }}
                        />
                      </Tooltip>
                    </div>
                    <div className={styles.appinfo}>
                      <div className={styles.top}>
                        <img src={AppTotal} alt="" />
                        <span>应用总数</span>
                      </div>
                      <div className={styles.bottom}>
                        <span className={styles.count}>
                          {(index.overviewInfo &&
                            index.overviewInfo.team_app_num) ||
                            0}
                        </span>
                        <span className={styles.unit}>个</span>
                      </div>
                    </div>
                  </Col>
                  <Col span={12} className={styles.right}>
                    <div className={styles.top}>
                      <div className={styles.wrap} id="app-pies"></div>
                    </div>
                    <div className={styles.bottom}>
                      <div className={styles.left}>
                        <div className={styles.title}>
                          <span className={styles.badge}></span>
                          运行中
                        </div>
                        <div className={styles.count}>
                          {index.overviewInfo.running_app_num || 0}
                        </div>
                      </div>
                      <div className={styles.right}>
                        <div className={styles.title}>
                          <span className={styles.badge}></span>
                          未运行
                        </div>
                        <div className={styles.count}>
                          {index.overviewInfo.team_app_num -
                            index.overviewInfo.running_app_num || 0}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8} bordered={false}>
              <Card className={styles.card} bordered={false}>
                <Row className={styles.wrap}>
                  <Col span={12} className={styles.left}>
                    <div className={styles.title}>
                      组件
                      <Tooltip
                        placement="top"
                        title="团队所有组件运行情况统计信息"
                      >
                        <img
                          src={Tooltips}
                          alt=""
                          style={{ cursor: 'pointer', marginLeft: 4 }}
                        />
                      </Tooltip>
                    </div>
                    <div className={styles.appinfo}>
                      <div className={styles.top}>
                        <img src={ComponentImg} alt="" />
                        <span>组件总数</span>
                      </div>
                      <div className={styles.bottom}>
                        <span className={styles.count}>
                          {(index.overviewInfo &&
                            index.overviewInfo &&
                            index.overviewInfo.team_service_num) ||
                            0}
                        </span>
                        <span className={styles.unit}>个</span>
                      </div>
                    </div>
                  </Col>
                  <Col span={12} className={styles.right}>
                    <div className={styles.top}>
                      <div className={styles.wrap} id="components-pies"></div>
                    </div>
                    <div className={styles.bottom}>
                      <div className={styles.left}>
                        <div className={styles.title}>
                          <span className={styles.badge}></span>
                          运行中
                        </div>
                        <div className={styles.count}>
                          {index.overviewInfo.running_component_num || 0}
                        </div>
                      </div>
                      <div className={styles.right}>
                        <div className={styles.title}>
                          <span className={styles.badge}></span>
                          未运行
                        </div>
                        <div className={styles.count}>
                          {index.overviewInfo.team_service_num -
                            index.overviewInfo.running_component_num || 0}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={8} bordered={false}>
              <Card className={styles.card} bordered={false}>
                <div className={styles.title}>
                  资源使用
                  <Tooltip placement="top" title="团队所有应用使用资源统计信息">
                    <img
                      src={Tooltips}
                      alt=""
                      style={{ cursor: 'pointer', marginLeft: 4 }}
                    />
                  </Tooltip>
                </div>
                <Row gutter={20}>
                  <Col span={12}>
                    <div className={styles.appinfo}>
                      <div className={styles.top}>
                        <img src={CpuImg} alt="" />
                        <span>CPU使用率</span>
                      </div>
                      <div className={styles.bottom}>
                        <span className={styles.count}>
                          {computedPercentage(
                            index?.overviewInfo?.team_service_use_cpu || 0,
                            index?.overviewInfo?.team_service_total_cpu || 0
                          )}
                        </span>
                        <span className={styles.unit}>%</span>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.appinfo}>
                      <div className={styles.top}>
                        <img src={MemoryImg} alt="" />
                        <span>内存使用率</span>
                      </div>
                      <div className={styles.bottom}>
                        <span className={styles.count}>
                          {computedPercentage(
                            index?.overviewInfo?.team_service_memory_count || 0,
                            index?.overviewInfo?.team_service_total_memory || 0
                          )}
                        </span>
                        <span className={styles.unit}>%</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
        {index?.overviewInfo?.region_health && (
          <Row>
            <Card className={styles.list} bordered={false}>
              <div className={styles.title}>
                <div className={styles.text}>
                  <Tooltip placement="top" title="团队中所有应用的列表">
                    应用列表
                  </Tooltip>
                </div>
                <div>
                  {permissionsInfo?.isCreate && (
                    <Tooltip placement="top" title="创建一个新的应用">
                      <Button
                        onClick={() => {
                          this.setState({ createAppVisible: true });
                        }}
                      >
                        新建应用
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className={styles.actions}>
                <div className={styles.tabs}>
                  {tablist.length > 0 &&
                    tablist.map((item, index) => {
                      return (
                        <div
                          className={
                            activeKey === index ? styles.active : styles.tabpane
                          }
                          key={index}
                          onClick={() => {
                            this.setState({ activeKey: index });
                            this.handleFilter(item.key);
                          }}
                        >
                          <div>{item.title}</div>
                          <div
                            className={styles.badge}
                            style={{ backgroundColor: `${item.color}` }}
                          >
                            {item.count}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div>
                  {(!loadingOfApp || searchVisible) && (
                    <Search
                      placeholder="请输入应用名称进行搜索"
                      onSearch={this.onSearch}
                      defaultValue={query}
                      allowClear
                      style={{ width: 400, marginLeft: 24 }}
                      className={styles.search}
                    />
                  )}
                </div>
              </div>
              <div>
                <Table
                  columns={listColunms(record =>
                    this.handleGotoApplication(teamName, regionName, record)
                  )}
                  loading={loadingOfApp}
                  dataSource={teamHotAppList}
                  onRow={record => {
                    return {
                      onClick: event => {}, // 点击行
                      onDoubleClick: event => {
                        dispatch(
                          routerRedux.push(
                            `/team/${teamName}/region/${regionName}/apps/${record.group_id}`
                          )
                        );
                      }
                    };
                  }}
                  pagination={{
                    // showSizeChanger,
                    onShowSizeChange: this.handleChangePageSize,
                    current: page,
                    pageSize: page_size,
                    total: total,
                    showTotal: total => `总共${total}条`,
                    pageSizeOptions: pageSizeOptions,
                    onChange: this.handleChangePage
                  }}
                  rowKey="group_id"
                />
              </div>
            </Card>
          </Row>
        )}

        {/* 新建应用 */}
        {createAppVisible && (
          <EditGroupName
            title="新建应用"
            onCancel={this.handleCancelApplication}
            onOk={this.handleOkApplication}
            handleAppLoading={this.handleAppLoading}
          />
        )}
        {/* 集群不健康的情况 */}
        {loadedOverview &&
          index.overviewInfo &&
          !index.overviewInfo.region_health && (
            <div style={{ marginTop: 300 }}>
              <Result
                type="warning"
                title="集群端失去响应，稍后重试"
                description="若一直无法加载，请联系集群管理员查看集群状态"
                actions={[
                  <Button
                    loading={loadingOverview}
                    onClick={this.loadOverview}
                    type="primary"
                    key="console"
                  >
                    重新加载
                  </Button>
                ]}
              />
            </div>
          )}
      </Fragment>
    );
  }
}
