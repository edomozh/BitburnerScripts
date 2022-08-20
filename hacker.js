import { getServers, rootServers, infect, log, msToSec, stringify, getDate } from 'core.js'
import { settings } from 'settings.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL')
	ns.clearLog()
	ns.tail()

	let scriptName = settings().hackfile
	let poorTrash = ns.args[0] / 100 || 0.9

	let fullness = (s) => Math.trunc((ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s)) * 100)
	let freeRam = (s) => ns.getServerMaxRam(s) - ns.getServerUsedRam(s) - (s == 'home' ? 20 : 0)
	let resource = (s) => Math.trunc(freeRam(s) / ns.getScriptRam(scriptName))

	let scripts = []

	let stats = { start: 0, hack: 0, grow: 0, weaken: 0, stolen: 0 }
	stats.start = getDate()

	while (true) {
		rootServers(ns)

		await infect(ns, scriptName)

		logMessagesFromPort(1)

		scripts = scripts.filter(p => ns.getRunningScript(p) != null)

		let servers = getServers(ns)
		let busy = servers.filter(s => scripts.map(p => ns.getRunningScript(p).args[0]).includes(s.hostname))
		let targets = servers.filter(s => s.hasAdminRights && !!s.moneyMax && !s.purchasedByPlayer && s.moneyAvailable > 0 && !busy.includes(s))
		let workers = servers.filter(s => s.hasAdminRights && freeRam(s.hostname) > ns.getScriptRam(scriptName))

		workers = workers.sort((a, b) => freeRam(b.hostname) - freeRam(a.hostname))
		targets = targets.sort((a, b) => ns.getServerMoneyAvailable(a.hostname) - ns.getServerMoneyAvailable(b.hostname))

		log(ns, 'i', `busy ${busy.length}`)
		log(ns, 'd', `busy ${busy.map(s => s.hostname)}`)

		log(ns, 'i', `targets ${targets.length}`)
		log(ns, 'd', `targets ${targets.map(s => s.hostname)}`)

		log(ns, 'i', `workers ${workers.length}`)
		log(ns, 'd', `workers ${workers.map(s => s.hostname)}`)

		let hacking = scripts.map(p => ns.getRunningScript(p)).filter(s => s.args[1] == 'hack')
		log(ns, 'i', `hacking ${hacking.length}`)
		log(ns, 'd', `hacking ${hacking.map(s => s.args[0])}`)


		for (let worker of workers) {
			worker.resource = resource(worker.hostname)

			while (worker.resource >= 1) {
				let target = targets.pop()
				let threads
				let remember

				if (target) {
					remember = true
					calcNeededAction(target)
					threads = Math.ceil(Math.min(worker.resource, target.capacity))
					busy.push(target)
				} else if (ns.args.includes("allres")) {
					threads = Math.ceil(Math.min(worker.resource, 1e6))
					target = busy[Math.floor(Math.random() * busy.length)]
					target.action = ['grow', 'weaken'][Math.floor(Math.random() * 2)]
				} else {
					worker.resource = 0
					continue
				}

				worker.resource -= threads
				log(ns, 'c', `${threads} ${worker.hostname} ${target.action} ${target.hostname} ${fullness(target.hostname)}% ${msToSec(ns.getHackTime(target.hostname))}`)
				let pid = ns.exec(scriptName, worker.hostname, threads, target.hostname, target.action)
				stats[target.action] += threads
				if (remember) scripts.push(pid)
				await ns.sleep(10)
			}
		}

		log(ns, 'w', `${stringify(stats, null, 2)}`)
		await ns.sleep(5e3)

		ns.clearLog()
	}

	function calcNeededAction(target) {
		let tooAnxious = (s) => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s) + 5
		let tooPoor = (s) => ns.getServerMoneyAvailable(s) <= ns.getServerMaxMoney(s) * poorTrash
		let neededAction = (s) => tooAnxious(s) ? 'weaken' : tooPoor(s) ? 'grow' : 'hack'

		let hackThreads = (s) => Math.ceil(ns.hackAnalyzeThreads(s, ns.getServerMoneyAvailable(s) * 0.8))
		let weakenThreads = (s) => Math.ceil((ns.getServerSecurityLevel(s) - ns.getServerMinSecurityLevel(s)) / ns.weakenAnalyze(1))
		let growThreads = (s) => Math.ceil(ns.growthAnalyze(s, ns.getServerMaxMoney(s) / ns.getServerMoneyAvailable(s)))

		target.action = neededAction(target.hostname)
		switch (target.action) {
			case 'weaken': target.capacity = weakenThreads(target.hostname); break
			case 'grow': target.capacity = growThreads(target.hostname); break
			default: target.capacity = hackThreads(target.hostname); break
		}
	}

	function logMessagesFromPort(port) {
		let info
		do {
			info = ns.readPort(port)
			if (info != 'NULL PORT DATA') {
				stats.stolen += Number(info.match(/^[0-9,]+/g)[0])
				log(ns, 's', stringify(info))
			}
		} while (info != 'NULL PORT DATA')
	}
}