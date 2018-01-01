var express = require('express');

var apiv1 = express.Router();
var getFile = require('../models/getFile');
var putFile = require('../models/putFile');
var delFile = require('../models/delFile');

//read  config
var config = require("../config");

apiv1.use(
  function(req, res, next) {
    //set header
    res.setHeader('X-Powered-By', config.general.x_powered_by);


    //todo:log something?
    next();
  });

apiv1.get("*", getFile);
apiv1.put("*", putFile);
apiv1.delete("*", delFile);
module.exports = apiv1;
