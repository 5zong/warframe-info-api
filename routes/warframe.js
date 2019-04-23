var express = require('express');
var request = require('request');
var superagent = require('superagent');
require('superagent-proxy')(superagent);
var router = express.Router();
var wfaLibs = require('../utils/wfaLibs');
var utils = require('../utils/utils');
var warframeUtil = require('../utils/warframe');
var tran = require('../utils/translate');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 *  wfa 信息相关接口
 *  ps：wfa是指http://wfa.richasy.cn
 */

//获取字典接口
router.all('/libs', function(req, res) {
  //获取 wfa Token
  wfaLibs.initToken(function (body) {
    //获取拿到Token后请求 wfa lib字典
    wfaLibs.initLibs(function (libResult) {
      //将回调返回的结果输出
      res.send(libResult);
    })
  },function () {
    //error
    res.json({error:"网络不畅",message:"获取wfa Token失败！"});
  });
});

//单独获取 Token
router.all('/token',function (req,res) {
  wfaLibs.initToken(function (body) {
    res.json({token:body});
  },function () {
    res.json({error:"网络不畅",message:"获取wfa Token失败！"});
  });
});

/**
 * api信息接口
 * ps：来源：http://api.warframestat.us/
 */

//获取分类
router.all('/list',function (req,res) {
  wfApi(null,function (body) {
    var list = Object.keys(body);
    res.send(list);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/detail/:detail',function (req,res) {
  var bodyDetail = req.body.detail;
  var pathDetail = req.params.detail;
  var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
  wfApi(detail,function (body) {
    res.json(body);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/keys',function (req,res) {
  var mcache = wfaLibs.mcache;
  res.send(mcache.keys());
});

router.all('/test',function (req,res) {
  var test = req.body.str;
  res.send(tran.rewardString(test));
});

router.all('/time',function (req,res) {
  wfApi('events',function (body) {
    var time = utils.apiTimeUtil(body[0].expiry);
    res.json(time);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/dev/:type',function (req,res) {
  var type = req.params.type;
  console.log(type);
  wfApi(type,function (body) {
    var data = warframeUtil.getInfo(type,body);
    res.json(data);
  },function () {
    res.json({error:"网络不畅"});
  });
});

function wfApi(param,success,fail){
  var url = 'http://api.warframestat.us/pc'+(param?'/'+param:'');
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log("wfApi body",body);
      var data = JSON.parse(body);
      success(data);
    } else {
      fail();
    }
  });
}
module.exports = router;
