CREATE TABLE `ntfs_data` (
  `file_id` varchar(64) COLLATE utf8_bin NOT NULL,
  `content` mediumblob NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

ALTER TABLE `ntfs_data`
  ADD KEY `file_id` (`file_id`);