/**
 *  author : bo.peng
 *  createTime 2022-01-13 14:24:32
 *  description :Rewrites
 */
import { Col, Icon, Input, message, Row, Select } from 'antd';
import React from 'react';

const flags = ['last', 'break', 'redirect', 'permanent'];
function generateField() {
  return { regex: '', replacement: '', flag: flags[0] };
}
export default class Component extends React.Component {
  state = {
    fields: []
  };

  componentDidMount() {
    this.initValue();
  }

  onChange = (index, key, value) => {
    const { fields } = this.state;
    const field = fields[index];
    field[key] = value;
    fields.splice(index, 1, field);
    this.setState({ fields });
    this.props.onChange(fields);
  };

  initValue = () => {
    const { value } = this.props;
    if (value) {
      /* try {
        fields = JSON.parse(value);
      } catch {
        console.warning('解析失败');
      } */
      this.setState({ fields: value }, () => {
        this.props.onChange(value);
      });
    }
  };

  remove = k => {
    const { fields } = this.state;
    fields.splice(k, 1);
    this.setState({ fields }, () => {
      this.props.onChange(fields);
    });
  };

  add = () => {
    const { fields } = this.state;
    if (fields.length > 10) {
      message.warning('超出最大范围！');
      return;
    }
    fields.push(generateField());
    this.setState({ fields }, () => {
      this.props.onChange(fields);
    });
  };

  render() {
    const { onChange } = this;
    const { fields } = this.state;
    const formItems = fields.map((item, index) => (
      <Row key={String(index)} gutter={5}>
        <Col span={7}>
          <Input
            maxLength={10}
            value={item.regex}
            placeholder="regex"
            onChange={e => onChange(index, 'regex', e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={7}>
          <Input
            maxLength={10}
            value={item.replacement}
            placeholder="replacement"
            onChange={e => onChange(index, 'replacement', e.target.value)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={7}>
          <Select
            value={item.flag}
            onChange={val => onChange(index, 'flag', val)}
          >
            {flags.map(val => (
              <Select.Option key={val} value={val}>
                {val}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={3}>
          <Icon
            type={index === 0 ? 'plus-circle' : 'minus-circle'}
            style={{ fontSize: '20px' }}
            onClick={() => {
              if (index === 0) {
                this.add();
              } else {
                this.remove(index);
              }
            }}
          />
        </Col>
      </Row>
    ));
    return fields.length ? (
      formItems
    ) : (
      <Icon
        type="plus-circle"
        style={{ fontSize: '20px' }}
        onClick={this.add}
      />
    );
  }
}
