var mysql = require("mysql");
var HashRing = require('hashring');
var config = require("../config");



var poolCluster = mysql.createPoolCluster();
var dbArray = [];
poolCluster.portHashRing = [];
Object.keys(config.db).forEach(function (dbIndex) {
    dbArray.push(dbIndex);
    var portArray = [];
    for (portIndex = 0; portIndex < config.db[dbIndex].portNum; portIndex++) {
        portArray.push(portIndex);
        var portConfig = config.db[dbIndex];
        portConfig.port = portConfig.startPort+portIndex;
        poolCluster.add(dbIndex+"_"+portIndex,portConfig);
    }
    poolCluster.portHashRing[dbIndex] = new HashRing(portArray);
});
poolCluster.dbHashRing = new HashRing(dbArray);
module.exports = poolCluster;
