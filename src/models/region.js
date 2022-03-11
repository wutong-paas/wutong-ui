import {
  createEnterpriseCluster,
  deleteEnterpriseCluster,
  fetchEnterpriseCluster,
  fetchEnterpriseClusters,
  fetchEnterpriseClusterTenants,
  getProtocols,
  sethEnterpriseClusterTenantLimit,
  upEnterpriseCluster,
  singleClusterDashboard,
  loadAverageClusterDashboard,
  diskIOClusterDashboard,
  networkTrafficClusterDashboard,
  networkIOClusterDashboard,
  controllerManagerQueueDepthClusterDashboard,
  ingressControllerConnectionsClusterDashboard,
  headlinesDataGet,
  CPUUsageDataGet,
  CPUQuotaDataGet,
  memoryUsageDataGet,
  memoryQuotaDataGet,
  networkQuotaDataGet
} from '../services/region';

export default {
  namespace: 'region',
  state: {
    // 成员
    protocols: []
  },
  effects: {
    *fetchProtocols({ payload }, { call, put }) {
      const response = yield call(getProtocols, payload);
      if (response && !response.status) {
        yield put({ type: 'saveProtocols', payload: response.list });
      }
    },
    *upEnterpriseCluster({ payload, callback }, { call }) {
      const response = yield call(upEnterpriseCluster, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *createEnterpriseCluster({ payload, callback, handleError }, { call }) {
      const response = yield call(
        createEnterpriseCluster,
        payload,
        handleError
      );
      if (response && callback) {
        callback(response);
      }
    },
    *fetchEnterpriseClusters({ payload, callback }, { call }) {
      const response = yield call(fetchEnterpriseClusters, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *fetchEnterpriseClusterTenants(
      { payload, callback, handleError },
      { call }
    ) {
      const response = yield call(
        fetchEnterpriseClusterTenants,
        payload,
        handleError
      );
      if (response && callback) {
        callback(response);
      }
    },
    *setEnterpriseTenantLimit({ payload, callback, handleError }, { call }) {
      const response = yield call(
        sethEnterpriseClusterTenantLimit,
        payload,
        handleError
      );
      if (response && callback) {
        callback(response);
      }
    },
    *fetchEnterpriseCluster({ payload, callback }, { call }) {
      const response = yield call(fetchEnterpriseCluster, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *deleteEnterpriseCluster({ payload, callback, handleError }, { call }) {
      const response = yield call(
        deleteEnterpriseCluster,
        payload,
        handleError
      );
      if (response && callback) {
        callback(response);
      }
    },
    *singleClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(singleClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *loadAverageClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(loadAverageClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *diskIOClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(diskIOClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *networkTrafficClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(networkTrafficClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *networkIOClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(networkIOClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *controllerManagerQueueDepthClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(controllerManagerQueueDepthClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *ingressControllerConnectionsClusterDashboard({ payload, callback }, { call }) {
      const response = yield call(ingressControllerConnectionsClusterDashboard, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *headlinesDataGet({ payload, callback }, { call }) {
      const response = yield call(headlinesDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *CPUUsageDataGet({ payload, callback }, { call }) {
      const response = yield call(CPUUsageDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *CPUQuotaDataGet({ payload, callback }, { call }) {
      const response = yield call(CPUQuotaDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *memoryUsageDataGet({ payload, callback }, { call }) {
      const response = yield call(memoryUsageDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *memoryQuotaDataGet({ payload, callback }, { call }) {
      const response = yield call(memoryQuotaDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    },
    *networkQuotaDataGet({ payload, callback }, { call }) {
      const response = yield call(networkQuotaDataGet, payload);
      if (response && callback) {
        callback(response);
      }
    }
  },
  reducers: {
    saveProtocols(state, action) {
      return {
        ...state,
        protocols: action.payload
      };
    }
  }
};
