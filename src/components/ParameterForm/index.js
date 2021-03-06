/* eslint-disable camelcase */
import { Button, Drawer, Form, Input, Switch } from 'antd';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import Parameterinput from '../Parameterinput';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ user, loading }) => ({
  currUser: user.currentUser,
  addHttpStrategyLoading: loading.effects['gateWay/addHttpStrategy'],
  editHttpStrategyLoading: loading.effects['gateWay/editHttpStrategy']
}))
class ParameterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { editInfo } = this.props;
    this.state = {
      proxyBuffering: !!(
        editInfo &&
        editInfo.proxy_buffering &&
        editInfo.proxy_buffering === 'on'
      ),
      WebSocket: !!(editInfo && editInfo.WebSocket),
      webSockets: [
        { item_key: 'Connection', item_value: 'Upgrade' },
        { item_key: 'Upgrade', item_value: '$http_upgrade' }
      ]
    };
  }
  onChangeWebSocket = () => {
    const { setFieldsValue } = this.props.form;
    this.setState({ WebSocket: !this.state.WebSocket }, () => {
      setFieldsValue({ WebSocket: this.state.WebSocket });
    });
  };

  handleOk = e => {
    e.preventDefault();
    const { onOk, form } = this.props;
    const { webSockets } = this.state;
    form.validateFields((err, values) => {
      if (!err && onOk) {
        const info = Object.assign({}, values);
        const setWebSocket = values.WebSocket;
        let setHeaders = Array.isArray(values.set_headers)
          ? values.set_headers
          : [];
        const isWebSocket = this.handleSetWebSocket(setHeaders);
        const firstHeaders = setHeaders && setHeaders.length === 1;
        if (
          firstHeaders &&
          (!setHeaders[0].item_key || !setHeaders[0].item_value)
        ) {
          setHeaders = [];
        }
        if (setWebSocket && !isWebSocket) {
          setHeaders = [...setHeaders, ...webSockets];
        }
        info.set_headers = setHeaders;
        onOk(info);
      }
    });
  };
  handleSetWebSocket = (data, newHeaders) => {
    const arr = [];
    const [first, second] = this.state.webSockets;
    let results = false;

    if (data && data.length > 0) {
      data.map(item => {
        const { item_key, item_value } = item;
        if (
          (item_key === first.item_key && item_value === first.item_value) ||
          (item_key === second.item_key && item_value === second.item_value)
        ) {
          results = true;
        } else {
          arr.push(item);
        }
      });
    }
    if (newHeaders) {
      return arr;
    }
    return results;
  };

  checkContent = (_, value, callback) => {
    const num = Number(value);
    if (num) {
      if (num < 0) {
        callback('???????????????0');
        return;
      }
      if (num > 65535) {
        callback('???????????????65535');
        return;
      }
    }
    callback();
  };
  checkBufferSize = (res, value, callback) => {
    const num = Number(value);
    if (num <= 0) {
      callback('????????????????????????????????????????????????????????????4K');
      return;
    }
    if (num > 65535) {
      callback('???????????????65535');
      return;
    }
    callback();
  };

  render() {
    const { editInfo, form, onClose, visible } = this.props;
    const { getFieldDecorator } = form;
    const { proxyBuffering, WebSocket } = this.state;
    const customRules = [
      {
        pattern: new RegExp(/^[0-9]\d*$/, 'g'),
        message: '???????????????'
      },
      { validator: this.checkContent }
    ];
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
    const setHeaders = editInfo && editInfo.set_headers;
    const defaultSetHeaders = this.handleSetWebSocket(setHeaders, true);
    return (
      <div>
        <Drawer
          title="????????????"
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
              label="??????????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_connect_timeout', {
                rules: [
                  {
                    required: true,
                    message: '?????????????????????'
                  }
                ],
                initialValue: editInfo ? editInfo.proxy_connect_timeout : '5'
              })(<Input addonAfter="???" />)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label="??????????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_send_timeout', {
                rules: [
                  {
                    required: true,
                    message: '???????????????????????????'
                  }
                ],
                initialValue: editInfo ? editInfo.proxy_send_timeout : '60'
              })(<Input addonAfter="???" />)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label="??????????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_read_timeout', {
                rules: [
                  {
                    required: true,
                    message: '???????????????????????????'
                  }
                ],
                initialValue: editInfo ? editInfo.proxy_read_timeout : '60'
              })(<Input addonAfter="???" />)}
            </FormItem>

            <FormItem
              {...formItemLayout}
              label="????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_body_size', {
                rules: [
                  {
                    required: true,
                    message: '?????????'
                  },
                  ...customRules
                ],
                initialValue: editInfo ? editInfo.proxy_body_size : '0'
              })(<Input addonAfter="Mb" />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="???????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_buffer_numbers', {
                rules: customRules,
                initialValue: editInfo ? editInfo.proxy_buffer_numbers : '4'
              })(<Input />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="???????????????"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_buffer_size', {
                rules: [{ validator: this.checkBufferSize }],
                initialValue: editInfo ? editInfo.proxy_buffer_size : '4'
              })(<Input addonAfter="K" placeholder="????????????????????????" />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="WebSocket??????"
              className={styles.antd_form}
            >
              {getFieldDecorator('WebSocket', {
                initialValue: WebSocket
              })(
                <Switch
                  checkedChildren="???"
                  unCheckedChildren="???"
                  checked={WebSocket}
                  onClick={() => {
                    this.onChangeWebSocket();
                  }}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="??????ProxyBuffer"
              className={styles.antd_form}
            >
              {getFieldDecorator('proxy_buffering', {
                initialValue: proxyBuffering
              })(
                <Switch
                  checkedChildren="???"
                  unCheckedChildren="???"
                  checked={proxyBuffering}
                  onClick={() => {
                    this.setState({ proxyBuffering: !proxyBuffering });
                  }}
                />
              )}
            </FormItem>

            <FormItem {...formItemLayout} label="??????????????????">
              {getFieldDecorator('set_headers', {
                initialValue: defaultSetHeaders
              })(<Parameterinput editInfo={defaultSetHeaders} />)}
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
              ??????
            </Button>
            <Button type="primary" onClick={this.handleOk}>
              ??????
            </Button>
          </div>
        </Drawer>
      </div>
    );
  }
}
const parameterForm = Form.create()(ParameterForm);
export default parameterForm;
