/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/sort-comp */
/* eslint-disable camelcase */
import NewbieGuiding from '@/components/NewbieGuiding';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Icon,
  Input,
  Menu,
  notification,
  Pagination,
  Row,
  Spin,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import WarningImg from '../../../public/images/warning.png';
import ConfirmModal from '../../components/ConfirmModal';
import CreateTeam from '../../components/CreateTeam';
import JoinTeam from '../../components/JoinTeam';
import OpenRegion from '../../components/OpenRegion';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import roleUtil from '../../utils/role';
import userUtil from '../../utils/user';
import styles from './index.less';
import Tooltips from '../../../public/images/home/tooltip.svg';

const { Search } = Input;

@connect(({ user }) => ({
  user: user.currentUser
}))
export default class EnterpriseTeams extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      teamList: [],
      userTeamList: [],
      overviewTeamInfo: false,
      showAddTeam: false,
      showExitTeam: false,
      showDelApply: false,
      ApplyInfo: false,
      exitTeamName: '',
      enterpriseTeamsLoading: false,
      userTeamsLoading: true,
      overviewTeamsLoading: true,
      adminer,
      showDelTeam: false,
      page: 1,
      page_size: 10,
      name: '',
      total: 1,
      joinTeam: false,
      delTeamLoading: false,
      showOpenRegion: false,
      initShow: false,
      guideStep: 1,
      searchConfig: false
    };
  }
  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.load();
    }
  }

  onPageChangeTeam = (page, pageSize) => {
    this.setState({ page, page_size: pageSize }, () => {
      this.getEnterpriseTeams();
    });
  };

  getEnterpriseTeams = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { page, page_size, name } = this.state;
    dispatch({
      type: 'global/fetchEnterpriseTeams',
      payload: {
        page,
        page_size,
        enterprise_id: eid,
        name
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            total: (res.bean && res.bean.total_count) || 1,
            initShow: this.state.searchConfig
              ? false
              : res.bean.total_count === 0,
            teamList: (res.bean && res.bean.list) || [],
            enterpriseTeamsLoading: false,
            searchConfig: false
          });
        }
      }
    });
  };
  getUserTeams = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { page, page_size, name } = this.state;
    dispatch({
      type: 'global/fetchMyTeams',
      payload: {
        enterprise_id: eid,
        page,
        page_size,
        name
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            userTeamList: res.list,
            userTeamsLoading: false
          });
        }
      }
    });
  };

  load = () => {
    this.state.adminer && this.getEnterpriseTeams();
    this.getOverviewTeam();
    this.getUserTeams();
  };
  handleSearchTeam = name => {
    this.setState(
      {
        page: 1,
        name,
        searchConfig: true
      },
      () => {
        this.getEnterpriseTeams();
      }
    );
  };

  handlePaginations = () => (
    <Pagination
      current={this.state.page}
      pageSize={this.state.page_size}
      total={Number(this.state.total)}
      onChange={this.onPageChangeTeam}
    />
  );
  handleSearchUserTeam = name => {
    this.setState(
      {
        page: 1,
        name
      },
      () => {
        this.getUserTeams();
      }
    );
  };

  handleCreateTeam = values => {
    this.props.dispatch({
      type: 'teamControl/createTeam',
      payload: values,
      callback: (res) => {
        const { response_data } = res
        if (response_data && response_data.code) {
          if (response_data.code === 400) {
            notification.warning({ message: response_data.msg_show });
          } else {
            notification.success({ message: response_data.msg_show })
          }
        }
        // ?????????????????????????????????
        this.load();
        this.cancelCreateTeam();
      }
    });
  };

  getOverviewTeam = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;

    dispatch({
      type: 'global/fetchOverviewTeam',
      payload: {
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.setState({
            overviewTeamsLoading: false,
            overviewTeamInfo: res.bean
          });
        }
      }
    });
  };

  onAddTeam = () => {
    this.setState({ showAddTeam: true });
  };
  cancelCreateTeam = () => {
    this.setState({ showAddTeam: false, initShow: false });
  };
  showExitTeam = exitTeamName => {
    this.setState({ showExitTeam: true, exitTeamName });
  };

  handleExitTeam = () => {
    const { exitTeamName } = this.state;
    this.props.dispatch({
      type: 'teamControl/exitTeam',
      payload: {
        team_name: exitTeamName
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.getOverviewTeam();
          this.getUserTeams();
          this.hideExitTeam();
        }
      }
    });
  };

  hideExitTeam = () => {
    this.setState({ showExitTeam: false, exitTeamName: '' });
  };

  showApply = ApplyInfo => {
    this.setState({ showDelApply: true, ApplyInfo });
  };

  hideDelApply = () => {
    this.setState({ showDelApply: false, ApplyInfo: false });
  };

  handleActiveTabs = key => {
    this.setState(
      {
        name: '',
        page: 1
      },
      () => {
        if (key === 'team') {
          this.getOverviewTeam();
          this.getUserTeams();
        } else {
          this.getEnterpriseTeams();
        }
      }
    );
  };
  showCloseAllComponent = exitTeamName => {
    this.setState({ showCloseAllComponent: true, exitTeamName });
  };
  hideCloseAllComponent = () => {
    this.setState({ showCloseAllComponent: false, exitTeamName: '' });
  };

  showDelTeam = exitTeamName => {
    this.setState({ showDelTeam: true, exitTeamName });
  };

  hideDelTeam = () => {
    this.setState({ showExitTeam: false, showDelTeam: false });
  };
  handleCloseAllComponentInTeam = () => {
    const { exitTeamName, closeTeamComponentLoading } = this.state;
    if (closeTeamComponentLoading) {
      return;
    }
    this.setState({ closeTeamComponentLoading: true });
    this.props.dispatch({
      type: 'teamControl/stopComponentInTeam',
      payload: {
        team_name: exitTeamName
      },
      callback: res => {
        this.setState({ closeTeamComponentLoading: false });
        if (res && res.status_code === 200) {
          notification.success({ message: '????????????????????????????????????' });
        }
        this.hideCloseAllComponent();
      },
      handleError: err => {
        if (err.data) {
          notification.warning({
            message: err.data.msg_show
          });
        }
        notification.warning({
          message: '????????????????????????????????????'
        });
        this.setState({ closeTeamComponentLoading: false });
      }
    });
  };
  handleDelTeam = () => {
    const { exitTeamName, delTeamLoading } = this.state;
    if (delTeamLoading) {
      return;
    }
    this.setState({ delTeamLoading: true });
    this.props.dispatch({
      type: 'teamControl/delTeam',
      payload: {
        team_name: exitTeamName
      },
      callback: res => {
        this.setState({ delTeamLoading: false });
        if (res && res.status_code === 200) {
          this.setState(
            {
              page: 1
            },
            () => {
              this.getEnterpriseTeams();
            }
          );

          this.hideDelTeam();
          notification.success({ message: '??????????????????' });
        }
      },
      handleError: err => {
        if (err.data) {
          notification.warning({
            message: err.data.msg_show
          });
        }
        this.setState({ delTeamLoading: false });
      }
    });
  };

  handleDelApply = () => {
    const { ApplyInfo } = this.state;
    this.props.dispatch({
      type: 'teamControl/undoTeamUsers',
      payload: {
        team_name: ApplyInfo.team_name
      },
      callback: () => {
        notification.success({ message: '??????????????????' });
        this.getOverviewTeam();
        this.hideDelApply();
      }
    });
  };

  handleJoinTeam = values => {
    this.props.dispatch({
      type: 'global/joinTeam',
      payload: values,
      callback: () => {
        notification.success({ message: '??????????????????????????????' });
        this.getOverviewTeam();
        this.cancelJoinTeam();
      }
    });
  };

  onJoinTeam = () => {
    this.setState({ joinTeam: true });
  };
  cancelJoinTeam = () => {
    this.setState({ joinTeam: false });
  };

  showRegions = (team_name, regions, ismanagement = false) => {
    return (
      regions &&
      regions.length > 0 &&
      regions.map(item => {
        return (
          <Button
            key={`${item.region_name}region`}
            className={styles.regionShow}
            onClick={() => {
              if (ismanagement) {
                this.handleJoinTeams(team_name, item.region_name);
              } else {
                this.onJumpTeam(team_name, item.region_name);
              }
            }}
          >
            {item.region_alias}
            <Icon type="right" />
          </Button>
        );
      })
    );
  };
  handleJoinTeams = (teamName, region) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'teamControl/joinTeam',
      payload: {
        team_name: teamName
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.onJumpTeam(teamName, region);
        }
      }
    });
  };

  handleOpenRegion = regions => {
    const { openRegionTeamName } = this.state;
    this.props.dispatch({
      type: 'teamControl/openRegion',
      payload: {
        team_name: openRegionTeamName,
        region_names: regions.join(',')
      },
      callback: () => {
        this.load();
        this.cancelOpenRegion();
      }
    });
  };

  cancelOpenRegion = () => {
    this.setState({ showOpenRegion: false, openRegionTeamName: '' });
  };

  onJumpTeam = (team_name, region) => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push(`/team/${team_name}/region/${region}/index`));
  };
  handleNewbieGuiding = info => {
    const { prevStep, nextStep, jumpUrl = '' } = info;
    const { dispatch } = this.props;
    const { adminer } = this.state;
    return (
      <NewbieGuiding
        {...info}
        totals={2}
        handleClose={() => {
          this.handleGuideStep('close');
        }}
        handlePrev={() => {
          if (prevStep) {
            this.handleGuideStep(prevStep);
          }
        }}
        handleNext={() => {
          if (jumpUrl) {
            dispatch(routerRedux.push(jumpUrl));
          }
          if (nextStep) {
            if (nextStep === 2) {
              if (adminer) {
                this.onAddTeam();
              } else {
                this.onJoinTeam();
              }
            }
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

  render() {
    const {
      match: {
        params: { eid }
      }
    } = this.props;
    const {
      teamList,
      overviewTeamInfo,
      enterpriseTeamsLoading,
      overviewTeamsLoading,
      adminer,
      userTeamList,
      userTeamsLoading,
      delTeamLoading,
      showCloseAllComponent,
      closeTeamComponentLoading,
      initShow,
      guideStep
    } = this.state;

    const request_join_team =
      overviewTeamInfo &&
      overviewTeamInfo.request_join_team.filter(item => {
        if (item.is_pass === 0) {
          return item;
        }
      });
    const haveNewJoinTeam = request_join_team.length > 0;

    const userTeam = userTeamList && userTeamList.length > 0 && userTeamList;
    const moreSvg = () => (
      <svg
        t="1581212425061"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1314"
        width="32"
        height="32"
      >
        <path
          d="M512 192m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1315"
          fill="#999999"
        />
        <path
          d="M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1316"
          fill="#999999"
        />
        <path
          d="M512 832m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
          p-id="1317"
          fill="#999999"
        />
      </svg>
    );
    const menu = exitTeamName => {
      return (
        <Menu>
          <Menu.Item>
            <a
              onClick={() => {
                this.showExitTeam(exitTeamName);
              }}
            >
              ????????????
            </a>
          </Menu.Item>
        </Menu>
      );
    };

    const menucancel = item => {
      return (
        <Menu>
          <Menu.Item>
            <a
              onClick={() => {
                this.showApply(item);
              }}
            >
              ????????????
            </a>
          </Menu.Item>
        </Menu>
      );
    };

    const managementMenu = exitTeamName => {
      return (
        <Menu>
          <Menu.Item>
            <a
              onClick={() => {
                this.showCloseAllComponent(exitTeamName);
              }}
            >
              ??????????????????
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              onClick={() => {
                this.setState({
                  showOpenRegion: true,
                  openRegionTeamName: exitTeamName
                });
              }}
            >
              ????????????
            </a>
          </Menu.Item>
          <Menu.Item>
            <a
              onClick={() => {
                this.showDelTeam(exitTeamName);
              }}
            >
              ????????????
            </a>
          </Menu.Item>
        </Menu>
      );
    };
    const operation = (
      <Col span={7} style={{ textAlign: 'right' }} className={styles.btns}>
        {adminer ? (
          <Tooltip placement="top" title="????????????????????????">
            <Button
              type="primary"
              onClick={this.onAddTeam}
              style={{ marginRight: '5px' }}
            >
              ????????????
            </Button>
          </Tooltip>
        ) : (
          <Button type="primary" onClick={this.onJoinTeam}>
            ????????????
          </Button>
        )}
      </Col>
    );

    const managementTemas = (
      <div>
        <Row
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <Col
            span={2}
            className={styles.teamsTit}
            style={{ marginBottom: '0' }}
          >
            ????????????
          </Col>
          <Col span={15} style={{ textAlign: 'left' }}>
            <Search
              style={{ width: '500px' }}
              placeholder="?????????????????????????????????"
              onSearch={this.handleSearchTeam}
            />
          </Col>
          {operation}
        </Row>
        <Row className={styles.teamMinTit} type="flex" align="middle">
          <Col span={6}>????????????</Col>
          <Col span={3}>
            <Tooltip placement="top" title="????????????????????????">
              <span>?????????</span>
              <img
                src={Tooltips}
                alt=""
                style={{ cursor: 'pointer', marginLeft: 4 }}
              />
            </Tooltip>
          </Col>
          <Col span={11}>
            <Tooltip placement="top" title="????????????????????????????????????????????????????????????">
              <span>??????</span>
              <img
                src={Tooltips}
                alt=""
                style={{ cursor: 'pointer', marginLeft: 4 }}
              />
            </Tooltip>
          </Col>
        </Row>

        {teamList.map(item => {
          const {
            team_id,
            team_alias,
            region_list,
            owner_name,
            team_name
          } = item;
          return (
            <Card
              key={team_id}
              style={{ marginTop: '10px' }}
              hoverable
              bodyStyle={{ padding: 0 }}
            >
              <Row type="flex" align="middle" className={styles.pl24}>
                <Col span={6}>{team_alias}</Col>
                <Col span={3}>{owner_name}</Col>
                <Col span={14}>
                  {this.showRegions(team_name, region_list, true)}
                </Col>
                <Col span={1} className={styles.bor}>
                  <Dropdown
                    overlay={managementMenu(team_name)}
                    placement="bottomLeft"
                  >
                    <Icon component={moreSvg} style={{ width: '100%' }} />
                  </Dropdown>
                </Col>
              </Row>
            </Card>
          );
        })}
        <div style={{ textAlign: 'right', margin: '15px' }}>
          {this.handlePaginations()}
        </div>
      </div>
    );

    const teamInfo = (
      <div>
        <Row>
          <Col span={17} className={styles.teamsTit}>
            {haveNewJoinTeam && '??????????????????'}
          </Col>
          {operation}
        </Row>
        {haveNewJoinTeam && (
          <Row className={styles.teamMinTit} type="flex" align="middle">
            <Col span={6}>????????????</Col>
            <Col span={3}>?????????</Col>
            <Col span={3}>??????</Col>
            <Col span={12}>??????</Col>
          </Row>
        )}
        {request_join_team &&
          request_join_team.map(item => {
            const {
              is_pass,
              team_id,
              team_name,
              team_alias,
              owner_name,
              role
            } = item;
            return (
              <Card
                key={team_id}
                style={{
                  marginTop: '10px',
                  borderLeft: is_pass === 0 && '6px solid #4D73B1'
                }}
                bodyStyle={{ padding: 0 }}
                hoverable
              >
                <Row
                  type="flex"
                  className={styles.pl24}
                  align="middle"
                  key={team_id}
                >
                  <Col span={6}>{team_alias}</Col>
                  <Col span={3}>{owner_name}</Col>
                  <Col span={3}>{roleUtil.actionMap(role)}</Col>
                  <Col
                    span={11}
                    style={{
                      color: is_pass === 0 && '#999999'
                    }}
                  >
                    {is_pass === 0 && (
                      <span>
                        <img src={WarningImg} alt="" />
                        &nbsp;???????????????????????????
                      </span>
                    )}
                  </Col>
                  <Col span={1} className={styles.bor}>
                    <Dropdown
                      overlay={
                        is_pass === 0 ? menucancel(item) : menu(team_name)
                      }
                      placement="bottomLeft"
                    >
                      <Icon component={moreSvg} style={{ width: '100%' }} />
                    </Dropdown>
                  </Col>
                </Row>
              </Card>
            );
          })}

        <Row
          style={{
            margin: '10px 0',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Col
            span={4}
            className={styles.teamsTit}
            style={{ marginBottom: '0' }}
          >
            ????????????
          </Col>

          <Col span={20} style={{ textAlign: 'right' }}>
            <Search
              style={{ width: '500px' }}
              placeholder="?????????????????????????????????"
              onSearch={this.handleSearchUserTeam}
            />
          </Col>
        </Row>
        {userTeam && (
          <Row className={styles.teamMinTit} type="flex" align="middle">
            <Col span={6}>????????????</Col>
            <Col span={3}>?????????</Col>
            <Col span={3}>??????</Col>
            <Col span={12}>??????</Col>
          </Row>
        )}
        {!userTeam && (
          <Empty
            description="????????????????????????????????????????????????"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
        {userTeam &&
          userTeam.map(item => {
            const {
              team_id,
              team_alias,
              team_name,
              region_list,
              owner_name,
              roles
            } = item;
            return (
              <Card
                key={team_id}
                style={{ marginBottom: '10px' }}
                hoverable
                bodyStyle={{ padding: 0 }}
              >
                <Row type="flex" align="middle" className={styles.pl24}>
                  <Col span={6}>{team_alias}</Col>
                  <Col span={3}>{owner_name}</Col>
                  <Col span={3}>
                    {roles &&
                      roles.length > 0 &&
                      roles.map(role => {
                        return (
                          <span
                            style={{ marginRight: '8px' }}
                            key={`role${role}`}
                          >
                            {roleUtil.actionMap(role)}
                          </span>
                        );
                      })}
                  </Col>
                  <Col span={11}>
                    {this.showRegions(team_name, region_list)}
                  </Col>
                  <Col span={1} className={styles.bor}>
                    <Dropdown overlay={menu(team_name)} placement="bottomLeft">
                      <Icon component={moreSvg} style={{ width: '100%' }} />
                    </Dropdown>
                  </Col>
                </Row>
              </Card>
            );
          })}
      </div>
    );
    let title = '????????????';
    const content =
      '???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????';
    if (adminer) {
      title = '????????????';
    }
    return (
      <PageHeaderLayout title={title} content={content}>
        {showCloseAllComponent && (
          <ConfirmModal
            onOk={this.handleCloseAllComponentInTeam}
            loading={closeTeamComponentLoading}
            title="???????????????????????????"
            subDesc="?????????????????????"
            desc="????????????????????????????????????????"
            onCancel={this.hideCloseAllComponent}
          />
        )}
        {this.state.joinTeam && (
          <JoinTeam
            enterpriseID={eid}
            onOk={this.handleJoinTeam}
            onCancel={this.cancelJoinTeam}
          />
        )}

        {this.state.showAddTeam && (
          <CreateTeam
            enterprise_id={eid}
            onOk={this.handleCreateTeam}
            onCancel={this.cancelCreateTeam}
          />
        )}
        {initShow && (
          <CreateTeam
            title="???????????????????????????"
            enterprise_id={eid}
            onOk={this.handleCreateTeam}
            onCancel={this.cancelCreateTeam}
            // guideStep={guideStep}
            // handleNewbieGuiding={this.handleNewbieGuiding}
            // handleGuideStep={this.handleGuideStep}
          />
        )}
        {this.state.showExitTeam && (
          <ConfirmModal
            onOk={this.handleExitTeam}
            title="????????????"
            subDesc="?????????????????????"
            desc="????????????????????????????"
            onCancel={this.hideExitTeam}
          />
        )}
        {this.state.showDelApply && (
          <ConfirmModal
            onOk={this.handleDelApply}
            title="????????????"
            subDesc="?????????????????????"
            desc="????????????????????????????"
            onCancel={this.hideDelApply}
          />
        )}
        {this.state.showDelTeam && (
          <ConfirmModal
            loading={delTeamLoading}
            onOk={this.handleDelTeam}
            title="????????????"
            subDesc="?????????????????????"
            desc="?????????????????????????????????????????????????????????"
            onCancel={this.hideDelTeam}
          />
        )}
        {this.state.showOpenRegion && (
          <OpenRegion
            onSubmit={this.handleOpenRegion}
            onCancel={this.cancelOpenRegion}
            teamName={this.state.openRegionTeamName}
          />
        )}

        {enterpriseTeamsLoading || overviewTeamsLoading || userTeamsLoading ? (
          <div className={styles.example}>
            <Spin />
          </div>
        ) : (
          <div>{adminer ? managementTemas : teamInfo}</div>
        )}
      </PageHeaderLayout>
    );
  }
}
