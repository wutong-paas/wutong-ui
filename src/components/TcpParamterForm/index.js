import { Button, Drawer, Form, Input, message, Switch } from 'antd';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import Parameterinput from '../Parameterinput';

const FormItem = Form.Item;

@connect(({ user, loading }) => ({
  currUser: user.currentUser,
  addHttpStrategyLoading: loading.effects['gateWay/addHttpStrategy'],
  editHttpStrategyLoading: loading.effects['gateWay/editHttpStrategy']
}))
class TcpParameterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { editInfo } = this.props;
    this.state = {
      keepalive_enabled: !!(editInfo && editInfo.keepalive_enabled)
    };
  }
  onChangeKeepAlive = () => {
    const { setFieldsValue } = this.props.form;
    this.setState({ keepalive_enabled: !this.state.keepalive_enabled }, () => {
      setFieldsValue({ keepalive_enabled: this.state.keepalive_enabled });
    });
  };

  handleOk = e => {
    e.preventDefault();
    const { onOk, form } = this.props;
    const { keepalive_enabled } = this.state;
    form.validateFields((err, values) => {
      if (!err && onOk) {
        const info = Object.assign({}, values);
        // const setWebSocket = values.WebSocket;
        // let setHeaders = Array.isArray(values.set_headers)
        //   ? values.set_headers
        //   : [];
        // const isWebSocket = this.handleSetWebSocket(setHeaders);
        // const firstHeaders = setHeaders && setHeaders.length === 1;
        // if (
        //   firstHeaders &&
        //   (!setHeaders[0].item_key || !setHeaders[0].item_value)
        // ) {
        //   setHeaders = [];
        // }
        // if (setWebSocket && !isWebSocket) {
        //   setHeaders = [...setHeaders, ...webSockets];
        // }
        // info.set_headers = setHeaders;
        onOk(info);
      }
    });
  };

  render() {
    const { editInfo, form, onClose, visible } = this.props;
    const { getFieldDecorator } = form;
    const { proxyBuffering, keepalive_enabled } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    return (
      <div>
        <Drawer
          title="参数配置"
          placement="right"
          width={550}
          closable={false}
          onClose={onClose}
          visible={visible}
          maskClosable={false}
          style={{
            overflow: 'auto'
          }}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="开启KeepAlive"
              // className={styles.antd_form}
            >
              {getFieldDecorator('keepalive_enabled', {
                initialValue: keepalive_enabled
              })(
                <Switch
                  checkedChildren="开"
                  unCheckedChildren="关"
                  checked={keepalive_enabled}
                  onClick={() => {
                    this.onChangeKeepAlive();
                  }}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="KeepAlive等待时间"
              // className={styles.antd_form}
            >
              {getFieldDecorator('keepalive_idle', {
                rules: [
                  {
                    required: true,
                    message: '请输入KeepAlive等待时间'
                  }
                ],
                initialValue: editInfo ? editInfo.keepalive_idle : '30'
              })(<Input addonAfter="分" disabled={!keepalive_enabled} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="KeepAlive探测间隔"
              // className={styles.antd_form}
            >
              {getFieldDecorator('keepalive_intvl', {
                rules: [
                  {
                    required: true,
                    message: '请输入KeepAlive探测间隔'
                  }
                ],
                initialValue: editInfo ? editInfo.keepalive_intvl : '75'
              })(<Input addonAfter="秒" disabled={!keepalive_enabled} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="KeepAlive探测次数"
              // className={styles.antd_form}
            >
              {getFieldDecorator('keepalive_cnt', {
                rules: [
                  {
                    required: true,
                    message: '请输入KeepAlive探测次数'
                  }
                ],
                initialValue: editInfo ? editInfo.keepalive_cnt : '9'
              })(<Input addonAfter="次" disabled={!keepalive_enabled} />)}
            </FormItem>
          </Form>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
              zIndex: 9999
            }}
          >
            <Button
              style={{
                marginRight: 8
              }}
              onClick={onClose}
            >
              取消
            </Button>
            <Button type="primary" onClick={this.handleOk}>
              确认
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}
const tcpparameterForm = Form.create()(TcpParameterForm);
export default tcpparameterForm;
