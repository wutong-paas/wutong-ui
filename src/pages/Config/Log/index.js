/**
 * @content 团队视图-设置
 * @author  Leon
 * @date    2022/10/09
 *
 */

import React, { useState, useRef, useEffect } from 'react';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { connect } from 'dva';
import CodeMirror from 'react-codemirror';
import yaml from 'js-yaml';
import styles from './index.less';
import { Button, message, Empty, Spin, Alert } from 'antd';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/seti.css');
require('codemirror/addon/display/fullscreen.css');
require('../../../styles/codemirror.less');
require('codemirror/addon/display/panel');
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/yaml/yaml');
require('codemirror/addon/display/fullscreen');
require('codemirror/addon/edit/matchbrackets');

const LogTagConfig = props => {
  const {
    dispatch,
    teamInfo,
    logConfigLoading,
    logTempalteLoading,
    createLoading,
    updateLoading,
    match: {
      params: { teamName }
    }
  } = props;
  const [showValue, setShowValue] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [isShow, setIsShow] = useState(true);
  const [isAdd, setIsAdd] = useState(false);
  const [readonly, setReadonly] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const editor = useRef(null);
  const options = () => ({
    mode: { name: 'javascript', json: true },
    lineNumbers: true,
    theme: 'seti',
    fullScreen: false,
    lineWrapping: true,
    smartIndent: true,
    matchBrackets: true,
    scrollbarStyle: null,
    showCursorWhenSelecting: true,
    readOnly: readonly
  });

  useEffect(() => {
    fetchRuleConfig();
  }, []);

  const handleCodeChange = value => {
    setEditorValue(value);
  };

  const handleSave = () => {
    yaml.loadAll(showValue, function(value) {
      dispatch({
        type: `toolkit/${isAdd ? 'createLogConfig' : 'updateLogConfig'}`,
        payload: value,
        callback: res => {
          fetchRuleConfig();
        }
      });
    });
  };

  const fetchRuleTemplate = callback => {
    if (teamInfo) {
      const currentTeam = teamInfo.findIndex(i => i.team_name === teamName);
      dispatch({
        type: 'toolkit/fetchLogTempalteList',
        payload: {
          // namespace: 'default'
          namespace: teamInfo[currentTeam].namespace
        },
        callback: res => {
          const { full, update } = res;
          callback(full, update);
        }
      });
    }
  };

  const fetchRuleConfig = () => {
    if (teamInfo) {
      const currentTeam = teamInfo.findIndex(i => i.team_name === teamName);
      dispatch({
        type: 'toolkit/fetchLogConfigList',
        payload: {
          // namespace: 'default'
          namespace: teamInfo[currentTeam].namespace
        },
        callback: res => {
          const { full, update } = res;
          // full = null;
          // update = null;
          if (full || update) {
            setShowValue(yaml.dump(full));
            setEditorValue(yaml.dump(update));
            editor.current?.getCodeMirror().setValue(yaml.dump(full));
            setIsShow(!full && !update);
          }
        }
      });
    }
  };

  const handleEdit = () => {
    if (readonly) {
      editor.current.getCodeMirror().setValue(editorValue);
      setReadonly(!readonly);
    } else {
      try {
        yaml.loadAll(editorValue, function(parseValue) {
          yaml.loadAll(showValue, function(parseShowValue) {
            parseShowValue.spec.pipelineStages = parseValue;
            setShowValue(yaml.dump(parseShowValue));
            editor.current.getCodeMirror().setValue(yaml.dump(parseShowValue));
          });
          // TODO  to do something
        });
        setReadonly(!readonly);
        setErrorMessage('');
      } catch (e) {
        // message.warning(e.message);
        setErrorMessage(e.message);
      }
    }
  };

  return (
    <div className={styles.wrap}>
      <PageHeaderLayout
        breadcrumbList={null}
        title="日志采集配置"
        content="编辑yaml文件，配置日志标签提取规则"
      >
        <Spin spinning={logConfigLoading}>
          {isShow ? (
            <div>
              <Button
                type="primary"
                onClick={() => {
                  setIsAdd(true);
                  fetchRuleTemplate((templateFull, templateUpdate) => {
                    setShowValue(yaml.dump(templateFull));
                    setEditorValue(yaml.dump(templateUpdate));
                    editor.current
                      ?.getCodeMirror()
                      .setValue(yaml.dump(templateFull));
                    setIsShow(false);
                  });
                }}
                loading={logTempalteLoading}
              >
                新增规则
              </Button>
              <Empty description="暂无配置规则" />
            </div>
          ) : (
            <>
              {errorMessage && (
                <Alert
                  message={errorMessage}
                  type="error"
                  style={{ marginBottom: 16 }}
                  closable
                  onClose={() => {
                    setErrorMessage('');
                  }}
                />
              )}
              <CodeMirror
                ref={editor}
                options={options()}
                value={showValue}
                onChange={handleCodeChange}
                //onFocusChange={handleFocusChange}
              />
              <div className={styles.actions}>
                <Button
                  type="primary"
                  onClick={handleSave}
                  style={{ marginRight: 16 }}
                  disabled={!readonly}
                  loading={createLoading || updateLoading}
                >
                  提交
                </Button>
                <Button onClick={handleEdit}>
                  {readonly ? '编辑' : '保存'}
                </Button>
              </div>
            </>
          )}
        </Spin>
      </PageHeaderLayout>
    </div>
  );
};

export default connect(({ global, loading }) => ({
  teamInfo: global.teamInfo,
  logConfigLoading: loading.effects['toolkit/fetchLogConfigList'],
  logTempalteLoading: loading.effects['toolkit/fetchLogTempalteList'],
  createLoading: loading.effects['toolkit/createLogConfig'],
  updateLoading: loading.effects['toolkit/updateLogConfig']
}))(LogTagConfig);
