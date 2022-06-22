/**
 * @content  创建云市场店铺
 * @author   Leon
 * @date     2022-06-20
 *
 */

import {
  Modal,
  Alert,
  Form,
  Input,
  Button,
  Select,
  Tooltip,
  Icon,
  Divider,
  Spin,
  notification
} from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'dva';
import styles from './index.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 }
  }
};

const { Option } = Select;

const CreateMarkeForm = props => {
  const {
    createMarketModalVisible,
    form,
    onCancel,
    eid,
    dispatch,
    fetchStoreList
  } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10
  });
  const [enterpriseTeamsLoading, setEnterpriseTeamsLoading] = useState(true);
  const [isAddLicense, setIsAddLicense] = useState(true);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (enterpriseTeamsLoading) {
      getEnterpriseTeams();
    }
  }, [pagination.page_size, enterpriseTeamsLoading]);

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    validateFieldsAndScroll(async (err, values) => {
      if (err) {
        notification.warning({ message: '请填写表单！' });
        setLoading(false);
        return;
      }
      values.enterprise_id = eid;
      dispatch({
        type: 'store/createApplicationStore',
        payload: values,
        callback: res => {
          if (res?.status_code === 200) {
            notification.success({ message: '添加成功！' });
            onCancel();
            fetchStoreList();
          }
          setLoading(false);
        }
      });
    });
  };

  const addTeams = () => {
    setEnterpriseTeamsLoading(true);
    setPagination({ page: 1, page_size: pagination.page_size + 10 });
  };

  const getEnterpriseTeams = () => {
    const { dispatch, eid } = props;
    const { page, page_size } = pagination;
    dispatch({
      type: 'global/fetchEnterpriseTeams',
      payload: {
        page,
        page_size,
        enterprise_id: eid
      },
      callback: res => {
        if (res && res.status_code === 200) {
          if (res.bean && res.bean.list) {
            const listNum = (res.bean && res.bean.total_count) || 0;
            const isAdd = !!(listNum && listNum > page_size);
            setTeamList(res.bean.list);
            setIsAddLicense(isAdd);
            setEnterpriseTeamsLoading(false);
          }
        }
      }
    });
  };

  return (
    <>
      <Modal
        title="创建应用店铺"
        visible={createMarketModalVisible}
        onCancel={onCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Alert
          message="建立平台与云市场应用店铺的连接"
          type="info"
          showIcon
          className={styles.alert}
        />
        <Form {...formItemLayout}>
          <Form.Item label="应用店铺名称">
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: '请输入应用店铺名称！'
                }
              ]
            })(<Input placeholder="请输入应用店铺名称" />)}
          </Form.Item>
          <Form.Item label="应用店铺域名">
            {getFieldDecorator('url', {
              rules: [
                {
                  required: true,
                  message: '请输入应用店铺域名！'
                }
              ]
            })(<Input placeholder="请输入应用店铺域名！" />)}
          </Form.Item>
          <Form.Item label="Accesskey">
            {getFieldDecorator('access_key', {
              rules: [
                {
                  required: true,
                  message: '请输入Accesskey!'
                }
              ]
            })(<Input placeholder="请输入Accesskey" />)}
          </Form.Item>
          <Form.Item label="AccessSecret">
            {getFieldDecorator('access_secret', {
              rules: [
                {
                  required: true,
                  message: '请输入AccessSecret!'
                }
              ]
            })(<Input placeholder="请输入AccessSecret" />)}
          </Form.Item>
          <Form.Item {...formItemLayout} label="发布范围">
            {getFieldDecorator('type', {
              // initialValue: appInfo
              //   ? isShared && appInfo.scope && appInfo.scope === 'team'
              //     ? appInfo.create_team
              //     : appInfo.scope
              //   : defaultScope || 'enterpr ise',
              rules: [
                {
                  required: true,
                  message: '请选择可选范围！'
                }
              ]
            })(
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="请选择发布范围"
                dropdownRender={menu => (
                  <div>
                    {menu}
                    {isAddLicense && (
                      <div>
                        <Divider style={{ margin: '4px 0' }} />
                        {enterpriseTeamsLoading ? (
                          <Spin size="small" />
                        ) : (
                          <div
                            style={{
                              padding: '4px 8px',
                              cursor: 'pointer'
                            }}
                            onMouseDown={e => e.preventDefault()}
                            onClick={addTeams}
                          >
                            <Icon type="plus" /> 加载更多
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              >
                <Option value="enterprise" key="enterprise">
                  <div style={{ borderBottom: '1px solid #ccc' }}>当前企业</div>
                </Option>
                {teamList &&
                  teamList.map(item => {
                    return (
                      <Option key={item.team_name} value={item.team_name}>
                        {item.team_alias}
                      </Option>
                    );
                  })}
              </Select>
            )}
            <div className={styles.conformDesc}>发布模型的可视范围</div>
          </Form.Item>
          {/* <Form.Item
            label={
              <span>
                <span>可视范围</span>
                <Tooltip title="当前应用店铺的可视范围" palcement="top">
                  <Icon
                    type="exclamation-circle"
                    style={{ color: 'gray', marginLeft: 5, cursor: 'pointer' }}
                  />
                </Tooltip>
              </span>
            }
          >
            {getFieldDecorator('selectRange', {
              rules: [
                {
                  required: true,
                  message: '请选择可选范围！'
                }
              ]
            })(<Select placeholder="请选择可选范围"></Select>)}
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
};

const CreateMarkeFormtModal = Form.create({ name: 'createMarketForm' })(
  connect(({}) => ({}))(CreateMarkeForm)
);

export default CreateMarkeFormtModal;
