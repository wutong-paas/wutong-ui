import Config from './config.json';
/*
const BASE_URL = document.querySelector('body').getAttribute('base_url');
const OPERATION_URL = document.querySelector('body').getAttribute('operation_url');
const LOG_URL = document.querySelector('body').getAttribute('log_url');
const UPLOAD_URL = document.querySelector('body').getAttribute('upload_url');
*/
const baseUrl = ''; //Config.BASE_URL;
const imageUploadUrl = `${baseUrl}/console/files/upload`;
const operationUrl = Config.OPERATION_URL;
const logUrl = Config.LOG_URL;

const config = {
  baseUrl,
  logUrl,
  operationUrl,
  imageUploadUrl
};
export default config;
