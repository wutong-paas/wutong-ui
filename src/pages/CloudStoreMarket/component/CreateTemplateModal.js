/**
 * @content  创建应用模板模态框
 * @author   Leon
 * @date     2022-06-21
 *
 */

import { Modal, Form, Input, notification } from 'antd';
import { useEffect, useState } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import { string } from 'prop-types';

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

const CreateTemplateForm = props => {
  const {
    createTemplateModalVisible,
    form,
    onCancel,
    eid,
    dispatch,
    market_id,
    createdCallback
  } = props;
  const { getFieldDecorator, validateFieldsAndScroll } = form;
  const [isAddLicense, setIsAddLicense] = useState(true);
  const [loading, setLoading] = useState(false);

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
        type: 'store/createApplicationTemplate',
        payload: values,
        callback: res => {
          if (res?.status_code === 200) {
            notification.success({ message: '添加成功！' });
            onCancel();
            createdCallback && createdCallback();
          }
          setLoading(false);
        }
      });
    });
  };

  return (
    <>
      <Modal
        title="创建应用模板"
        visible={createTemplateModalVisible}
        onCancel={onCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form {...formItemLayout}>
          <Form.Item label="应用模板名称">
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: '请输入应用模板名称！'
                },
                {
                  max: 32,
                  type: 'string',
                  message: '应用模板名称最大长度为32位！'
                },
                {
                  whitespace: true,
                  message: '应用模板名称不能为空字符！'
                }
              ]
            })(<Input placeholder="请输入应用模板名称" />)}
            <div className={styles.conformDesc}>
              请输入创建的应用模板名称，最大长度32位
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const CreateTemplateFormModal = Form.create({ name: 'createTemplateForm' })(
  connect(({}) => ({}))(CreateTemplateForm)
);

export default CreateTemplateFormModal;
