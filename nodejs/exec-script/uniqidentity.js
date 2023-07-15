#!/usr/bin/env node
const fs = require('fs');
const os = require('os');


if ( os.platform().substring(0,3) === 'win' ) {
	console.error("This script doens't support windows environment!");
	process.exit(1);
}

if ( process.geteuid() !== 0 ) {
	console.error("This script must be run by root user!");
	process.exit(1);
}



const PROFILE_SCRIPT = "/etc/uniqidenty";
let stat = null;
try {
	stat = fs.statSync(PROFILE_SCRIPT);
	if ( !stat.isFile() ) {
		console.error(`${PROFILE_SCRIPT} is a directory!`);
		process.exit(1);
	}

	acc = fs.accessSync(PROFILE_SCRIPT, fs.constants.R_OK);
	if ( !acc ) {
		console.error(`${PROFILE_SCRIPT} is not readable by current user!`);
		process.exit(1);
	}
	
	
	const content = fs.readFileSync(PROFILE_SCRIPT).toString('utf8');
	const [mid] = content.split(',');
	console.log(`Uniqidentity: ${mid}`);
	process.exit(0);
}
catch(e) {
	if ( e.code !== 'ENOENT' ) {
		console.error("Unexpected error when fetching file state!", e.message);
		process.exit(1);
	}
}



const uuid = UUIDv4();
const now = Math.floor(Date.now()/1000);
fs.writeFileSync(PROFILE_SCRIPT, `${uuid},${now}\n`, {mode:0o444});



function UUIDv4() {
	const bytes = require('crypto').randomBytes(16);

	// 把 version 4 的 bits 寫到第 7 個 byte 的 4 個 MSB 上
	bytes[6] = (bytes[6] & 0x0f) | 0x40;

	// 把 variant 1 的 bits 寫到第 9 個 byte的 2 個 MSB 上
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	// 把 bytes 轉換成 UUIDv4 的字串表示法
	const hexString = bytes.toString('hex');
	return [
		hexString.slice(0, 8),
		hexString.slice(8, 12),
		hexString.slice(12, 16),
		hexString.slice(16, 20),
		hexString.slice(20)
	].join('-');
}
