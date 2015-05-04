
#### CLA DATABASE

CREATE DATABASE comp_sec_cla;
use comp_sec_cla;

CREATE TABLE People(
	pid INT NOT NULL AUTO_INCREMENT,
	firstname CHAR(100) NOT NULL, # NULL username indicates a deleted user
	lastname CHAR(100) NOT NULL, # NULL username indicates a deleted user
	dob CHAR(10) NOT NULL,
	ssn CHAR(10) NOT NULL,
	eligible BOOLEAN DEFAULT false NOT NULL,
	PRIMARY KEY (pid)
) ENGINE = INNODB;

CREATE TABLE VotingIntent (
	pid INT NOT NULL,
	validationid CHAR(88) NOT NULL, #512 bit base64 encoded string
	PRIMARY KEY (pid)
) ENGINE = INNODB;

ALTER TABLE VotingIntent ADD FOREIGN KEY (pid) REFERENCES People (pid) ON DELETE CASCADE;

#### CTF DATABASE

CREATE DATABASE comp_sec_ctf;
use comp_sec_ctf;

CREATE TABLE Votes (
	validationid CHAR(88) NOT NULL UNIQUE, #512 bit base64 encoded string
	randomid CHAR(88) NOT NULL UNIQUE, #512 bit base64 encoded string
	vote BOOLEAN DEFAULT false NOT NULL,
	PRIMARY KEY (validationid, randomid)
) ENGINE = INNODB;