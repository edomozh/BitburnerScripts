/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args.includes('clean')) cleanServers(ns)
	if (ns.args.includes('root')) rootServers(ns)
	if (ns.args.includes('infect')) await infect(ns, 'v.js')
	if (ns.args.includes('backdoor')) await backdoor(ns)
	if (ns.args.includes('buyall')) buyPrograms(ns)
}

export function moneyToString(num) {
	const lookup = [
		{ v: 1, s: '' },
		{ v: 1e3, s: 'k' }, { v: 1e6, s: 'm' }, { v: 1e9, s: 'g' },
		{ v: 1e12, s: 't' }, { v: 1e15, s: 'p' }, { v: 1e18, s: 'e' }
	]
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
	var item = lookup.slice().reverse().find(i => num >= i.v)
	return item ? (num / item.v).toFixed().replace(rx, '$1') + item.s : '0'
}

/** @param {NS} ns */
export async function backdoor(ns) {
	let server = ns.args[1]

	if (!server) return

	let ways = getServers(ns)

	let way = ways.find(o => o.hostname == server)

	if (!way) return

	ns.tprint(`INFO\n${way.path.join('  ')}`)

	for (let s of way.path)
		ns.singularity.connect(s)

	await ns.singularity.installBackdoor(way.path.pop())

	ns.singularity.connect('home')
}

/**
 * @param {NS} ns
 * @return {Array} 
*/
export function getServerNames(ns) {
	let servers = getServers(ns)
		.map(s => s.hostname)
	return servers
}

/** @param {NS} ns **/
export function cleanServers(ns) {
	function clear(server) {
		var ls = Array.from(ns.ls(server))
		ls.forEach((v) => ns.rm(v, server))
	}

	var servers = getServerNames(ns)
		.filter(s => s != 'home')
		.filter(ns.hasRootAccess)

	servers.forEach(ns.killall)
	servers.forEach(clear)
}

/** 
 * @param {NS} ns
 * @return {Array} 
 **/
export function getServers(ns) {
	let result = []

	fill('home', null, new Array())

	return result

	function fill(curr, prev, path) {
		let innerpath = Array.from(path)
		innerpath.push(curr)

		let server = ns.getServer(curr)
		server.path = innerpath

		if (!result.some(s => s.hostname == curr))
			result.push(server)

		let servers = ns.scan(curr)
			.filter(s => s != prev)

		for (let s of servers)
			fill(s, curr, innerpath)
	}
}

/** 
 * @param {NS} ns 
 **/
export function rootServers(ns) {

	let servers = getServerNames(ns)
	servers.forEach(root)

	function root(s) {
		let oports = 0

		if (ns.getServerRequiredHackingLevel(s) > ns.getHackingLevel()) return

		if (ns.fileExists('BruteSSH.exe')) {
			ns.brutessh(s)
			oports++
		}

		if (ns.fileExists('HTTPWorm.exe')) {
			ns.httpworm(s)
			oports++
		}

		if (ns.fileExists('FTPCrack.exe')) {
			ns.ftpcrack(s)
			oports++
		}

		if (ns.fileExists('SQLInject.exe')) {
			ns.sqlinject(s)
			oports++
		}

		if (ns.fileExists('relaySMTP.exe')) {
			ns.relaysmtp(s)
			oports++
		}

		if (ns.getServerNumPortsRequired(s) <= oports)
			ns.nuke(s)

	}
}

/** @param {NS} ns **/
export async function infect(ns, file) {
	let servers = getServerNames(ns)
		.filter(ns.hasRootAccess)
		.filter(s => s != 'home')

	for (let server of servers)
		await ns.scp(file, server)
}

/** @param {NS} ns **/
export async function buyPrograms(ns) {
	ns.tail()

	let programs = ['ServerProfiler.exe', 'DeepscanV2.exe', 'HTTPWorm.exe',
		'SQLInject.exe', 'Formulas.exe', 'FTPCrack.exe', 'BruteSSH.exe',
		'relaySMTP.exe', 'DeepscanV1.exe', 'AutoLink.exe']

	ns.purchaseTor()

	for (const p of programs)
		ns.purchaseProgram(p)

}