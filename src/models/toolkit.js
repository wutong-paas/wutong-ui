import {
  getTeamListAPI,
  getTagListAPI,
  getValueOfTagListAPI,
  getLogListAPI,
  getTraceListAPI,
  getServicesListAPI,
  getComponentListAPI,
  getTraceDetailAPI,
  getTagAndValueList,
  getLogRuleConfigAPI,
  getLogRuleTemplateAPI,
  createLogConfigAPI,
  updateLogConfigAPI
} from '../services/toolkit';

export default {
  namespace: 'toolkit',
  state: {
    isShowLog: false,
    showLogWithParams: {},
    isShowTrace: false,
    showTraceWithParams: {}
  },
  effects: {
    *fetchTagList({ payload, callback }, { call }) {
      const response = yield call(getTagListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchTeamList({ payload, callback }, { call }) {
      const response = yield call(getTeamListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchValueOfTagList({ payload, callback }, { call }) {
      const response = yield call(getValueOfTagListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchLogList({ payload, callback }, { call }) {
      const response = yield call(getLogListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchTraceList({ payload, callback }, { call }) {
      const response = yield call(getTraceListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchServiceList({ payload, callback }, { call }) {
      const response = yield call(getServicesListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchComponentList({ payload, callback }, { call }) {
      const response = yield call(getComponentListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchTraceDetailList({ payload, callback }, { call }) {
      const response = yield call(getTraceDetailAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchTagAndValueList({ payload, callback }, { call }) {
      const response = yield call(getTagAndValueList, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchLogTempalteList({ payload, callback }, { call }) {
      const response = yield call(getLogRuleTemplateAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchLogConfigList({ payload, callback }, { call }) {
      const response = yield call(getLogRuleConfigAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *createLogConfig({ payload, callback }, { call }) {
      const response = yield call(createLogConfigAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *updateLogConfig({ payload, callback }, { call }) {
      const response = yield call(updateLogConfigAPI, payload);
      if (response && callback) {
        callback(response);
      }
    }
  },
  reducers: {
    showLog(state, { payload, redirect }) {
      const { isShowLog, showLogWithParams } = payload;
      return {
        ...state,
        isShowLog,
        showLogWithParams
      };
    },
    showTrace(state, { payload }) {
      const { isShowTrace, showTraceWithParams } = payload;
      return {
        ...state,
        isShowTrace,
        showTraceWithParams
      };
    }
  }
};
