/**
 * @content  header团队筛选组件
 * @author   Leon
 * @date     2022/10/12
 *
 */
import React, { memo, useState } from 'react';
import { Select, DatePicker } from 'antd';
import moment from 'moment';
import { formatTime } from '../LogDrawer/conf';
import styles from './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TeamConditon = props => {
  const {
    teamOptionList = [],
    timeOptionList = [],
    onTimeChange,
    onRangeChange,
    onTeamChange,
    nameSpace
  } = props;
  const [isShowRangePicker, setIsShowRangePicker] = useState(false);

  const handleTimeChange = e => {
    if (e === 'custom') {
      setIsShowRangePicker(true);
      return;
    }
    const end = moment().valueOf();
    let start = '';
    if (e === 'today') {
      start = moment()
        .startOf('day')
        .valueOf();
    } else {
      start = moment()
        .subtract(formatTime[e].count.toString(), formatTime[e].unit)
        .valueOf();
    }
    onTimeChange({ start, end });
    // setTimeRange({ start, end });
    setIsShowRangePicker(false);
  };

  const handleRangeChange = dates => {
    let [start, end] = dates;
    start = start.valueOf();
    end = end.valueOf();
    onRangeChange({ start, end });
  };

  const handleTeamChange = e => {
    onTeamChange(e);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.actions}>
          <span style={{ marginRight: 8 }}>团队</span>
          <Select
            showSearch
            placeholder="请选择团队"
            style={{ width: 142 }}
            onChange={handleTeamChange}
            value={nameSpace}
            dropdownMatchSelectWidth={false}
            filterOption={true}
            optionFilterProp="children"
            allowClear
          >
            {teamOptionList.map(item => (
              <Option key={item.namespace} value={item.namespace}>
                {item.team_alias}
              </Option>
            ))}
            <Option key={'-1'} value="default">
              默认团队
            </Option>
          </Select>
        </div>
        <div className={styles.actions}>
          <Select
            placeholder="请选择时间"
            style={{ width: 138 }}
            defaultValue={'last1hour'}
            onChange={handleTimeChange}
          >
            {timeOptionList.map(item => (
              <Option key={item.key} value={item.key}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
        {isShowRangePicker && (
          <div className={styles.actions}>
            <RangePicker size="default" showTime onOk={handleRangeChange} />
          </div>
        )}
      </div>
    </>
  );
};

export default memo(TeamConditon);
