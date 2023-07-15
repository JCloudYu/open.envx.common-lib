function ToLocalISOString(show_milli?:boolean):string;
function ToLocalISOString(ref_date:Date|string|number, show_milli?:boolean):string;
function ToLocalISOString(this:Date, show_milli?:boolean):string;
function ToLocalISOString(this:Date, ref_date?:Date|string|number|boolean, show_milli:boolean=false):string {
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
