import { settings } from 'settings.js'

export function getDate() {
	return `${new Date().getDate()} ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getHours()}h ${new Date().getMinutes()}m`
}

/** @param {NS} ns **/
export async function main(ns) {
	if (ns.args.includes('clean')) cleanServers(ns)
	if (ns.args.includes('root')) rootServers(ns)
	if (ns.args.includes('infect')) await infect(ns, settings().hackfile)
	if (ns.args.includes('backdoor')) await backdoor(ns)
	if (ns.args.includes('buyall')) buyPrograms(ns)
}

export function log(ns, l, msg) {
	switch (l) {
		case 'e': if (settings().log.error) ns.print(`ERROR ${msg}`); break
		case 'd': if (settings().log.debug) ns.print(`ERROR ${msg}`); break
		case 'w': if (settings().log.warning) ns.print(`WARNING ${msg}`); break
		case 'i': if (settings().log.info) ns.print(`INFO ${msg}`); break
		case 's': if (settings().log.success) ns.print(`SUCCESS ${msg}`); break
		default: if (settings().log.common) ns.print(`${msg}`); break
	}
}

export function stringify(obj) {
	let result = JSON.stringify(obj, null, 1)
		.toString()
		.replaceAll(/[{}\[\]:,\"]/g, '')
		.replaceAll(/^\s+$/gm, '')
		.replaceAll(/\n\n/g, `\n`)
		.replaceAll(/[0-9.][0-9.][0-9.][0-9.]+/g, numToString)

	return result
}

export function numToString(num) {
	if (!num) return num

	num = Number.parseInt(num)

	const lookup = [
		{ v: 1, s: '' },
		{ v: 1e3, s: 'k' },
		{ v: 1e6, s: 'm' },
		{ v: 1e9, s: 'b' },
		{ v: 1e12, s: 't' },
		{ v: 1e15, s: 'q' }
	]

	var item = lookup.reverse().find(i => Math.abs(num) >= i.v)
	return (num / item.v).toFixed(3) + item.s
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

	ns.clearLog()
	ns.tail()

	let settings = "settings.js"
	let core = "core.js"

	function clear(server) {
		var ls = Array.from(ns.ls(server))
		ls
			.filter(f => f != core && f != settings)
			.forEach(f => ns.rm(f, server))
	}

	function kill(server) {
		var scr = Array.from(ns.ps(server))
			.filter(s => s.filename != core)
			.map(s => s.pid)

		scr.forEach(f => ns.kill(f, server))
	}

	var servers = getServerNames(ns)
		.filter(ns.hasRootAccess)

	servers.forEach(kill)
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
	ns.clearLog()
	ns.tail()

	let programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe',
		'ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe', 'Formulas.exe']

	ns.singularity.purchaseTor()

	for (const p of programs)
		ns.singularity.purchaseProgram(p)
}

export function getCompanyServer(symbol) {
	var symbolMap = [
		["AERO", "AeroCorp", "aerocorp"],
		["APHE", "Alpha Enterprises", "alpha-ent"],
		["BLD", "Blade Industries", "blade"],
		["CLRK", "Clarke Incorporated", "clarkinc"],
		["CTK", "CompuTek", "comptek"],
		["CTYS", "Catalyst Ventures", "catalyst"],
		["DCOMM", "DefComm", "defcomm"],
		["ECP", "ECorp", "ecorp"],
		["FLCM", "Fulcrum Technologies", "fulcrumassets"],
		["FNS", "FoodNStuff", "foodnstuff"],
		["FSIG", "Four Sigma", "4sigma"],
		["GPH", "Global Pharmaceuticals", "global-pharm"],
		["HLS", "Helios Labs", "helios"],
		["ICRS", "Icarus Microsystems", "icarus"],
		["JGN", "Joe's Guns", "joesguns"],
		["KGI", "KuaiGong International", "kuai-gong"],
		["LXO", "LexoCorp", "lexo-corp"],
		["MDYN", "Microdyne Technologies", "microdyne"],
		["MGCP", "MegaCorp", "megacorp"],
		["NTLK", "NetLink Technologies", "netlink"],
		["NVMD", "Nova Medical", "nova-med"],
		["OMGA", "Omega Software", "omega-net"],
		["OMN", "Omnia Cybersystems", "omnia"],
		["OMTK", "OmniTek Incorporated", "omnitek"],
		["RHOC", "Rho Contruction", "rho-construction"],
		["SGC", "Sigma Cosmetics", "sigma-cosmetics"],
		["SLRS", "Solaris Space Systems", "solaris"],
		["STM", "Storm Technologies", "stormtech"],
		["SYSC", "SysCore Securities", "syscore"],
		["TITN", "Titan Laboratories", "titan-labs"],
		["UNV", "Universal Energy", "univ-energy"],
		["VITA", "VitaLife", "vitalife"],
		["WDS", "Watchdog Security", ""]
	]

	return symbolMap.filter(m => m[0] == symbol)[0][2]
}

export function msToSec(s) {
	let t = s
	t = Math.trunc(t)
	var ms = t % 1000

	t = (t - ms) / 1000

	var secs = t % 60

	t = (t - secs) / 60
	var mins = t % 60

	t = (t - mins) / 60
	var hours = t % 60

	return `t (${hours}:${mins}:${secs})`
}
