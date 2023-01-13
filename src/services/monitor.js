/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import apiconfig from '../../config/api.config';
import request from '../utils/request';

/*
	获取应用在线人数监控数据(当前请求时间点的数据)
*/
export function getMonitorRangeData(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.teamName}/apps/${body.componentAlias}/monitor/query_range`,
    {
      method: 'get',
      showMessage: false,
      params: {
        query: body.query,
        start: body.start || new Date().getTime() / 1000 - 60 * 60,
        end: body.end || new Date().getTime() / 1000,
        step: body.step || 72,
        disable_auto_label: body.disable_auto_label
      },
      showLoading: false
    }
  );
}

export function getComponentCPURange(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/monitor/query`,
    {
      method: 'get',
      showMessage: false,
      params: {
        query: `max(app_requestclient{service_id="${body.serviceId}"})`
      },
      showLoading: false
    }
  );
}

export function getComponentNetworkRange(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/monitor/query`,
    {
      method: 'get',
      showMessage: false,
      params: {
        query: `max(app_requestclient{service_id="${body.serviceId}"})`
      },
      showLoading: false
    }
  );
}

export function getServiceMonitor(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/service_monitor`,
    {
      method: 'get',
      params: body
    }
  );
}

export async function postServiceMonitor(params) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${params.team_name}/apps/${params.app_alias}/service_monitor`,
    {
      method: 'post',
      data: params
    }
  );
}

export async function deleteServiceMonitor(params) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${params.team_name}/apps/${params.app_alias}/service_monitor/${params.name}`,
    {
      method: 'delete'
    }
  );
}
export async function updateServiceMonitor(body) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/service_monitor/${body.name}`,
    {
      method: 'put',
      data: body
    }
  );
}
export async function sortMonitorFigure(body) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/exchange-graphs`,
    {
      method: 'put',
      data: body
    }
  );
}
export function getServiceMonitorFigure(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs`,
    {
      method: 'get'
    }
  );
}
export function getComponentMetrics(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.service_alias}/metrics`,
    {
      method: 'get'
    }
  );
}
export async function addKeyImport(params) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${params.team_name}/apps/${params.app_alias}/internal-graphs`,
    {
      method: 'post',
      data: { graph_name: params.graph_name }
    }
  );
}
export function getKeyImport(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/internal-graphs`,
    {
      method: 'get'
    }
  );
}
export function getServiceMonitorFigureInfo(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs/${body.graph_id}`,
    {
      method: 'get'
    }
  );
}
export function addServiceMonitorFigure(body = {}) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs`,
    {
      method: 'post',
      data: body
    }
  );
}
export async function updataServiceMonitorFigure(body) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs/${body.graph_id}`,
    {
      method: 'put',
      data: body
    }
  );
}

export async function deleteServiceMonitorFigure(body) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs/${body.graph_id}`,
    {
      method: 'delete'
    }
  );
}

export async function batchDeleteServiceMonitorFigure(body) {
  return request(
    `${apiconfig.baseUrl}/console/teams/${body.team_name}/apps/${body.app_alias}/graphs`,
    {
      method: 'delete',
      data: body
    }
  );
}

//获取cpu使用量
export async function getCpuUsage(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/cpu/usage`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取内存使用量
export async function getMemoryUsage(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/mem/usage`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取网络接受流量
export async function getNetworkReceived(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/network/received`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取网络发送流量
export async function getNetworkSend(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/network/sent`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取磁盘读
export async function getDiskRead(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/disk/read`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取磁盘写
export async function getDiskWrite(body) {
  return request(
    `${apiconfig.baseUrl}/console/wt-proxy/obs/v1/monitor/component/metrics/disk/write`,
    {
      method: 'post',
      data: body
    }
  );
}

//获取总览数据
export async function getOverviewList(body) {
  const { teamName, serviceAlias, pods } = body;
  console.log(pods, 'pods');
  return request(
    `${
      apiconfig.baseUrl
    }/console/obs/teams/${teamName}/apps/${serviceAlias}/pods${
      pods !== 'all' ? `?pod_name=${pods}` : ''
    }`,
    {
      method: 'get',
      data: body
    }
  );
}
