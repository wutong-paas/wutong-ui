import apiconfig from '../../config/api.config'
import request from '../utils/request'

export async function getComponentLogkeys(params){
   return request(
       `${apiconfig.logUrl}/log/indices/field`,
       {
           method: 'get',
           params: params
       }
   )
}

export async function getLogValueBykey(param){
    return request(
        `${apiconfig.logUrl}/log/indices/values/field`,
        {
            method:'post',
            data:{...param}
        }
    )
}

export async function getLogList(param){
   return request(
       `${apiconfig.logUrl}/log/search/condition`,
       {
           method:'post',
           data:{...param}
       }
   )
}

export async function getLogChartMatrix(param){
    return request(
        `${apiconfig.logUrl}/log/search/histogram/time`,
        {
            method:'post',
            data:{...param}
        }
    )
}

export async function getLocalLogList(param){
    return request(
        `${apiconfig.localApiUrl}/component/log/list`,
        {
            method:'get',
            data:{...param}
        }
    )
}