import {
  Alert,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Typography
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { Fragment, PureComponent } from 'react';
import styles from '../CreateTeam/index.less';

const FormItem = Form.Item;
const { Paragraph } = Typography;

@Form.create()
@connect()
class AccesstokenForm extends PureComponent {
  constructor(arg) {
    super(arg);
    this.state = {
      accessKey: false,
      loading: false
    };
  }

  componentDidMount() {
    const { ID } = this.props;
    if (ID) {
      this.putAccesstoken(ID);
    }
  }
  handleSubmit = () => {
    const { form, onOk } = this.props;
    const { accessKey } = this.state;
    if (accessKey) {
      onOk();
      this.handleCloneAccessKey();
      return null;
    }
    form.validateFields((err, values) => {
      if (!err) {
        if (values.age) {
          const endTime = moment(values.age).valueOf();
          const startTime = moment().valueOf();
          values.age = moment(endTime).diff(moment(startTime), 'seconds');
        }
        this.addAccesstoken(values);
      }
    });
  };
  handleAccesstokenCallback = res => {
    if (res && res.status_code === 200) {
      this.setState({ accessKey: res.bean.access_key });
    }
    this.setState({ loading: false });
  };
  addAccesstoken = values => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'user/addAccessToken',
      payload: values,
      callback: res => {
        this.handleAccesstokenCallback(res);
      },
      handleError: err => {
        if (err && err.data && err.data.msg_show) {
          notification.warning({
            message: err.data.msg_show
          });
        }
        this.setState({ loading: false });
      }
    });
  };

  putAccesstoken = ID => {
    const { dispatch } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'user/putAccessToken',
      payload: {
        user_id: ID
      },
      callback: res => {
        this.handleAccesstokenCallback(res);
      }
    });
  };

  disabledDate = current => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  };

  disabledDateTime = () => {
    return {
      disabledHours: () => this.range(0, 24).splice(4, 20),
      disabledMinutes: () => this.range(30, 60),
      disabledSeconds: () => [55, 56]
    };
  };

  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  handleCloneAccessKey = () => {
    this.setState({
      accessKey: false
    });
    const { onOk, onCancel } = this.props;
    const { accessKey } = this.state;
    if (accessKey) {
      onOk();
    } else {
      onCancel();
    }
  };

  render() {
    const { form, ID } = this.props;
    const { getFieldDecorator } = form;
    const { loading, accessKey } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 6
        }
      },
      wrapperCol: {
        xs: {
          span: 24
        },
        sm: {
          span: 14
        }
      }
    };

    return (
      <Modal
        visible
        confirmLoading={loading}
        maskClosable={false}
        className={styles.TelescopicModal}
        title={ID || accessKey ? '?????????AccessKey' : '??????????????????'}
        onOk={this.handleSubmit}
        onCancel={this.handleCloneAccessKey}
      >
        {ID || accessKey ? (
          <Fragment>
            <Alert
              message="?????????AccessKey?????????????????????????????????"
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <Alert
              message={
                <Paragraph style={{ marginBottom: '0' }} copyable>
                  {accessKey}
                </Paragraph>
              }
              style={{ marginBottom: '20px' }}
              type="success"
            />
          </Fragment>
        ) : (
          <Fragment>
            <FormItem {...formItemLayout} label="??????">
              {getFieldDecorator('note', {
                rules: [
                  { required: true, message: '???????????????!' },
                  {
                    max: 32,
                    message: '????????????32???'
                  }
                ],
                initialValue: ''
              })(<Input placeholder="???????????????" />)}
            </FormItem>

            <FormItem {...formItemLayout} label="????????????">
              {getFieldDecorator('age', {
                rules: [{ required: false, message: '???????????????!' }],
                initialValue: ''
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  disabledDate={this.disabledDate}
                  disabledTime={this.disabledDateTime}
                  showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                />
              )}
            </FormItem>
          </Fragment>
        )}
      </Modal>
    );
  }
}

export default AccesstokenForm;
