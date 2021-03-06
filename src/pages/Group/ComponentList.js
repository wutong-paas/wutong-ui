/* eslint-disable no-nested-ternary */
/* eslint-disable prettier/prettier */
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Icon,
  Input,
  Menu,
  notification,
  Popconfirm,
  Table,
  Tooltip,
  Divider
} from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import MoveGroup from '../../components/AppMoveGroup';
import BatchDelete from '../../components/BatchDelete';
import { batchOperation } from '../../services/app';
import appUtil from '../../utils/app';
import globalUtil from '../../utils/global';
import styles from './ComponentList.less';

@connect(
  ({ global, loading }) => ({
    groups: global.groups,
    batchMoveLoading: loading.effects['appControl/putBatchMove'],
    reStartLoading: loading.effects['appControl/putReStart'],
    startLoading: loading.effects['appControl/putStart'],
    stopLoading: loading.effects['appControl/putStop']
  }),
  null,
  null,
  {
    pure: false
  }
)
export default class ComponentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      apps: [],
      current: 1,
      total: 0,
      pageSize: 20,
      moveGroupShow: false,
      batchDeleteApps: [],
      batchDeleteShow: false,
      operationState: false,
      query: '',
      changeQuery: '',
      tableDataLoading: true
    };
  }
  componentDidMount() {
    this.updateApp();
    // document
    //   .querySelector('.ant-table-footer')
    //   .setAttribute(
    //     'style',
    //     'position:absolute;background:#fff;padding-bottom: 0px;'
    //   );
  }
  shouldComponentUpdate() {
    return true;
  }
  componentWillUnmount() {
    clearInterval(this.timer);
    this.props.dispatch({
      type: 'application/clearApps'
    });
  }
  onSelectChange = selectedRowKeys => {
    this.setState({
      selectedRowKeys
    });
  };
  getSelectedKeys() {
    const selected = this.getSelected();
    return selected.map(item => item.service_id);
  }

  getSelected() {
    const key = this.state.selectedRowKeys;
    const res = key.map(item => this.state.apps[item]);
    return res;
  }
  updateApp = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.loadComponents();
    const { clearTime } = this.props;
    this.timer = setInterval(() => {
      if (!clearTime) {
        this.loadComponents();
      }
    }, 5000);
  };
  loadComponents = () => {
    const { dispatch, groupId } = this.props;
    const { current, pageSize, query } = this.state;
    dispatch({
      type: 'application/fetchApps',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName(),
        group_id: groupId,
        page: current,
        page_size: pageSize,
        query
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState({
            apps: data.list || [],
            total: data.total || 0,
            tableDataLoading: false
          });
        }
      }
    });
  };

  deleteData = () => {
    const { dispatch, groupId } = this.props;
    const { current, pageSize, query } = this.state;
    dispatch({
      type: 'application/fetchApps',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName(),
        group_id: groupId,
        page: current,
        page_size: pageSize,
        query
      },
      callback: data => {
        if (data && data.status_code === 200) {
          this.setState(
            {
              apps: data.list || [],
              total: data.total || 0
            },
            () => {
              this.handleBatchDeletes();
              this.hideMoveGroup();
            }
          );
        }
      }
    });
  };
  handleOperation = (state, data) => {
    const { dispatch } = this.props;
    const operationMap = {
      putReStart: '????????????????????????',
      putStart: '????????????????????????',
      putStop: '????????????????????????'
    };
    dispatch({
      type: `appControl/${state}`,
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: data.service_alias
      },
      callback: res => {
        if (res) {
          notification.success({
            message: operationMap[state]
          });
        }
      }
    });
  };

  handleOperationState = operationState => {
    this.setState({ operationState });
  };
  handleBatchOperation = action => {
    const ids = this.getSelectedKeys();
    const map = {
      stop: '???????????????',
      start: '???????????????',
      restart: '???????????????',
      upgrade: '???????????????',
      deploy: '???????????????'
    };
    batchOperation({
      action,
      team_name: globalUtil.getCurrTeamName(),
      serviceIds: ids && ids.join(',')
    }).then(data => {
      this.handleOperationState(false);
      if (data && map[action]) {
        notification.success({
          message: map[action]
        });
      }
    });
  };

  handleBatchDelete = () => {
    const apps = this.getSelected();
    this.setState({ batchDeleteApps: apps, batchDeleteShow: true });
  };
  hideBatchDelete = () => {
    // update menus data
    this.deleteData();
    this.updateGroupMenu();
  };
  handleBatchDeletes = () => {
    this.setState({
      batchDeleteApps: [],
      batchDeleteShow: false,
      selectedRowKeys: []
    });
  };
  updateGroupMenu = () => {
    this.props.dispatch({
      type: 'global/fetchGroups',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        region_name: globalUtil.getCurrRegionName()
      }
    });
  };
  handleBatchMove = groupID => {
    const ids = this.getSelectedKeys();
    const { dispatch } = this.props;
    dispatch({
      type: 'appControl/putBatchMove',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        serviceIds: ids.join(','),
        move_group_id: groupID
      },
      callback: data => {
        if (data) {
          notification.success({
            message: '???????????????'
          });
          this.hideBatchDelete();
        }
      }
    });
  };
  hideMoveGroup = () => {
    this.setState({ moveGroupShow: false });
  };
  showBatchMove = () => {
    this.setState({ moveGroupShow: true });
  };
  // ????????????????????????
  CanBatchOperation = () => {
    const arr = this.getSelected();
    return arr && arr.length > 0;
  };
  handelChange = e => {
    this.setState({
      changeQuery: e.target.value
    });
  };

  handleSearch = () => {
    this.setState(
      {
        tableDataLoading: true,
        current: 1,
        query: this.state.changeQuery
      },
      () => {
        this.updateApp();
      }
    );
  };
  render() {
    const {
      componentPermissions: {
        isStart,
        isRestart,
        isStop,
        isDelete,
        isEdit,
        isUpdate,
        isConstruct
      },
      batchMoveLoading,
      reStartLoading,
      startLoading,
      stopLoading,
      groupId,
      groups
    } = this.props;
    const {
      selectedRowKeys,
      current,
      total,
      apps,
      pageSize,
      batchDeleteShow,
      batchDeleteApps,
      moveGroupShow,
      operationState,
      tableDataLoading
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    };
    const pagination = {
      pageSize,
      current,
      total,
      showSizeChanger: true,
      onChange: page => {
        this.setState(
          {
            current: page,
            selectedRowKeys: []
          },
          () => {
            this.loadComponents();
          }
        );
      },
      // eslint-disable-next-line no-shadow
      onShowSizeChange: (page, pageSize) => {
        this.setState(
          {
            current: page,
            pageSize
          },
          () => {
            this.loadComponents();
          }
        );
      }
    };
    const columns = [
      {
        title: '????????????',
        dataIndex: 'service_cname',
        render: (val, data) => (
          <Link
            to={`/team/${globalUtil.getCurrTeamName()}/region/${globalUtil.getCurrRegionName()}/components/${
              data.service_alias
            }/overview/service_id/${data.service_id}`}
          >
            {' '}
            {data.service_source && data.service_source === 'third_party' ? (
              <span>
                <Tooltip title="???????????????">
                  <span
                    style={{
                      borderRadius: '50%',
                      height: '20px',
                      width: '20px',
                      display: 'inline-block',
                      background: '#1890ff',
                      verticalAlign: 'top',
                      marginRight: '3px'
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        color: '#FFFFFF',
                        height: '20px',
                        lineHeight: '20px',
                        textAlign: 'center'
                      }}
                    >
                      3
                    </span>
                  </span>
                  {val}
                </Tooltip>
              </span>
            ) : (
              <span>{val}</span>
            )}{' '}
          </Link>
        )
      },
      {
        title: '??????',
        dataIndex: 'min_memory',
        render: (val, data) => (
          <span>
            {data.service_source && data.service_source === 'third_party'
              ? '-'
              : `${val}MB`}
          </span>
        )
      },
      {
        title: '??????',
        dataIndex: 'status_cn',
        render: (val, data) =>
          data.service_source && data.service_source === 'third_party' ? (
            <Badge
              status={appUtil.appStatusToBadgeStatus(data.status)}
              text={
                val === '?????????'
                  ? '??????'
                  : val === '????????????'
                  ? '?????????'
                  : val === '?????????'
                  ? '??????'
                  : val
              }
            />
          ) : (
            <Badge
              status={appUtil.appStatusToBadgeStatus(data.status)}
              text={val}
            />
          )
      },
      {
        title: '????????????',
        dataIndex: 'update_time',
        render: val =>
          moment(val)
            .locale('zh-cn')
            .format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '??????',
        dataIndex: 'action',
        width: 180,
        render: (val, data) => (
          <Fragment>
            {data.service_source && data.service_source !== 'third_party' && (
              <Fragment>
                {isRestart && (
                  <Popconfirm
                    title="??????????????????????????????"
                    onConfirm={() => {
                      this.handleOperation('putReStart', data);
                    }}
                  >
                    <a>??????</a>
                  </Popconfirm>
                )}
                {isRestart && <Divider type="vertical" />}
                {isStart && (
                  <Popconfirm
                    title="??????????????????????????????"
                    onConfirm={() => {
                      this.handleOperation('putStart', data);
                    }}
                  >
                    <a>??????</a>
                  </Popconfirm>
                )}
                {isStart && <Divider type="vertical" />}
                {isStop && (
                  <Popconfirm
                    title="??????????????????????????????"
                    onConfirm={() => {
                      this.handleOperation('putStop', data);
                    }}
                  >
                    <a>??????</a>
                  </Popconfirm>
                )}
              </Fragment>
            )}
          </Fragment>
        )
      }
    ];
    const customBox = [
      {
        permissions: isConstruct,
        name: '??????',
        action: 'deploy'
      },
      {
        permissions: isUpdate,
        name: '??????',
        action: 'upgrade'
      },
      {
        permissions: isRestart,
        name: '??????',
        action: 'restart'
      },
      {
        permissions: isStop,
        name: '??????',
        action: 'stop'
      },
      {
        permissions: isStart,
        name: '??????',
        action: 'start'
      },
      {
        permissions: isEdit,
        name: '??????',
        action: false,
        customMethods: this.showBatchMove
      },
      {
        permissions: isDelete,
        name: '??????',
        action: false,
        customMethods: this.handleBatchDelete
      }
    ];

    const menu = (
      <Menu>
        {customBox.map(item => {
          const { permissions, name, action, customMethods } = item;
          return (
            permissions && (
              <Menu.Item style={{ textAlign: 'center' }}>
                <a
                  loading={operationState === action ? operationState : false}
                  onClick={() => {
                    if (action) {
                      this.handleOperationState(action);
                      this.handleBatchOperation(action);
                    } else {
                      customMethods();
                    }
                  }}
                >
                  {name}
                </a>
              </Menu.Item>
            )
          );
        })}
      </Menu>
    );
    // const footer = (
    //   <div className={styles.tableList}>
    //     <div className={styles.tableListOperator}>
    //       <Dropdown
    //         overlay={menu}
    //         trigger={['click']}
    //         placement="topCenter"
    //         disabled={!this.CanBatchOperation()}
    //       >
    //         <Button>
    //           ???????????? <Icon type="down" />
    //         </Button>
    //       </Dropdown>
    //     </div>
    //   </div>
    // );
    return (
      <div>
        <Card
          style={{
            minHeight: 400
          }}
          bordered={false}
          bodyStyle={{ padding: '10px 10px' }}
        >
          <div className={styles.header}>
            <div>
              <Input
                className={styles.input}
                style={{ width: 250 }}
                placeholder="???????????????"
                onChange={this.handelChange}
                onPressEnter={this.handleSearch}
              />
              <Button type="primary" onClick={this.handleSearch} icon="search">
                ??????
              </Button>
            </div>

            {/* <Form layout="inline" style={{ marginBottom: '10px', float: 'left' }}>
            <Form.Item>
              <Input
                className={styles.input}
                style={{ width: 250 }}
                placeholder="???????????????"
                onChange={this.handelChange}
                onPressEnter={this.handleSearch}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.handleSearch} icon="search">
                ??????
              </Button>
            </Form.Item>
   
          </Form> */}
            <div className={styles.tableList}>
              <div className={styles.tableListOperator}>
                <Dropdown
                  overlay={menu}
                  trigger={['click']}
                  //placement="topCenter"
                  disabled={!this.CanBatchOperation()}
                >
                  <Button>
                    ???????????? <Icon type="down" />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className={styles.table}>
            <Table
              pagination={pagination}
              rowSelection={rowSelection}
              columns={columns}
              loading={
                reStartLoading ||
                startLoading ||
                stopLoading ||
                tableDataLoading
              }
              dataSource={apps || []}
              //footer={() => footer}
            />
            {batchDeleteShow && (
              <BatchDelete
                batchDeleteApps={batchDeleteApps}
                onCancel={this.hideBatchDelete}
                onOk={this.hideBatchDelete}
              />
            )}
            {moveGroupShow && (
              <MoveGroup
                loading={batchMoveLoading}
                currGroupID={groupId}
                groups={groups}
                onOk={this.handleBatchMove}
                onCancel={this.hideMoveGroup}
              />
            )}
          </div>
        </Card>
      </div>
    );
  }
}
