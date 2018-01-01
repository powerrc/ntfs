var url = require("url");
var path = require("path");
var config = require("../config");
var event = require("events");


module.exports = function(req, res) {
	var emitter = new event.EventEmitter();
	var fileName = path.basename(url.parse(req.originalUrl).pathname); 
	var dbPool = require('./dbPool');
	var tableName = config.general.table_name;

	function delFile(fName) {

		var sql = 'delete  FROM ' + tableName + ' where file_id = ?';
		var successResult = [];
		var failResult = [];
		//register the event fail
		emitter.on("threadDone", function(data) {
			if (successResult.length + failResult.length >= config.general.write_replica) {
				if (successResult.length == 0) {
					res.status(504).send(failResult.join(";")); //mysql service not available
				} else if (failResult.length == 0) {
					res.status(200).send('file is deleted.');
				} else {
					res.status(206).send('file is deleted on some servers only.');
				}
				return;
			}
		});

		dbPool.dbHashRing.range(fileName, config.general.write_replica).forEach(
			function(dbIndex) {
                             dbPool.portHashRing[dbIndex].range(fileName,1).forEach(function (portIndex){
				dbPool.getConnection(dbIndex+"_"+portIndex, function(err, db) {
					if (err) {
						console.log(err);
						failResult.push(err);
						emitter.emit("threadDone");
					} else {

						db.query(sql,fileName, function(err, rows) {
							db.release();
							if (err) {
								failResult.push("db error:" + err);
							} else {
								if (rows.length < 1) {
									failResult.push("record not found.");
								} else {
									successResult.push("file is deleted.");
								}
							}
							emitter.emit("threadDone");
						});
						/*
												db.on('error', function(err) {
													console.log(err);
													failResult.push(err);
													res.app.emit("threadDone");
												});
						*/
					}
				});
                            })
			});
	}
	return delFile(fileName);
};
