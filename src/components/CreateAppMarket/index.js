import { Form, Input, Modal, Select } from 'antd';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import styles from '../CreateTeam/index.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create()
@connect()
class CreateAppMarket extends PureComponent {
  constructor(arg) {
    super(arg);
    this.state = {
      marketType: [{ key: 'rainstore', name: 'Rainstore' }]
    };
  }

  handleSubmit = () => {
    const { form, marketInfo } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        if (marketInfo) {
          this.upAppMarket(values);
        } else {
          this.createAppMarket(values);
        }
      }
    });
  };
  upAppMarket = values => {
    const { dispatch, eid, onOk, marketInfo } = this.props;
    dispatch({
      type: 'market/upAppMarket',
      payload: Object.assign(
        {},
        { enterprise_id: eid, marketName: marketInfo.name },
        values
      ),
      callback: res => {
        if (res && res.status_code === 200) {
          const { list } = res;
          onOk && onOk(list && list.ID);
        }
      }
    });
  };
  createAppMarket = values => {
    const { dispatch, eid, onOk } = this.props;

    dispatch({
      type: 'market/createAppMarket',
      payload: Object.assign({}, { enterprise_id: eid }, values),
      callback: res => {
        if (res && res.status_code === 200) {
          const { bean } = res;
          onOk && onOk(bean && bean.ID);
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { onCancel, title, marketInfo = {}, loading } = this.props;
    const { marketType } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    };

    return (
      <Modal
        title={title}
        visible
        className={styles.TelescopicModal}
        onOk={this.handleSubmit}
        onCancel={onCancel}
        confirmLoading={loading || false}
      >
        <span
          style={{
            textAlign: 'center',
            display: 'block',
            marginBottom: '16px'
          }}
        >
          ??????????????????????????????
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://store.wutong.com/marketregist"
          >
            ?????????
          </a>
        </span>
        <Form onSubmit={this.handleSubmit} layout="horizontal">
          <FormItem {...formItemLayout} label="??????">
            {getFieldDecorator('name', {
              initialValue: marketInfo.name || '',
              rules: [
                { required: true, message: '???????????????' },
                {
                  pattern: /^[a-z0-9A-Z-_]+$/,
                  message: '???????????????????????????-_??????'
                },
                {
                  max: 64,
                  message: '????????????64???'
                }
              ]
            })(<Input placeholder="???????????????" />)}
            <div className={styles.conformDesc}>
              ???????????????????????????????????????????????????????????????????????????
            </div>
          </FormItem>
          <FormItem {...formItemLayout} label="??????">
            {getFieldDecorator('type', {
              initialValue: marketInfo.type || 'rainstore',
              rules: [
                {
                  required: true,
                  message: '???????????????????????????'
                }
              ]
            })(
              <Select
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder="???????????????????????????"
              >
                {marketType.map(item => {
                  return <Option key={item.key}>{item.name}</Option>;
                })}
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="????????????">
            {getFieldDecorator('url', {
              initialValue: marketInfo.url || '',
              rules: [
                {
                  required: true,
                  message: '?????????????????????'
                }
              ]
            })(<Input placeholder="?????????????????????" />)}
          </FormItem>

          <FormItem {...formItemLayout} label="?????????">
            {getFieldDecorator('domain', {
              initialValue: marketInfo.domain || '',

              rules: [
                {
                  required: true,
                  message: '??????????????????'
                }
              ]
            })(<Input placeholder="??????????????????" />)}
          </FormItem>

          <FormItem {...formItemLayout} label="AccessKey">
            {getFieldDecorator('access_key', {
              initialValue: marketInfo.access_key || '',
              rules: [
                { required: false, message: '?????????AccessKey' },
                {
                  max: 64,
                  message: '????????????64???'
                }
              ]
            })(<Input placeholder="?????????AccessKey" />)}
            <div className={styles.conformDesc}>
              ???????????????????????????????????????????????????AccessKey
            </div>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default CreateAppMarket;
