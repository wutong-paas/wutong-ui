/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable prettier/prettier */
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Table
} from 'antd';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import globalUtil from '../../utils/global';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
@connect(({ loading }) => ({
  checkK8sLoading: loading.effects['application/setCheckK8sServiceName'],
  governanceLoading: loading.effects['application/setgovernancemode']
}))
export default class ApplicationGovernance extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      step: false,
      ServiceNameList: [],
      btnConfig: false
    };
  }

  setK8sServiceNames = value => {
    const { dispatch, appID, onCancel } = this.props;
    const { ServiceNameList } = this.state;
    const arr = [];
    ServiceNameList.map(item => {
      const {
        service_id: id,
        port_alias: alias,
        service_cname: serviceCname,
        k8s_service_name: name,
        port
      } = item;
      const setAlias = `${id}/${alias}`;
      const k8ServiceName = `${id}/${name}`;
      if (setAlias && k8ServiceName) {
        arr.push({
          service_cname: serviceCname,
          service_id: id,
          port,
          port_alias: value[setAlias],
          k8s_service_name: value[k8ServiceName]
        });
      }
    });
    dispatch({
      type: 'application/setCheckK8sServiceName',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        arr
      },
      callback: res => {
        if (res && res.status_code === 200) {
          this.handleNotification();
          onCancel();
        }
      }
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    const { step } = this.state;
    form.validateFields((err, value) => {
      if (!err) {
        if (step) {
          this.setK8sServiceNames(value);
        } else {
          this.handleGovernancemode(value);
        }
      }
    });
  };

  handleGovernancemode = value => {
    const { dispatch, appID, onCancel, onOk } = this.props;
    dispatch({
      type: 'application/setgovernancemode',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        governance_mode: value.governance_mode
      },
      callback: () => {
        onOk();
        if (value.governance_mode === 'BUILD_IN_SERVICE_MESH') {
          this.handleNotification();
          onCancel();
        } else {
          this.fetchServiceNameList();
        }
      }
    });
  };
  handleNotification = () => {
    notification.success({
      message: '????????????????????????????????????',
      duration: '3'
    });
  };
  fetchServiceNameList = () => {
    const { dispatch, appID, onCancel } = this.props;
    dispatch({
      type: 'application/fetchServiceNameList',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID
      },
      callback: res => {
        if (res && res.bean) {
          if (res.list && res.list.length > 0) {
            this.setState({
              step: true,
              ServiceNameList: res.list
            });
          } else {
            this.handleNotification();
            onCancel();
          }
        }
      }
    });
  };
  checkK8sServiceName = value => {
    const { dispatch, appID } = this.props;
    dispatch({
      type: 'application/checkK8sServiceName',
      payload: {
        tenantName: globalUtil.getCurrTeamName(),
        group_id: appID,
        service_alias: value.service_alias,
        k8s_service_name: value.k8s_service_name
      },
      callback: res => {
        if (res && res.bean && !res.bean.is_valid) {
          this.setK8sServiceNames();
        }
      }
    });
  };

  checkServiceName = (rule, value, callback) => {
    const { dispatch, appID } = this.props;
    const { ServiceNameList } = this.stata;
    try {
      dispatch({
        type: 'application/checkK8sServiceName',
        payload: {
          tenantName: globalUtil.getCurrTeamName(),
          group_id: appID,
          service_alias: ServiceNameList[0].service_alias,
          k8s_service_name: ServiceNameList[0].k8s_service_name
        },
        callback: res => {
          if (res && res.bean && !res.bean.is_valid) {
            callback(); // +
          } else {
            throw new Error('????????????!');
          }
        }
      });
    } catch (err) {
      callback(err);
      return; // +
    }
    callback(); // +
  };
  rowKey = (record, index) => index;
  handleOnCancel = () => {
    const { onCancel } = this.props;
    if (this.state.step) {
      this.handleNotification();
    }
    onCancel();
  };
  // ??????????????????
  handleChange = value => {
    const { dispatch, appID } = this.props;
    dispatch({
      type: 'application/checkoutGovernanceModel',
      payload: {
        team_name: globalUtil.getCurrTeamName(),
        app_id: appID,
        governance_mode: value
      },
      callback: res => {
        res &&
          this.setState({
            btnConfig: false
          });
      },
      handleError: err => {
        if (err && err.data && err.data.code === 11009) {
          notification.warning({
            message: '????????????????????????????????????'
          });
          this.setState({
            btnConfig: true
          });
        }
      }
    });
  };
  render() {
    const list = [
      { key: 'KUBERNETES_NATIVE_SERVICE', name: 'Kubernetes?????? service ??????' },
      { key: 'BUILD_IN_SERVICE_MESH', name: '?????? ServiceMesh ??????' },
      { key: 'ISTIO_SERVICE_MESH', name: 'Istio????????????' }
    ];
    const {
      loading = false,
      onCancel,
      form,
      checkK8sLoading,
      governanceLoading,
      mode
    } = this.props;
    const { step, ServiceNameList, btnConfig } = this.state;
    const { getFieldDecorator, getFieldValue } = form;
    const type =
      getFieldValue('governance_mode') || mode || 'KUBERNETES_NATIVE_SERVICE';

    return (
      <Modal
        title="????????????????????????"
        visible
        confirmLoading={loading || checkK8sLoading || governanceLoading}
        onOk={this.handleSubmit}
        onCancel={this.handleOnCancel}
        width={800}
        footer={[
          <Button onClick={this.handleOnCancel}> ?????? </Button>,
          <Button
            type="primary"
            disabled={btnConfig}
            loading={loading || checkK8sLoading || governanceLoading}
            onClick={this.handleSubmit}
          >
            ??????
          </Button>
        ]}
      >
        <Alert
          style={{ marginBottom: '20px' }}
          message="??????????????????????????????????????????????????????????????????????????????ServiceMesh??????,Istio???????????????Kubernetes??????Service??????"
          type="info"
          showIcon
        />
        <Form onSubmit={this.handleSubmit}>
          {step ? (
            <Table
              size="middle"
              rowKey={this.rowKey}
              pagination={false}
              dataSource={ServiceNameList || []}
              columns={[
                {
                  title: '????????????/??????',
                  dataIndex: 'service_alias',
                  width: 200,
                  render: (_, data) => (
                    <div>
                      {data.service_cname}/{data.port}
                    </div>
                  )
                },
                {
                  title: '??????',
                  dataIndex: 'port_alias',
                  width: 200,
                  render: (val, data) => (
                    <FormItem style={{ marginBottom: 0 }}>
                      {getFieldDecorator(
                        `${data.service_id}/${data.port_alias}`,
                        {
                          initialValue: val || '',
                          rules: [
                            {
                              required: true,
                              message: '????????????'
                            }
                          ]
                        }
                      )(<Input size="small" />)}
                    </FormItem>
                  )
                },
                {
                  title: '????????????',
                  dataIndex: 'k8s_service_name',
                  width: 200,
                  render: (val, data) => (
                    <FormItem style={{ marginBottom: 0 }}>
                      {getFieldDecorator(
                        `${data.service_id}/${data.k8s_service_name}`,
                        {
                          initialValue: val || '',
                          rules: [
                            {
                              required: true,
                              message: '????????????'
                            },
                            {
                              max: 63,
                              message: '????????????63???'
                            },
                            {
                              pattern: /^[a-z]([-a-z0-9]*[a-z0-9])?$/,
                              message:
                                '?????????????????????????????????-??????????????????????????????????????????,???????????????????????????'
                            }
                          ]
                        }
                      )(<Input size="small" />)}
                    </FormItem>
                  )
                }
              ]}
            />
          ) : (
            <div>
              <FormItem
                labelCol={{
                  xs: {
                    span: 14
                  },
                  sm: {
                    span: 8
                  }
                }}
                wrapperCol={{
                  xs: { span: 14, offset: 0 },
                  sm: { span: 8 }
                }}
                label="??????????????????"
              >
                {getFieldDecorator('governance_mode', {
                  initialValue: mode || 'KUBERNETES_NATIVE_SERVICE',
                  rules: [
                    {
                      required: true,
                      message: '????????????!'
                    }
                  ]
                })(
                  <Select
                    style={{ width: '357px' }}
                    onChange={this.handleChange}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {list.map(item => {
                      return (
                        <Option key={item.key} value={item.key}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </FormItem>
              <div
                style={{
                  width: '468px',
                  margin: '0 auto',
                  border: '1px solid #ccc',
                  padding: '10px',
                  borderRadius: '8px'
                }}
              >
                <label
                  htmlFor="governance_mode"
                  className="ant-form-item-required"
                  title="????????????"
                >
                  ????????????
                </label>

                <div style={{ marginTop: '10px' }}>
                  {type === 'KUBERNETES_NATIVE_SERVICE'
                    ? '????????????????????????Kubernetes service????????????????????????????????????????????????????????????????????????service???????????????????????????.'
                    : type === 'BUILD_IN_SERVICE_MESH'
                    ? '??????ServiceMesh???????????????????????????????????????????????????????????????????????????????????????????????????sidecar????????????ServiceMesh????????????????????????????????????????????????localhost??????'
                    : '????????????????????????Kubernetes service????????????????????????????????????????????????????????????????????????service??????????????????Istio  control plane ?????????Istio???????????????'}
                </div>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    );
  }
}
