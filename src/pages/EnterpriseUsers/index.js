import { Button, Card, Col, Form, Input, notification, Row, Table } from 'antd';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import React, { PureComponent } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import CreatUser from '../../components/CreatUserForm';
import CurrentTeams from '../../components/CurrentTeams';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import cloud from '../../utils/cloud';
import userUtil from '../../utils/user';

const FormItem = Form.Item;

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
export default class EnterpriseUsers extends PureComponent {
  constructor(props) {
    super(props);
    const { user } = this.props;
    const adminer = userUtil.isCompanyAdmin(user);
    this.state = {
      page: 1,
      pageSize: 10,
      adminer,
      adminList: [],
      total: 0,
      currentUserInfo: false,
      userVisible: false,
      userInfo: false,
      text: '',
      delVisible: false,
      name: '',
      Loading: false
    };
  }
  UNSAFE_componentWillMount() {
    const { adminer } = this.state;
    const { dispatch } = this.props;
    if (!adminer) {
      dispatch(routerRedux.push(`/`));
    }
  }
  componentDidMount() {
    this.loadUser();
  }
  onPageChange = (page, pageSize) => {
    this.setState(
      {
        page,
        pageSize
      },
      () => {
        this.loadUser();
      }
    );
  };
  handleUser = values => {
    this.setState({
      Loading: true
    });
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { userInfo } = this.state;
    let info = values;
    let setType = 'global/creatUser';
    let setMessage = '新增成功';
    if (userInfo) {
      info = Object.assign({}, userInfo, info);
      setType = 'global/upEnterpriseUsers';
      setMessage = '编辑成功';
    }
    dispatch({
      type: setType,
      payload: {
        enterprise_id: eid,
        ...info
      },
      callback: res => {
        if (res && res._condition === 200) {
          this.canceUser();
          this.loadUser();
          notification.success({ message: setMessage });
        }
        this.handleCloseLoading();
      },
      handleError: err => {
        if (
          err &&
          err.data &&
          err.data.code &&
          err.data.code < 600 &&
          err.data.msg_show
        ) {
          notification.warning({ message: err.data.msg_show });
        } else {
          cloud.handleCloudAPIError(err);
        }
        this.handleCloseLoading();
      }
    });
  };

  handleCloseLoading = () => {
    this.setState({ Loading: false });
  };
  handleDelete = () => {
    const { userInfo } = this.state;
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    dispatch({
      type: 'global/deleteEnterpriseUsers',
      payload: {
        user_id: userInfo.user_id,
        enterprise_id: eid
      },
      callback: res => {
        if (res && res._condition === 200) {
          this.loadUser();
          this.cancelDelUser();
          notification.success({ message: '删除成功' });
        }
      }
    });
  };

  loadUser = () => {
    const {
      dispatch,
      match: {
        params: { eid }
      }
    } = this.props;
    const { page, pageSize, name } = this.state;
    dispatch({
      type: 'global/fetchEnterpriseUsers',
      payload: {
        enterprise_id: eid,
        page,
        page_size: pageSize,
        name
      },
      callback: res => {
        if (res) {
          this.setState({ adminList: res.list, total: res.total });
        }
      }
    });
  };

  // 管理员添加用户
  addUser = () => {
    this.setState({
      userVisible: true,
      text: '新增用户'
    });
  };

  canceUser = () => {
    this.setState({
      userVisible: false,
      text: '',
      userInfo: false,
      Loading: false
    });
  };

  handleEdit = item => {
    this.setState({
      userInfo: item,
      userVisible: true,
      text: '编辑用户'
    });
  };

  delUser = userInfo => {
    this.setState({
      delVisible: true,
      userInfo
    });
  };
  cancelDelUser = () => {
    this.setState({
      delVisible: false,
      userInfo: false
    });
  };
  handleSearch = () => {
    this.setState(
      {
        page: 1
      },
      () => {
        this.loadUser();
      }
    );
  };
  handelChange = value => {
    this.setState({ name: value && value.trim() });
  };
  handleCurrentUserId = currentUserInfo => {
    this.setState({
      currentUserInfo
    });
  };

  render() {
    const {
      adminList,
      adminer,
      text,
      userInfo,
      delVisible,
      userVisible,
      page,
      pageSize,
      total,
      Loading,
      currentUserInfo
    } = this.state;

    const {
      match: {
        params: { eid }
      }
    } = this.props;

    const columns = [
      {
        title: '用户名称',
        dataIndex: 'nick_name',
        rowKey: 'nick_name',
        // align: 'center',
        render: (val, data) => (
          <Button
            type="link"
            onClick={() => {
              this.handleCurrentUserId(data);
            }}
            style={{ color: '#2953E8' }}
          >
            {val}
          </Button>
        )
      },
      {
        title: '姓名',
        dataIndex: 'real_name',
        rowKey: 'real_name'
        // align: 'center'
      },
      {
        title: '电话',
        dataIndex: 'phone',
        rowKey: 'phone'
        // align: 'center'
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        rowKey: 'email'
        //align: 'center'
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        rowKey: 'create_time',
        // align: 'center',
        render: val => {
          return (
            <span>
              {moment(val)
                .locale('zh-cn')
                .format('YYYY-MM-DD HH:mm:ss')}
            </span>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'user_id',
        // align: 'center',
        rowKey: 'user_id',
        render: (val, item) => {
          return [
            <a
              onClick={() => {
                this.delUser(item);
              }}
              style={{ color: '#2953E8' }}
            >
              删除
            </a>,
            <a
              onClick={() => {
                this.handleEdit(item);
              }}
              style={{ color: '#2953E8' }}
            >
              编辑
            </a>
          ];
        }
      }
    ];

    return (
      <PageHeaderLayout
        title="用户管理 "
        content="企业用户查询、添加和修改相关功能，用户需要操作应用或组件相关资源时需要将其分配到相应的团队。"
      >
        <Row
          style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Col span={12}>
            <Form layout="inline" style={{ display: 'inline-block' }}>
              <FormItem>
                <Input.Search
                  placeholder="搜索用户"
                  onChange={e => this.handelChange(e.target.value)}
                  onPressEnter={this.handleSearch}
                  style={{ width: 320 }}
                  onSearch={this.handleSearch}
                />
              </FormItem>
              {/* <FormItem>
                <Button
                  type="primary"
                  onClick={this.handleSearch}
                  icon="search"
                >
                  搜索
                </Button>
              </FormItem> */}
            </Form>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {adminer && (
              <Button
                type="primary"
                icon="plus"
                style={{ float: 'right' }}
                onClick={this.addUser}
              >
                新增用户
              </Button>
            )}
          </Col>
        </Row>
        <Card>
          {delVisible && (
            <ConfirmModal
              onOk={this.handleDelete}
              title="删除用户"
              subDesc="此操作不可恢复"
              desc="确定要删除此用户吗？"
              onCancel={this.cancelDelUser}
            />
          )}

          {userVisible && (
            <CreatUser
              eid={eid}
              loading={Loading}
              userInfo={userInfo}
              title={text}
              onOk={this.handleUser}
              onCancel={this.canceUser}
            />
          )}
          {currentUserInfo && (
            <CurrentTeams
              eid={eid}
              userInfo={currentUserInfo}
              onCancel={() => {
                this.handleCurrentUserId(false);
              }}
            />
          )}
          <Table
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: this.onPageChange
            }}
            dataSource={adminList}
            columns={columns}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
