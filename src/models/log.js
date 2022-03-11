import {getComponentLogkeys,getLogValueBykey,getLogList,getLogChartMatrix,getLocalLogList} from '../services/log'

export default{
    namespace:'clog',
    state:{},
    effects:{
        *getComponentLogkeys({payload,callback},{call}){
            console.log("*getComponentLogkeys")
            console.log(payload);
            console.log('123');
            const response=yield call(getComponentLogkeys,payload); 
            if(response&&callback){
                callback(response);
            }
        },
        *getLogValueBykey({payload,callback},{call}){
            const response=yield call(getLogValueBykey,payload);
            if(response&&callback){
                callback(response);
            }
        },
        *getLogList({payload,callback},{call}){
            const response=yield call(getLogList,payload)
            if(response&&callback){
                callback(response)
            }
        },
        *getLogChartMatrix({payload,callback},{call}){
            const response=yield call(getLogChartMatrix,payload)
            if(response&&callback){
                callback(response)
            }
        },
        *getLocalLogList({payload,callback},{call}){
            const response=yield call(getLocalLogList,payload);
            if(response&&callback){
                callback(response);
            }
        }
    }
}