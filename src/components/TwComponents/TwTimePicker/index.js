/**
 * @content  自定义timepicker组件
 * @author   Leon
 * @date     2022/11/04
 *
 */
import React, { memo, useEffect, useRef, useState } from 'react';
import { Icon, Popover, DatePicker, Select, Button } from 'antd';
import {
  hourList,
  dayList,
  minList,
  timeOptionList,
  timeObject,
  formatTime
} from './conf';
import moment from 'moment';
import classNames from 'classnames';
import timeImg from '../../../../public/images/common/time.svg';
import styles from './index.less';

const { RangePicker } = DatePicker;

const { Option } = Select;

const TwTimePicker = props => {
  const { onTimeRange, hideRefresh = false, onTimeClick } = props;
  const [timeText, setTimeText] = useState('最近15分钟');
  const [timeKey, setTimeKey] = useState('last15min');
  const [pollingValue, setPollingValue] = useState(undefined);
  const [timeRange, setTimeRange] = useState({
    start: 0,
    end: 0
  });
  const [timeValue, setTimeValue] = useState([]);
  const [isExpand, setIsExpand] = useState(false);
  const toggleShowPopover = useRef();

  const handleShowPopover = e => {
    setIsExpand(!isExpand);
  };

  const handleVisibleChange = visible => {
    setIsExpand(visible);
  };

  const handlClick = (e, key, label) => {
    const end = moment().valueOf();
    const start = moment()
      .subtract(formatTime[key].count.toString(), formatTime[key].unit)
      .valueOf();
    setTimeValue([]);
    setTimeKey(key);
    setTimeText(label);
    setTimeRange({ start: 0, end: 0 });
    setIsExpand(false);
    onTimeClick && onTimeClick(key, { start, end });
  };

  const handleRangeChange = dates => {
    onTimeClick && onTimeClick('custom');
    setTimeValue(dates);
  };

  const handleRangeOk = dates => {
    let [start, end] = dates;
    start = start.valueOf();
    end = end.valueOf();
    setTimeRange({ start, end });
    setTimeKey('');
  };

  const handleSelect = value => {
    setPollingValue(value);
  };

  const handleOk = () => {
    const { start, end } = timeRange;
    if (start && end)
      setTimeText(
        `${moment(start).format('yyyy-MM-DD hh:mm:ss')} ~ ${moment(end).format(
          'yyyy-MM-DD hh:mm:ss'
        )}`
      );
    onTimeRange && onTimeRange(timeRange, pollingValue, 'custom');
    setIsExpand(false);
  };

  const renderContent = () => {
    return (
      <div className={styles['tw-time-popover']}>
        <div className={styles['container']}>
          <h3 className={styles['container-title']}>选择时间范围</h3>
          <div className={styles['container-time']}>
            <div className={styles['container-time-title']}>分</div>
            {minList.map(({ label, key }, index) => (
              <div
                key={key}
                style={{ color: key === timeKey ? 'blue' : '#000000D9' }}
                onClick={e => handlClick(e, key, label)}
              >
                {label}
              </div>
            ))}
          </div>
          <div className={styles['container-time']}>
            <div className={styles['container-time-title']}>时</div>
            {hourList.map(({ label, key }, index) => (
              <div
                key={key}
                style={{ color: key === timeKey ? 'blue' : '#000000D9' }}
                onClick={e => handlClick(e, key, label)}
              >
                {label}
              </div>
            ))}
          </div>
          <div className={styles['container-time']}>
            <div className={styles['container-time-title']}>天</div>
            {dayList.map(({ label, key }, index) => (
              <div
                key={key}
                style={{ color: key === timeKey ? 'blue' : '#000000D9' }}
                onClick={e => handlClick(e, key, label)}
              >
                {label}
              </div>
            ))}
          </div>
          <h3 className={styles['container-title']}>自定义时间范围</h3>
          <RangePicker
            size="default"
            showTime
            onChange={handleRangeChange}
            onOk={handleRangeOk}
            value={timeValue}
          />
          {!hideRefresh && (
            <>
              <h3 className={styles['container-title']}>刷新频率</h3>
              <Select
                style={{ width: '100%' }}
                placeholder="请选择刷新频率"
                onChange={handleSelect}
                value={pollingValue}
              >
                {timeObject.map(({ label, key }, index) => (
                  <Option key={key} vlaue={key}>
                    {label}
                  </Option>
                ))}
              </Select>
            </>
          )}
          <div className={styles['container-footer']}>
            <Button
              type="primary"
              style={{ marginRight: 10 }}
              onClick={handleOk}
            >
              确定
            </Button>
            <Button onClick={() => setIsExpand(false)}>取消</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles['tw-time']} onClick={e => e.stopPropagation()}>
        <Popover
          content={renderContent()}
          trigger={['click']}
          placement="bottomLeft"
          visible={isExpand}
          onVisibleChange={handleVisibleChange}
        >
          <div
            className={styles['tw-time-selector']}
            onClick={handleShowPopover}
          >
            <div className={styles['tw-time-selector-left']}>
              <img src={timeImg} />
            </div>
            <div className={styles['tw-time-selector-text']}>{timeText}</div>
            <div className={styles['tw-time-selector-right']}>
              <Icon type={isExpand ? 'caret-down' : 'caret-up'} />
            </div>
          </div>
        </Popover>
      </div>
    </>
  );
};

export default memo(TwTimePicker);
