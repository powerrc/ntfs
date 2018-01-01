var config = {
    general: {
        x_powered_by: "NTFS v1.0",
        write_replica: 2,
        table_name: "ntfs_data"
    },
    /*
     format for database config
     "database_index":{
     "host",
     "startPort",
     "portNum",
     "database",
     "username",
     "password",
     "charset",
     "connectionLimit",
     "weight":a number between 0 to 10 , 10 is the most
     }
     */
    db: {
        1: {
            host: "127.0.0.2",
            startPort: 4000,
            portNum:2,
            user: "ntfs",
            password: "123123",
            database: "ntfs",
            charset: "utf8_general_ci",
            connectionLimit: 10,
            restoreNodeTimeout: 3000,
            weight: 10
        },
        1: {
            host: "127.0.0.3",
            startPort: 4000,
            portNum:2,
            user: "ntfs",
            password: "123123",
            database: "ntfs",
            charset: "utf8_general_ci",
            connectionLimit: 10,
            restoreNodeTimeout: 3000,
            weight: 10
        },
        
    }
};

module.exports = config;
