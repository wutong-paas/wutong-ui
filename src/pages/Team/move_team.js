/* eslint-disable react/sort-comp */
import { Form, Input, Modal } from 'antd';
import React, { PureComponent } from 'react';

const FormItem = Form.Item;
@Form.create()
export default class MoveTeam extends PureComponent {
  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.onSubmit(fieldsValue);
    });
  };
  onCancel = () => {
    this.props.onCancel();
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const initValue = this.props.teamAlias;
    const initNameSpace = this.props.namespace;
    return (
      <Modal
        title="修改团队名称"
        visible
        onOk={this.handleSubmit}
        onCancel={this.onCancel}
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="团队名称">
            {getFieldDecorator('new_team_alias', {
              initialValue: initValue || '',
              rules: [
                {
                  required: true,
                  message: '不能为空!'
                },
                { max: 32, message: '最大长度32位' }
              ]
            })(<Input placeholder="请输入新的团队名称" />)}
          </FormItem>
        </Form>
        <Form>
          <FormItem label="团队英文名称">
            {getFieldDecorator('namespace', {
              initialValue: initNameSpace || '',
            })(<Input disabled placeholder="请输入新的团队名称" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
