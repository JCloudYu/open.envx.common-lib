import crypto from "node:crypto";
const SESSION_ID = crypto.randomBytes(10);
let SEQ:number = 0;


type CodedError = Error & {code?:string;}
interface LogStreamMetaInfo {
	time_milli:boolean; tags:string[]
};
interface LogInfoType {
	t: string;
	l:'debg'|'info'|'warn'|'eror'|'fatl';
	b: number;
	p: {
		tags:string[], ctnt:any|CodedError
	}
}
interface LogWriter {(msg:LogInfoType):void};


const JSONWriter = (d:any)=>console.log(JSON.stringify(d));
const ConsoleWriter = (d:any)=>console.log(`[${d.log_time}][${d.l}]${d.tags.map((i:string)=>`[${i}]`).join('')}`, d.p.ctnt);
const LoggerRuntime:{writer:LogWriter} = { writer:ConsoleWriter };
const LogStreamMeta:WeakMap<LogStream, LogStreamMetaInfo> = new WeakMap();
class LogStream {
	constructor() {
		LogStreamMeta.set(this, {
			time_milli:false,
			tags: []
		});
	}

	get time_milli() { return LogStreamMeta.get(this)!.time_milli; }
	set time_milli(show_milli) { LogStreamMeta.get(this)!.time_milli = !!show_milli; }
	get tags() { return LogStreamMeta.get(this)!.tags; }

	clone() {
		const new_stream = new LogStream();
		Object.assign(LogStreamMeta.get(new_stream)!, CloneMeta(LogStreamMeta.get(this)!));
		return new_stream;
	}
	debug(...contents:any[]) {
		const curr_meta = LogStreamMeta.get(this)!;
		const log_time = ToLocalISOString(curr_meta.time_milli);
		const batch = fnv1a32(Buffer.concat([SESSION_ID, Buffer.from(log_time), Buffer.from((new Uint32Array([SEQ = (SEQ+1)%0xFFFFFFFF])).buffer)]));
		for(const content of contents) {
			Log({t:log_time, l:'debg', b:batch, p:{tags:curr_meta.tags, ctnt:content}});
		}
	}
	info(...contents:any[]) {
		const curr_meta = LogStreamMeta.get(this)!;
		const log_time = ToLocalISOString(curr_meta.time_milli);
		const batch = fnv1a32(Buffer.concat([SESSION_ID, Buffer.from(log_time), Buffer.from((new Uint32Array([SEQ = (SEQ+1)%0xFFFFFFFF])).buffer)]));
		for(const content of contents) {
			Log({t:log_time, l:'info', b:batch, p:{tags:curr_meta.tags, ctnt:content}});
		}
	}
	warn(...contents:any[]) {
		const curr_meta = LogStreamMeta.get(this)!;
		const log_time = ToLocalISOString(curr_meta.time_milli);
		const batch = fnv1a32(Buffer.concat([SESSION_ID, Buffer.from(log_time), Buffer.from((new Uint32Array([SEQ = (SEQ+1)%0xFFFFFFFF])).buffer)]));
		for(const content of contents) {
			Log({t:log_time, l:'warn', b:batch, p:{tags:curr_meta.tags, ctnt:content}});
		}
	}
	error(...contents:any[]) {
		const curr_meta = LogStreamMeta.get(this)!;
		const log_time = ToLocalISOString(curr_meta.time_milli);
		const batch = fnv1a32(Buffer.concat([SESSION_ID, Buffer.from(log_time), Buffer.from((new Uint32Array([SEQ = (SEQ+1)%0xFFFFFFFF])).buffer)]));
		for(const content of contents) {
			Log({t:log_time, l:'eror', b:batch, p:{tags:curr_meta.tags, ctnt:content}});
		}
	}
	fatal(...contents:any[]) {
		const curr_meta = LogStreamMeta.get(this)!;
		const log_time = ToLocalISOString(curr_meta.time_milli);
		const batch = fnv1a32(Buffer.concat([SESSION_ID, Buffer.from(log_time), Buffer.from((new Uint32Array([SEQ = (SEQ+1)%0xFFFFFFFF])).buffer)]));
		for(const content of contents) {
			Log({t:log_time, l:'fatl', b:batch, p:{tags:curr_meta.tags, ctnt:content}});
		}
	}
}

