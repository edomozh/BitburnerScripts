/** @param {NS} ns */
export async function main(ns) {
	let server = ns.args[0];
	let command = ns.args[1];

	switch (command) {
		case "weaken": await ns.weaken(server); break;
		case "grow": await ns.grow(server); break;
		case "hack": await ns.hack(server); break;
	}

	ns.writePort(1, server);
}