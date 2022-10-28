import apiconfig from '../../config/api.config';
import request from '../utils/request';

//获取团队列表
export async function getTeamListAPI() {
  return request(`${apiconfig.baseUrl}/v1/teams`, {
    method: 'get'
  });
}

//获取标签列表
export async function getTagListAPI(body = {}) {
  const { start, end } = body;
  return request(`${apiconfig.baseUrl}/v1/log/labels`, {
    method: 'get',
    params: {
      start: `${start}000000`,
      end: `${end}000000`
    }
  });
}

//获取标签对应的key
export async function getValueOfTagListAPI(body = {}) {
  const { label_id, start, end } = body;
  return request(`${apiconfig.baseUrl}/v1/log/label/${label_id}/values`, {
    method: 'get',
    params: {
      start: `${start}000000`,
      end: `${end}000000`
    }
  });
}

// 获取日志数据
export async function getLogListAPI(body = {}) {
  const { expr, start, end } = body;
  return request(`${apiconfig.baseUrl}/v1/log/query`, {
    method: 'post',
    data: {
      expr,
      start: `${start}`,
      end: `${end}`
    }
  });
}

//获取调用链路列表接口
export async function getTraceListAPI(body = {}) {
  const { minDuration, start, end, limit, tags } = body;
  return request(`${apiconfig.baseUrl}/v1/traces`, {
    method: 'post',
    data: {
      minDuration,
      limit,
      tags,
      start: start.toString().slice(0, 10),
      end: end.toString().slice(0, 10)
    }
  });
}

//获取服务名称列表
export async function getServicesListAPI() {
  return request(`${apiconfig.baseUrl}/v1/trace/services`, {
    method: 'get'
  });
}

//获取链路节点名称列表
export async function getComponentListAPI() {
  return request(`${apiconfig.baseUrl}/v1/trace/spans`, {
    method: 'get'
  });
}

//获取链路详情接口
export async function getTraceDetailAPI(body = {}) {
  const { id, start, end } = body;
  return request(`${apiconfig.baseUrl}/v1/trace/${id}`, {
    method: 'get',
    params: {
      start,
      end
    }
  });
}

//获取标签和值合集
export async function getTagAndValueList(body = {}) {
  const { start, end, match } = body;
  return request(`${apiconfig.baseUrl}/v1/log/label/series`, {
    method: 'get',
    params: {
      start: `${start}000000`,
      end: `${end}000000`,
      match
    }
  });
}

// 获取日志提取模板
export async function getLogRuleTemplateAPI(body = {}) {
  const { namespace } = body;
  return request(`${apiconfig.baseUrl}/v1/log/config/template`, {
    method: 'get',
    params: {
      namespace
    }
  });
}

// 获取日志提取配置
export async function getLogRuleConfigAPI(body = {}) {
  const { namespace } = body;
  return request(`${apiconfig.baseUrl}/v1/log/config`, {
    method: 'get',
    params: {
      namespace
    }
  });
}

// 创建日志配置
export async function createLogConfigAPI(body = {}) {
  return request(`${apiconfig.baseUrl}/v1/log/config`, {
    method: 'post',
    data: body
  });
}


// 更新日志配置
export async function updateLogConfigAPI(body = {}) {
  return request(`${apiconfig.baseUrl}/v1/log/config`, {
    method: 'put',
    data: body
  });
}
