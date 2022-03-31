const BASE_URL = document.querySelector('body').getAttribute('base_url');
const OPERATION_URL = document.querySelector('body').getAttribute('operation_url');
const LOG_URL = document.querySelector('body').getAttribute('log_url');
const UPLOAD_URL = document.querySelector('body').getAttribute('upload_url');

const config = {
  baseUrl: BASE_URL || '',
  logUrl: LOG_URL || 'http://121.37.19.86:10014',
  oprationUrl: OPERATION_URL || 'http://121.37.19.86:10001',
  imageUploadUrl: UPLOAD_URL || '/console/files/upload'
};
export default config;
