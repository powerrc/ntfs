var url = require("url");
var path = require("path");
var Readable = require('stream').Readable;
var config = require("../config");
var event = require("events");
var crypto = require('crypto');

var dbPool = require('./dbPool');
var tableName = config.general.table_name;

module.exports = function(req, res) {
	var fileName = path.basename(url.parse(req.originalUrl).pathname);
		fileName = crypto.createHash('md5').update(fileName).digest('hex'); 
	function saveFile(fName, FileContent) {
		var emitter = new event.EventEmitter();
		var successResult = [];
		var failResult = [];
		
		var query = "INSERT INTO " + tableName + " SET ?",
			values = {
				file_id: fName,
				content: FileContent.toString("base64")
			};
			
	//	console.log("Query Size :" + values.content.length);
		//register the event fail
		emitter.on("threadDone", function(data) {
			if (successResult.length + failResult.length >= config.general.write_replica) {
			//	console.log(successResult.length + failResult.length + "<===\n");
				if (successResult.length == 0) {
					res.status(503).send(failResult.join(";") + "\n"); //mysql service not available

				} else if (failResult.length == 0) {
					res.status(201).send('file is saved.\n');

				} else {
					res.status(206).send('file is saved on some servers only.\n');
				}
			}
		});

		dbPool.dbHashRing.range(fileName, config.general.write_replica).forEach(
			function(dbIndex) {
                           dbPool.portHashRing[dbIndex].range(fileName,1).forEach( function(portIndex){
				dbPool.getConnection(dbIndex+"_"+portIndex, function(err, db) {
					if (err) {
						console.log(err);
						failResult.push(err);
						emitter.emit("threadDone");
						return false;
					} else {
						db.query(query, values, function(err, rows) {
							db.release();
					if (err) {
								failResult.push(err);
								emitter.emit("threadDone");
								return false;
							} else {
								if (rows.length < 1) {
									failResult.push("table not found.");
									emitter.emit("threadDone");
									return false;

								} else {
									req.rawBody = null;
									successResult.push("file is saved");
									emitter.emit("threadDone");
									return true;
								}
							}
						});


					}


				});
                            });
			});
	}

	return saveFile(fileName, req.rawBody);
};
