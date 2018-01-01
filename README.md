# NTFS
NodeJS Tiny File System

# What is it?
Basically , this is a simple solution to solve problem of handling LOSF (lots of small files).

To know more about LOSF , please check with this publication by Facebook(https://www.usenix.net/legacy/events/osdi10/tech/full_papers/Beaver.pdf)

I am facing similar problem a while ago, which I have many files that file sizes are less than 100KB , about million per day. I tried HDFS , Openstack Swift  , they all are not working very well due to problem of lacking memory when caching inode.

That's why you can see this project here.

The storage backend is Mysql , and the frontend is writtern in NodeJS (with express v4.2 framework) as a midddleware more likely.

# How to Install
1.Download the release pack or git clone to a folder
2.Open the folder run "npm install"
3.Install pm2 , run "npm install -g pm2"
4.Setup databases with the db example "db.sql" , and put in parameters in "config.js"
5.Open the cloned folder / exacted folder , run "pm2 start bin/www --name 'ntfs'"

# How to use
Using RESTful style request to create/delete/get files

1.To put a file
curl -X PUT http://127.0.0.1:3000/sample.file --data-binary @"/yourfilepath"

2.To delete a file
curl -X DELETE http://127.0.0.1:3000/sample.file

3.To get a file
curl -X GET http://127.0.0.1:3000/sample.file -o "/filepathyourwant"

# Data Reliability
Since we are using mysql as storage backend ,  data reliability is provided by the database servers you built , master-slave cluster is ok , using traditional raid disk is ok too.

And you could set data replica in the config file , by default it's 2.

# Limitations
1.The storage engine of mysql I chose is MYISAM , and due to the locking table policy of this engine ,performance of writing/deleting at the same time will be extremely poor , only to delete file during  writing idle time is recommanded.

2.Because of binary coding algorithm for mysql (using base64 to encode/decode) , transmitting a 100KBytes file will use up 1064KBits bandwidth when replica is set to 1 , and about 2128Kbites when replica is set to 2.

3.File size should be limited to less than 1MB or you will face some other performance issues.

4.File name is limited to the field length of mysql table.(in my db example , I limit it to 64 varchar)

# Benchmark
TODO

