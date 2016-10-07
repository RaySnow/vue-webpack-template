/**
 * Created by hupo on 16/10/6.
 *
 */
//请求基础地址 grunt打包时会根据环境替换  api.l.whereask.com
var API_BASE_URL = "http://api.l.whereask.com";
var SHARE_BASE_URL = "http://api.l.whereask.com";
var IMAGE_BASE_URL = 'http://ifiletest.2dfire.com/';

//grunt打包时的环境参数
var grunt_env = "grunt_env_daily";
if (grunt_env == 'grunt_env_pre') {
    //预发地址
    SHARE_BASE_URL = 'http://live-pre.zm1717.com';
    API_BASE_URL = 'http://meal.2dfire-pre.com';
    IMAGE_BASE_URL = '//ifile.2dfire.com/';
} else if (grunt_env == 'grunt_env_release') {
    //发布地址
    SHARE_BASE_URL = 'http://live.zm1717.com';
    API_BASE_URL = 'https://meal.2dfire.com';
    IMAGE_BASE_URL = '//ifile.2dfire.com/';
}

exports.API_BASE_URL = {
    API_BASE_URL: API_BASE_URL,
    SHARE_BASE_URL: SHARE_BASE_URL,
    IMAGE_BASE_URL: IMAGE_BASE_URL
};
