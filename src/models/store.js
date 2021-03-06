import {
  fetchStoreListAPI,
  createApplicationStoreAPI,
  fetchStoreApplicationListAPI,
  createApplicationTemplateAPI,
  installApplicationAPI,
  fetchApplicationVersionListAPI,
  fetchStoreSelectListAPI
} from '../services/store';

export default {
  namespace: 'store',
  state: {},
  effects: {
    *fetchStoreList({ payload, callback }, { call }) {
      const response = yield call(fetchStoreListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *createApplicationStore({ payload, callback }, { call }) {
      const response = yield call(createApplicationStoreAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchStoreApplicationList({ payload, callback, handleError }, { call }) {
      const response = yield call(
        fetchStoreApplicationListAPI,
        payload,
        handleError
      );
      if (response && callback) {
        callback(response);
      }
    },
    *createApplicationTemplate({ payload, callback }, { call }) {
      const response = yield call(createApplicationTemplateAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *installApplication({ payload, callback }, { call }) {
      const response = yield call(installApplicationAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchApplicationVersionList({ payload, callback }, { call }) {
      const response = yield call(fetchApplicationVersionListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchStoreSelectList({ payload, callback }, { call }) {
      const response = yield call(fetchStoreSelectListAPI, payload);
      if (response && callback) {
        callback(response);
      }
    }
  },
  reducers: {}
};
