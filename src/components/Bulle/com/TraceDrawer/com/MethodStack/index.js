/**
 * @content  方法栈详情
 * @author   Leon
 * @date     2022/10/08
 *
 */
import React from 'react';
import { Table, Button, Collapse, Icon, Tooltip, message } from 'antd';
import { columns, data, lableList, traceDetailTitle } from './conf';
import moment from 'moment';
import styles from './index.less';

const { Panel } = Collapse;

const MethodStack = props => {
  const { onActivityKeyChange, traceDetail } = props;
  const { componentName } = traceDetail || {};
  return (
    <>
      <div className={styles.back}>
        <Button onClick={onActivityKeyChange}>返回上级</Button>
      </div>
      <div className={styles.header}>
        <h2 className={styles.title}>{componentName}</h2>
        <div className={styles.info}>
          {traceDetail &&
            lableList.map(({ label, key }, index) => (
              <div key={index}>
                <span>{label}：</span>
                <span>
                  {key === 'createdTime'
                    ? moment(traceDetail[key]).format('YYYY-MM-DD HH:MM:SS.SSS')
                    : traceDetail[key]}
                  {key === 'timeLine' ? 'ms' : null}
                </span>
              </div>
            ))}
          {traceDetail.children && traceDetail.children.length > 0 && (
            <div key={-1}>
              <span>子级数量：</span>
              <span>{traceDetail.children.length}</span>
            </div>
          )}
        </div>
      </div>
      <div>
        <Collapse>
          {Object.keys(traceDetail.info)
            .filter(i => i !== 'reference')
            .map((item, index) => {
              if (traceDetail.info[item].length !== 0)
                return (
                  <Panel
                    key={index}
                    header={
                      <div
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 16 }}>
                          {traceDetailTitle[item]}
                          {item !== 'logs' ? '：' : null}
                        </span>
                        {item === 'logs'
                          ? null
                          : traceDetail.info[item].map((m, n) => {
                              return (
                                <span key={n} style={{ marginRight: 16 }}>
                                  <span style={{ fontWeight: 600 }}>
                                    {m.key}：
                                  </span>
                                  {m.value}
                                </span>
                              );
                            })}
                      </div>
                    }
                  >
                    <div>
                      {item === 'logs' ? (
                        <Collapse>
                          {traceDetail.info[item].map((m, n) => {
                            return (
                              <Panel
                                key={n}
                                header={
                                  <div
                                    style={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    <span>
                                      {(
                                        m.timestamp - traceDetail.createdTime
                                      ).toFixed(2) + 'ms'}
                                      ：
                                    </span>
                                    {m.fields.map((k, l) => {
                                      return (
                                        <span
                                          key={l}
                                          style={{ marginRight: 16 }}
                                        >
                                          <span style={{ fontWeight: 600 }}>
                                            {k.key}：
                                          </span>
                                          {k.value}
                                        </span>
                                      );
                                    })}
                                  </div>
                                }
                              >
                                {m.fields.map((m, n) => {
                                  return (
                                    <div
                                      key={n}
                                      style={{
                                        //marginRight: 16,
                                        display: 'flex',
                                        marginBottom: 8
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          minWidth: 200
                                        }}
                                      >
                                        {m.key}：
                                      </div>
                                      <div style={{ flex: 1, width: 0 }}>
                                        {m.value}
                                      </div>
                                      <div
                                        style={{
                                          width: 20,
                                          marginLeft: 24,
                                          cursor: 'pointer',
                                          color: 'blue'
                                        }}
                                      >
                                        <Tooltip title="点击复制">
                                          <Icon
                                            type="copy"
                                            onClick={() => {
                                              navigator.clipboard
                                                .writeText(JSON.stringify(m))
                                                .catch(e => message.error(e));
                                              message.success('复制成功！');
                                            }}
                                          />
                                        </Tooltip>
                                      </div>
                                    </div>
                                  );
                                })}
                              </Panel>
                            );
                          })}
                        </Collapse>
                      ) : (
                        traceDetail.info[item].map((m, n) => {
                          return (
                            <div
                              key={n}
                              style={{
                                //marginRight: 16,
                                display: 'flex',
                                marginBottom: 8
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  minWidth: 200
                                }}
                              >
                                {m.key}：
                              </div>
                              <div style={{ flex: 1, width: 0 }}>
                                {typeof m.value === 'string' && (
                                  <span
                                    style={{ color: 'green' }}
                                  >{`"${m.value}"`}</span>
                                )}
                                {typeof m.value === 'number' && (
                                  <span
                                    style={{ color: 'brown' }}
                                  >{m.value}</span>
                                )}
                              </div>
                              <div
                                style={{
                                  width: 20,
                                  marginLeft: 24,
                                  cursor: 'pointer',
                                  color: 'blue'
                                }}
                              >
                                <Tooltip title="点击复制">
                                  <Icon
                                    type="copy"
                                    onClick={() => {
                                      navigator.clipboard
                                        .writeText(JSON.stringify(m))
                                        .catch(e => message.error(e));
                                      message.success('复制成功！');
                                    }}
                                  />
                                </Tooltip>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Panel>
                );
            })}
        </Collapse>
      </div>
      {/* <Table
        columns={columns()}
        dataSource={data}
        defaultExpandAllRows
        rowKey="key"
      /> */}
    </>
  );
};

export default MethodStack;