function CloneMeta(meta:LogStreamMetaInfo):LogStreamMetaInfo {
	const {tags, ...new_meta} = meta;
	return Object.assign(new_meta, {tags:tags.slice(0)});
}

function Log(payload:LogInfoType) {
	if ( payload.p.ctnt instanceof Error ) {
		const error_info = payload.p.ctnt as CodedError;
		payload.p.ctnt = Object.assign({
			type: 'error', subtype:error_info.name,
			code: error_info.code,
			message: error_info.message,
			stack: error_info.stack!.split("\n").map((i)=>i.trim())
		}, error_info);
	}

	switch(payload.l) {
		case "debg":
		case "info":
		case "warn":
		case "eror":
		case "fatl":
			LoggerRuntime.writer(payload);
			break;
		default:
			throw new SyntaxError("Given log's level is invalid!");
	}
}

export const LogTool = Object.defineProperties(new LogStream(), {
	__writer:{
		configurable:true, enumerable:true,
		set:(writer:LogWriter|string)=>{
			if ( typeof writer === 'string' ) {
				if ( writer === 'json' ) {
					LoggerRuntime.writer = JSONWriter;
				}
				else {
					LoggerRuntime.writer = ConsoleWriter;
				}
			}


			if ( typeof writer !== "function" ) {
				throw new TypeError("__writer accepts only functions");
			}

			LoggerRuntime.writer = writer;
		},
		get:()=>LoggerRuntime.writer
	}
}) as LogStream&{__writer:LogWriter};



function ToLocalISOString(show_milli?:boolean):string;
function ToLocalISOString(ref_date:Date|string|number, show_milli?:boolean):string;
function ToLocalISOString(this:Date, ref_date?:Date|string|number, show_milli?:boolean):string;
function ToLocalISOString(this:Date, ref_date?:Date|string|number|boolean, show_milli?:boolean):string {
	if ( this instanceof Date ) ref_date = this;
	if ( typeof ref_date === "string" || typeof ref_date === "number" ) {
		ref_date = new Date(ref_date);
	}
	else 
	if ( !(ref_date instanceof Date) ) {
		ref_date = new Date();
	}

	if ( Number.isNaN(ref_date.getTime()) ) {
		throw new RangeError("Invalid time value");
	}
	
	
	
	let offset = 'Z';

	const zone = ref_date.getTimezoneOffset();
	if (zone !== 0) {
		const abs_zone	= Math.abs(zone);
		const zone_hour = Math.floor(abs_zone / 60);
		const zone_min	= abs_zone % 60;
		offset = (zone > 0 ? '-' : '+') + (zone_hour.toString().padStart(2, '0')) + (zone_min.toString().padStart(2, '0'));
	}
	
	const milli = show_milli ? ('.' + (ref_date.getMilliseconds() % 1000).toString().padStart(3, '0')) : '';
	return ref_date.getFullYear() +
		'-' + (ref_date.getMonth() + 1).toString().padStart(2, '0') +
		'-' + (ref_date.getDate()).toString().padStart(2, '0') +
		'T' + (ref_date.getHours()).toString().padStart(2, '0') +
		':' + (ref_date.getMinutes()).toString().padStart(2, '0') +
		':' + (ref_date.getSeconds()).toString().padStart(2, '0') +
		milli + offset;
}



const FNV_PRIME_HIGH = 0x0100, FNV_PRIME_LOW = 0x0193;	// 16777619 0x01000193
const OFFSET_BASIS = new Uint8Array([0xC5, 0x9D, 0x1C, 0x81]);	// 2166136261 [0x81, 0x1C, 0x9D, 0xC5]
function fnv1a32(octets:Uint8Array) {
	const U8RESULT		= OFFSET_BASIS.slice(0);
	const U32RESULT		= new Uint32Array(U8RESULT.buffer);
	const RESULT_PROC	= new Uint16Array(U8RESULT.buffer);
	for( let i = 0; i < octets.length; i += 1 ) {
		U32RESULT[0] = U32RESULT[0] ^ octets[i];
		
		let hash_low = RESULT_PROC[0], hash_high = RESULT_PROC[1];
		
		RESULT_PROC[0] = hash_low * FNV_PRIME_LOW;
		RESULT_PROC[1] = hash_low * FNV_PRIME_HIGH + hash_high * FNV_PRIME_LOW + (RESULT_PROC[0]>>>16);
	}
	return U32RESULT[0];
}