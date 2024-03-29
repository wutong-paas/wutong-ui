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
  Divider,
  Modal,
  message
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
import downLoadTools from '@/utils/downLoadTools';
import styles from './ComponentList.less';

@connect(
  ({ global, loading, application }) => ({
    groups: global.groups,
    batchMoveLoading: loading.effects['appControl/putBatchMove'],
    reStartLoading: loading.effects['appControl/putReStart'],
    startLoading: loading.effects['appControl/putStart'],
    stopLoading: loading.effects['appControl/putStop'],
    yamlLoading: loading.effects['appControl/fetchClusterResourcee'],
    deleteLoading: loading.effects['appControl/deleteApp'],
    groupDetail: application.groupDetail || {}
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
      tableDataLoading: true,
      downLoadClusterVisible: false,
      namespaceValue: 'default',
      serviceAlias: '',
      selectedRows: [],
      isBatch: false
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
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows
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
      putReStart: '操作成功，重启中',
      putStart: '操作成功，启动中',
      putStop: '操作成功，关闭中'
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
      stop: '批量关闭中',
      start: '批量启动中',
      restart: '批量重启中',
      upgrade: '批量更新中',
      deploy: '批量构建中'
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
            message: '批量移动中'
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
  // 是否可以批量操作
  CanBatchOperation = () => {
    const arr = this.getSelected();
    return arr && arr.length > 0;
  };
  canBatchClosed = () => {
    const arr = this.getSelected();
    return arr ? arr.some(item => item.status !== 'closed') : true;
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

  handleDownloadClusterResource = () => {
    const { namespaceValue, serviceAlias, selectedRows, isBatch } = this.state;
    const { groupId } = this.props;
    this.props.dispatch({
      type: 'appControl/fetchClusterResourcee',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        namespace: namespaceValue === '' ? undefined : namespaceValue,
        serviceList: !isBatch
          ? [serviceAlias]
          : selectedRows.map(i => i.service_alias),
        app_id: groupId
      },
      callback: res => {
        downLoadTools.saveFile(
          res?.response_data,
          `${this.props.groupDetail.k8s_app}_${moment().format('YYYY-MM-DD')}`,
          'yaml'
        );
        this.initState();
      }
    });
  };

  initState = () =>
    this.setState({
      downLoadClusterVisible: false,
      isBatch: false,
      namespaceValue: 'default'
    });

  handleDeleteComponent = (data, index) => {
    const { selectedRowKeys } = this.state;
    if (typeof index === 'number' && selectedRowKeys.length > 0) {
      this.setState(
        {
          selectedRowKeys: selectedRowKeys.filter(i => i !== index)
        },
      );
    }
    this.props.dispatch({
      type: 'appControl/deleteApp',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_alias: data?.service_alias
      },
      callback: () => {
        notification.success({ message: '删除成功' });
        this.loadComponents();
      }
    });
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
      groups,
      yamlLoading,
      deleteLoading
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
      tableDataLoading,
      downLoadClusterVisible,
      namespaceValue,
      selectedRows
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
        title: '组件名称',
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
                <Tooltip title="第三方组件">
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
        title: '内存',
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
        title: '状态',
        dataIndex: 'status_cn',
        render: (val, data) =>
          data.service_source && data.service_source === 'third_party' ? (
            <Badge
              status={appUtil.appStatusToBadgeStatus(data.status)}
              text={
                val === '运行中'
                  ? '健康'
                  : val === '运行异常'
                  ? '不健康'
                  : val === '已关闭'
                  ? '下线'
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
        title: '更新时间',
        dataIndex: 'update_time',
        render: val =>
          moment(val)
            .locale('zh-cn')
            .format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 230,
        render: (val, data, index) => (
          <Fragment>
            {data.service_source && data.service_source !== 'third_party' && (
              <div style={{ textAlign: 'right' }}>
                {isRestart && data?.status !== 'closed' && (
                  <Popconfirm
                    title="确认要重启该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putReStart', data);
                    }}
                  >
                    <a>重启</a>
                  </Popconfirm>
                )}
                {isRestart && data?.status !== 'closed' && (
                  <Divider type="vertical" />
                )}
                {isStart && (
                  <Popconfirm
                    title="确认要启动该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putStart', data);
                    }}
                  >
                    <a>启动</a>
                  </Popconfirm>
                )}
                {isStart && <Divider type="vertical" />}
                {isStop && data?.status !== 'closed' && (
                  <Popconfirm
                    title="确认要关闭该组件吗？"
                    onConfirm={() => {
                      this.handleOperation('putStop', data);
                    }}
                  >
                    <a>关闭</a>
                  </Popconfirm>
                )}
                {isStop && data?.status !== 'closed' && (
                  <Divider type="vertical" />
                )}
                {data?.status === 'closed' && (
                  <Popconfirm
                    title="确认要删除该组件吗？"
                    onConfirm={() => {
                      this.handleDeleteComponent(data, index);
                    }}
                  >
                    <a>删除</a>
                  </Popconfirm>
                )}
                {data?.status === 'closed' && <Divider type="vertical" />}
                <Tooltip title="导出集群资源">
                  <a
                    onClick={() =>
                      this.setState({
                        downLoadClusterVisible: true,
                        serviceAlias: data.service_alias
                      })
                    }
                  >
                    导出
                  </a>
                </Tooltip>
              </div>
            )}
          </Fragment>
        )
      }
    ];
    const customBox = [
      {
        permissions: isConstruct,
        name: '构建',
        action: 'deploy'
      },
      {
        permissions: isUpdate,
        name: '更新',
        action: 'upgrade'
      },
      {
        permissions: isRestart,
        name: '重启',
        action: 'restart'
      },
      {
        permissions: isStop && this.canBatchClosed(),
        name: '关闭',
        action: 'stop'
      },
      {
        permissions: isStart,
        name: '启动',
        action: 'start'
      },
      {
        permissions: isEdit,
        name: '移动',
        action: false,
        customMethods: this.showBatchMove
      },
      {
        permissions: isDelete,
        name: '删除',
        action: false,
        customMethods: this.handleBatchDelete
      },
      {
        permissions: true,
        name: '导出',
        action: false,
        customMethods: () => {
          if (
            selectedRows.some(item => item.service_source === 'third_party')
          ) {
            message.warning('第三方组件不能导出');
            return;
          }
          this.setState({
            downLoadClusterVisible: true,
            isBatch: true,
            namespaceValue: 'default'
          });
        }
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
    //           批量操作 <Icon type="down" />
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
              <Input.Search
                className={styles.input}
                style={{ width: 320 }}
                placeholder="请搜索组件"
                onChange={this.handelChange}
                onPressEnter={this.handleSearch}
                onSearch={this.handleSearch}
              />
              {/* <Button type="primary" onClick={this.handleSearch} icon="search">
                搜索
              </Button> */}
            </div>

            {/* <Form layout="inline" style={{ marginBottom: '10px', float: 'left' }}>
            <Form.Item>
              <Input
                className={styles.input}
                style={{ width: 250 }}
                placeholder="请搜索组件"
                onChange={this.handelChange}
                onPressEnter={this.handleSearch}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.handleSearch} icon="search">
                搜索
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
                    批量操作 <Icon type="down" />
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
                tableDataLoading ||
                deleteLoading
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
        <Modal
          title="导出集群资源"
          visible={downLoadClusterVisible}
          onCancel={this.initState}
          onOk={this.handleDownloadClusterResource}
          confirmLoading={yamlLoading}
        >
          <h3>自定义配置</h3>
          <div style={{ display: 'flex', marginTop: 16 }}>
            <div style={{ alignSelf: 'center', width: 90 }}>命名空间：</div>
            <Input
              value={namespaceValue}
              onChange={e => this.setState({ namespaceValue: e.target.value })}
              placeholder="请输入命名空间"
            />
          </div>
        </Modal>
      </div>
    );
  }
}
