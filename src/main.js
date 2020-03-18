import Daypicker from './Daypicker.svelte';

let app;
window.show = false;

var op = {
	updateAvl: () => {},
}

function calendarSvelte(props, target= null){
	props['target'] = target;
	props.op = op;
	app = new Daypicker({
		target,
		props
	});

	return {
		updateAvl: op.updateAvl
	};
}

if (typeof window !== "undefined") {
	window.calendarSvelte = calendarSvelte;
}
// exports.default = calendarSvelte;
// module.exports = {
// 	calendarSvelte
// };