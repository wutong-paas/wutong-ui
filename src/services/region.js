/* eslint-disable no-undef */
import apiconfig from '../../config/api.config';
import request from '../utils/request';

/*
	获取集群下的协议
*/
export async function getProtocols(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/protocols`,
    {
      method: 'get',
      params: {
        region_name: body.region_name
      }
    }
  );
}

/** 创建集群 */
export async function createEnterpriseCluster(params, handleError = null) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${params.enterprise_id}/regions`,
    {
      method: 'post',
      data: {
        region_alias: params.region_alias,
        region_name: params.region_name,
        region_type: params.region_type,
        desc: params.desc,
        token: params.token,
        provider: params.provider,
        provider_cluster_id: params.providerClusterID
      },
      handleError
    }
  );
}

/** 编辑集群 */
export async function upEnterpriseCluster(params) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${params.enterprise_id}/regions/${params.region_id}`,
    {
      method: 'PUT',
      data: params
    }
  );
}

/* 获取企业集群 */
export async function fetchEnterpriseClusters(param) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${param.enterprise_id}/regions`,
    {
      method: 'get',
      params: {
        check_status: param.check_status || 'yes'
      }
    }
  );
}

export async function fetchEnterpriseClusterTenants(param, handleError) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${param.enterprise_id}/regions/${param.region_id}/tenants`,
    {
      method: 'get',
      params: {
        page: param.page || 1,
        pageSize: param.pageSize || 10
      },
      handleError
    }
  );
}

export async function sethEnterpriseClusterTenantLimit(param, handleError) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${param.enterprise_id}/regions/${param.region_id}/tenants/${param.tenant_name}/limit`,
    {
      method: 'post',
      data: {
        limit_memory: param.limit_memory
      },
      handleError
    }
  );
}

/* 获取企业集群详情 */
export async function fetchEnterpriseCluster(param) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${param.enterprise_id}/regions/${param.region_id}`,
    {
      method: 'get'
    }
  );
}

/** 删除集群 */
export async function deleteEnterpriseCluster(params, handleError) {
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${params.enterprise_id}/regions/${params.region_id}`,
    {
      method: 'DELETE',
      data: {
        force: params.force
      },
      handleError
    }
  );
}

/** 单线集群监控 */
export async function singleClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/queryRange.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        query: params.query,
        region: params.region,
        team: params.team || ''
      }
    }
  );
}

/** LoadAverage集群监控 */
export async function loadAverageClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/load_average.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** DiskIO集群监控 */
export async function diskIOClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/disk_io.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** networkTraffic集群监控 */
export async function networkTrafficClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/network_traffic.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** networkIO集群监控 */
export async function networkIOClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/network_io.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** ControllerManagerQueueDepth集群监控 */
export async function controllerManagerQueueDepthClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/controller_manager.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** ingressControllerConnections集群监控 */
export async function ingressControllerConnectionsClusterDashboard(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/ingress_controller_connection.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        detail: params.detail,
        region: params.region,
        team: params.team || ''
      }
    }
  )
}

/** 监控页签下获取Headlines数据 */
export async function headlinesDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/headlines.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}

/** 监控页签下获取CPUUsage数据 */
export async function CPUUsageDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/cpu_usage.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}

/** 监控页签下获取CPUQuota数据 */
export async function CPUQuotaDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/cpu_quota.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}

/** 监控页签下获取MemoryUsage数据 */
export async function memoryUsageDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/memory_usage.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        end: params.end,
        step: params.step,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}

/** 监控页签下获取MemoryQuota数据 */
export async function memoryQuotaDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/memory_quota.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}

/** 监控页签下获取NetworkQuotaDataGet数据 */
export async function networkQuotaDataGet(params) {
  return request(
    `${apiconfig.operationUrl}/monitor/extra/network_quota.json`,
    {
      method: 'post',
      data: {
        start: params.start,
        enterprise: params.enterprise,
        region: params.region,
        team: params.team,
        groupId: params.groupId
      }
    }
  )
}
