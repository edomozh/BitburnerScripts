import { getServers, rootServers, infect, numToString, log } from 'core.js'
import { settings } from 'settings.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.tail()
	ns.disableLog('ALL')
	ns.clearLog()

	let scriptName = settings().hackfile
	let poorThash = ns.args[0] / 100 || 0.9
	let start = new Date().getHours() + ':' + new Date().getMinutes()

	let fullness = (s) => Math.trunc((ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s)) * 100)
	let freeRam = (s) => ns.getServerMaxRam(s) - ns.getServerUsedRam(s) - (s == 'home' ? 20 : 0)
	let resource = (s) => Math.trunc(freeRam(s) / ns.getScriptRam(scriptName))

	let scripts = []

	let stats = { hack: 0, grow: 0, weaken: 0, stolen: 0 }

	while (true) {
		ns.clearLog()

		log('w', start)

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

		log('i', `${busy.length} busy: ${busy.map(s => s.hostname)}`)
		log('i', `${targets.length} targets: ${targets.map(s => s.hostname)}`)
		log('i', `${workers.length} workers: ${workers.map(s => s.hostname)}`)

		let hacking = scripts.map(p => ns.getRunningScript(p)).filter(s => s.args[1] == 'hack')
		log('i', `${hacking.length} hacking: ${hacking.map(s => s.args[0])}`)

		log('w', `busy ${busy.length}, hacking ${hacking.length}, targets ${targets.length}, workers ${workers.length}`)
		log('w', `grow ${numToString(stats.grow)}, hack ${numToString(stats.hack)}, weaken ${numToString(stats.weaken)}, stolen ${numToString(stats.stolen)}`)

		for (let worker of workers) {
			worker.resource = resource(worker.hostname)

			while (worker.resource >= 1) {
				let target = targets.pop()
				let threads;
				let remember;

				if (target) {
					remember = true
					calcNeededAction(target)
					threads = Math.ceil(Math.min(worker.resource, target.capacity) / worker.cpuCores)
					busy.push(target)
				} else {
					threads = Math.ceil(Math.min(worker.resource, 100))
					target = busy[Math.floor(Math.random() * busy.length)]
					target.action = ['grow', 'weaken', 'weaken'][Math.floor(Math.random() * 3)]
				}

				worker.resource -= threads
				log('c', `${threads} ${worker.hostname} ${target.action} ${target.hostname} ${fullness(target.hostname)}% ${getHackTime(target.hostname)}`)
				let pid = ns.exec(scriptName, worker.hostname, threads, target.hostname, target.action)
				stats[target.action] += threads
				if (remember) scripts.push(pid)
				await ns.sleep(100)
			}
		}

		await ns.sleep(5000)
	}

	function calcNeededAction(target) {
		let tooAnxious = (s) => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s) + 5
		let tooPoor = (s) => ns.getServerMoneyAvailable(s) <= ns.getServerMaxMoney(s) * poorThash
		let neededAction = (s) => tooAnxious(s) ? 'weaken' : tooPoor(s) ? 'grow' : 'hack'

		let hackThreads = (s) => Math.ceil(ns.getServerMoneyAvailable(s) / (ns.getServerMoneyAvailable(s) * ns.hackAnalyze(s)) * 0.5)
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
		const re = /^[0-9,]+/
		let info
		do {
			info = ns.readPort(port)
			if (info != 'NULL PORT DATA') {
				log('s', info)
				stats.stolen += Number(info.match(re)[0].replaceAll(',', ''))
			}
		} while (info != 'NULL PORT DATA')
	}

	function getHackTime(s) {
		let t = ns.getHackTime(s);
		t = Math.trunc(t)
		var ms = t % 1000
		t = (t - ms) / 1000
		var secs = t % 60
		t = (t - secs) / 60
		var mins = t % 60

		return `${mins}m ${secs}s`
	}
}