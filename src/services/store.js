/**
 * @content  云市场应用店铺请求文件
 * @author   Leon
 * @date     2022-06-21
 *
 */

import apiconfig from '../../config/api.config';
import request from '../utils/request';

// 获取商店列表
export async function fetchStoreListAPI(body = { enterprise_id }) {
  const { enterprise_id } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/cloud/wutong-markets`,
    {
      method: 'get'
    }
  );
}

// 创建应用店铺
export async function createApplicationStoreAPI(body) {
  const { enterprise_id, ...data } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/cloud/bind-markets`,
    {
      method: 'post',
      data
    }
  );
}

// 商店应用列表
export async function fetchStoreApplicationListAPI(body = { enterprise_id }) {
  const { enterprise_id, market_id, ...data } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/market-apps/${market_id}`,
    {
      method: 'post',
      data
    }
  );
}

// 商店应用详情
export async function fetchStoreApplicationDetail(body = { enterprise_id }) {
  const { enterprise_id, market_id, app_id } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/market/${market_id}/apps/${app_id}`,
    {
      method: 'get'
    }
  );
}

// 创建应用模板
export async function createApplicationTemplateAPI(body = { enterprise_id }) {
  const { enterprise_id, market_id, ...data } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/market/${market_id}/create_template`,
    {
      method: 'post',
      data
    }
  );
}

// 查询应用版本列表
export async function fetchApplicationVersionListAPI(body = { enterprise_id }) {
  const { enterprise_id, market_id, app_id } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/market/${market_id}/apps/${app_id}/versions`,
    {
      method: 'get'
    }
  );
}

// 安装应用商店
export async function installApplicationAPI(body = { enterprise_id }) {
  const { enterprise_id, market_id, ...data } = body;
  return request(
    `${apiconfig.baseUrl}/console/enterprise/${enterprise_id}/market-apps/${market_id}/install_cloud_app`,
    {
      method: 'post',
      data
    }
  );
}
