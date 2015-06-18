
function f(x) { return Math.cos(x)/2-x; }

var x1 = 1/4;
var x2 = 1/2;

for (var i=0; i<20; i++) {
	
	if ( f(x1)>0 && f(x2)<0 ) {
		x2 = x1 + (x2 - x1) / 2;
	} else {
		tmp = x2;
		x2 = x2 + (x2 - x1);
		x1 = tmp;
	}
	
	console.log(x1, '  ', x2);
	
}