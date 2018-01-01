var url = require("url");
var path = require("path");
var Readable = require('stream').Readable;
var config = require("../config");

module.exports = function(req, res) {
	var fileName = path.basename(url.parse(req.originalUrl).pathname);
	var dbPool = require('./dbPool');
	var tableName = config.general.table_name;
	var sql = 'SELECT content FROM ' + tableName +
		' where file_id = "' + fileName + '" limit 1';
	var fetchCount = 0;
	var dbIndexes = dbPool.dbHashRing.range(fileName, config.general.write_replica);


	function recurDbFetch(dbIndexArray) {
		fetchCount++;
		if (fetchCount <= config.general.write_replica) {
			
			var dbIndex = dbIndexArray.shift();
                        dbPool.portHashRing[dbIndex].range(fileName,1).forEach(function (portIndex){
			dbPool.getConnection(dbIndex+"_"+portIndex, function(err, db) {
				if (err) {
					//db connection error
					recurDbFetch(dbIndexArray);
				} else {
					db.query(sql, function(err, rows) {
						db.release();
						if (!err) {
							if (rows.length > 0) {
								
								var fileContent = new Readable();
								//because we translte binary to base64 when saving files
								var binaryContent = new Buffer(rows[0].content.toString(),'base64');
								fileContent._read = function noop() {};
								//fileContent.push(rows[0].content);
								fileContent.push(binaryContent);
								fileContent.push(null);
								fileContent.pipe(res);
								
								rows = binaryContent = null;
							} else {
								//record not found
								recurDbFetch(dbIndexArray);
							}
						} else {
							//table not found
							recurDbFetch(dbIndexArray);
						}
					});

					db.on('error', function(err) {
						recurDbFetch(dbIndexArray);
					});
				}

			});
                    });
		} else {
			res.status("404").send('File not found , max retry is reached.');
		}
	};
	return recurDbFetch(dbIndexes);

};
