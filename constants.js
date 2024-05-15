// 全局常量

// 接口地址
// H5端
// #ifdef H5
export const BASE_URL = process.env.NODE_ENV === 'development' ? '/proxy' : '请求地址';
// #endif
// 除了H5端
// #ifndef H5
export const BASE_URL = '请求地址';
// #endif

// 上传文件地址
export const BASE_UPLOAD_URL = '';
