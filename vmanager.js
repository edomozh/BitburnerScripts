import { getServers, rootServers, infect } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.disableLog("ALL");
	ns.clearLog();

	let highSecurity = (s) => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s) + 5;
	let lowMoney = (s) => ns.getServerMoneyAvailable(s) < ns.getServerMaxMoney(s) * 0.9;
	let whatToDo = (s) => highSecurity(s) ? "weaken" : lowMoney(s) ? "grow" : "hack"

	let freeRam0 = (s) => ns.getServerMaxRam(s) - ns.getServerUsedRam(s)
	let freeRam = (s) => s == "home" ? freeRam0(s) - 10 : freeRam0(s);
	let threadsToHack = (s) => Math.ceil(Math.trunc(ns.getServerMaxMoney(s) / ns.hackAnalyze(s) / 2));
	let threadsToWeaken = (s) => Math.ceil((ns.getServerSecurityLevel(s) - (ns.getServerMinSecurityLevel(s))) / ns.weakenAnalyze(1, 1));
	let threadsToGrow = (s) => Math.ceil(ns.growthAnalyze(s, ns.getServerMaxMoney(s) - ns.getServerMoneyAvailable(s), 1));

	let vRam = ns.getScriptRam("v.js");
	let availableThreads = (s) => Math.trunc(freeRam(s) / vRam);

	let pidRunningScripts = [];

	while (true) {

		rootServers(ns);
		await infect(ns, 'v.js');

		let allServers = getServers(ns);

		pidRunningScripts = pidRunningScripts.filter(p => ns.getRunningScript(p) != null);

		let busyServers = pidRunningScripts.map(p => ns.getRunningScript(p).args[0]);
		ns.print(`\n${busyServers.length} Busy Servers: ${busyServers}`);

		let serversForWork = allServers
			.filter(s => s.hasAdminRights && freeRam(s.hostname) > vRam)
			.sort((a, b) => freeRam(b.hostname) - freeRam(a.hostname));
		ns.print(`\n${serversForWork.length} Servers For Work: ${serversForWork.map(s => s.hostname)}`);

		let serversToHack = allServers
			.filter(s => s.hasAdminRights && !!s.moneyMax && !s.purchasedByPlayer)
			.filter(s => !busyServers.includes(s.hostname));
		ns.print(`\n${serversToHack.length} Servers To Hack: ${serversToHack.map(s => s.hostname)}`);

		for (let s of serversToHack) {
			s.whatToDo = whatToDo(s.hostname);
			s.needThreads =
				s.whatToDo == "weaken" ? threadsToWeaken(s.hostname) :
					s.whatToDo == "grow" ? threadsToGrow(s.hostname) :
						threadsToHack(s.hostname);
		}

		serversToHack = serversToHack.sort((a, b) => a.needThreads - b.needThreads);

		for (let serverForWork of serversForWork) {
			serverForWork.availableThreads = availableThreads(serverForWork.hostname);

			while (freeRam(serverForWork.hostname) > vRam && serversToHack.length > 0) {
				let serverToHack = serversToHack.pop();
				let threads = serverForWork.availableThreads > serverToHack.needThreads ? serverToHack.needThreads : serverForWork.availableThreads;
				let pid = ns.exec('v.js', serverForWork.hostname, threads, serverToHack.hostname, serverToHack.whatToDo);
				pidRunningScripts.push(pid);
				ns.print(`INFO run v.js on ${serverForWork.hostname} with ${threads} threads to ${serverToHack.whatToDo} ${serverToHack.hostname}`);
				await ns.sleep(1000);
			}
		}

		await ns.sleep(10000);
	}
}
