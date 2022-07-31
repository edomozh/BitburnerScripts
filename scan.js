import { moneyToString } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	let onlyrootedflag = ns.args.includes('r')

	let root = getAllServersTree(ns)
	root = editinfo(root)

	if (ns.args[0] == 'server')
		root = ns.getServer(ns.args[1])

	let result = JSON.stringify(root, null, 1)
		.toString()
		.replaceAll(/[{}\[\]:,\"]/g, '')
		.replaceAll(/^\s+$/gm, '')
		.replaceAll(/\n\n/g, `\n`)

	ns.tprint(`INFO\n${result}\n`)

	function editinfo(node) {
		node.servers.forEach(n => editinfo(n))

		let servers = node.servers
		let info = [node.hostname]

		let moneypercent = Math.floor((node.moneyAvailable / node.moneyMax * 100)) + '%'

		if (ns.args.includes('money')) info.push(moneypercent)
		if (ns.args.includes('admin')) info.push(node.hasAdminRights)
		if (ns.args.includes('backdoor')) info.push(node.backdoorInstalled)
		if (ns.args.includes('level')) info.push(node.requiredHackingSkill)
		if (ns.args.includes('maxmoney')) info.push(moneyToString(node.moneyMax))

		if (ns.args.includes('available') && !node.hasAdminRights) info = []

		if (!ns.args.includes('fullinfo')) {
			Object.keys(node).forEach(n => delete node[n])
			node[info.join(' ')] = servers
		}

		return node
	}

	function getAllServersTree() {
		return fillServerInfo('home', null)

		function fillServerInfo(name, prev) {
			let server = ns.getServer(name)
			let servers = ns.scan(name)
				.filter(s => s != prev)
				.filter(s => !s.startsWith('home'))

			if (onlyrootedflag)
				servers = servers.filter(ns.hasRootAccess)

			server.servers = servers.map(s => fillServerInfo(s, name))
			return server
		}
	}
}