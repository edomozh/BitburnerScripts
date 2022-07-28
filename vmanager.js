import { getServers, rootServers, infect } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.disableLog("ALL");
	ns.clearLog();

	let scriptName = "v.js";

	let fullness = (s) => Math.trunc((ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s)) * 100);
	let freeRam = (s) => s == "home" ? ns.getServerMaxRam(s) - ns.getServerUsedRam(s) - 20 : ns.getServerMaxRam(s) - ns.getServerUsedRam(s);
	let threads = (s) => Math.trunc(freeRam(s) / ns.getScriptRam(scriptName));

	let scripts = [];

	while (true) {
		ns.print("WARNING NEW RUN")

		rootServers(ns);

		await infect(ns, scriptName);

		logMessagesFromPort(1);

		let servers = getServers(ns);

		scripts = scripts.filter(p => ns.getRunningScript(p) != null);

		let busy = scripts.map(p => ns.getRunningScript(p).args[0]);

		let targets = servers.filter(s => s.hasAdminRights && !!s.moneyMax && !s.purchasedByPlayer);

		let workers = servers.filter(s => s.hasAdminRights && freeRam(s.hostname) > ns.getScriptRam(scriptName));

		let poor = targets.sort((a, b) => fullness(a.hostname) - fullness(b.hostname))[0];

		targets = targets.filter(s => !busy.includes(s.hostname));

		workers = workers.sort((a, b) => freeRam(b.hostname) - freeRam(a.hostname));
		targets = targets.sort((a, b) => ns.getServerMoneyAvailable(a.hostname) - ns.getServerMoneyAvailable(b.hostname));

		ns.print(`${busy.length} busy now: ${busy}`);
		ns.print(`${targets.length} targets: ${targets.map(s => s.hostname)}`);
		ns.print(`${workers.length} workers: ${workers.map(s => s.hostname)}`);

		for (let worker of workers) {
			worker.resource = threads(worker.hostname);

			while (worker.resource >= 1) {
				let target = targets.pop();
				if (target) {
					calcNeededAction(target);
					let threads = Math.min(worker.resource, target.capacity);
					worker.resource -= threads;
					ns.print(`INFO work on ${worker.hostname} with ${threads} threads to ${target.action} ${target.hostname} ${fullness(target.hostname)}%`);
					let pid = ns.exec(scriptName, worker.hostname, threads, target.hostname, target.action);
					scripts.push(pid);
				} else {
					ns.print(`INFO work on ${worker.hostname} with ${worker.resource} threads to grow ${poor.hostname} ${fullness(poor.hostname)}%`);
					ns.exec(scriptName, worker.hostname, worker.resource, poor.hostname, "grow");
					worker.resource = 0;
				}

				await ns.sleep(100);
			}
		}

		await ns.sleep(10000);
	}

	function calcNeededAction(target) {
		let tooAnxious = (s) => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s) + 5;
		let tooPoor = (s) => ns.getServerMoneyAvailable(s) < ns.getServerMaxMoney(s) * 0.9;
		let neededAction = (s) => tooAnxious(s) ? "weaken" : tooPoor(s) ? "grow" : "hack";

		let hackThreads = (s) => Math.ceil(Math.trunc(ns.getServerMaxMoney(s) / ns.hackAnalyze(s) / 2));
		let weakenThreads = (s) => Math.ceil((ns.getServerSecurityLevel(s) - ns.getServerMinSecurityLevel(s)) / ns.weakenAnalyze(1, 1));
		let growThresds = (s) => Math.ceil(ns.growthAnalyze(s, ns.getServerMaxMoney(s) - ns.getServerMoneyAvailable(s), 1));

		target.action = neededAction(target.hostname);
		switch (target.action) {
			case "weaken": target.capacity = weakenThreads(target.hostname); break;
			case "grow": target.capacity = growThresds(target.hostname); break;
			default: target.capacity = hackThreads(target.hostname); break;
		}
	}

	function logMessagesFromPort(port) {
		let info;
		do {
			info = ns.readPort(port);
			if (info != 'NULL PORT DATA')
				ns.print(`SUCCESS ${info}`);
		} while (info != 'NULL PORT DATA')
	}
}