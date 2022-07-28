import { getServers, rootServers, infect } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	ns.disableLog("ALL");
	ns.clearLog();

	let moneyPercent = (s) => ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s);
	let highSecurity = (s) => ns.getServerSecurityLevel(s) > ns.getServerMinSecurityLevel(s) + 5;
	let lowMoney = (s) => ns.getServerMoneyAvailable(s) < ns.getServerMaxMoney(s) * 0.9;
	let whatToDo = (s) => highSecurity(s) ? "weaken" : lowMoney(s) ? "grow" : "hack"
	let freeRam0 = (s) => ns.getServerMaxRam(s) - ns.getServerUsedRam(s)
	let freeRam = (s) => s == "home" ? freeRam0(s) - 20 : freeRam0(s);
	let threadsToHack = (s) => Math.ceil(Math.trunc(ns.getServerMaxMoney(s) / ns.hackAnalyze(s) / 2));
	let threadsToWeaken = (s) => Math.ceil((ns.getServerSecurityLevel(s) - (ns.getServerMinSecurityLevel(s))) / ns.weakenAnalyze(1, 1));
	let threadsToGrow = (s) => Math.ceil(ns.growthAnalyze(s, ns.getServerMaxMoney(s) - ns.getServerMoneyAvailable(s), 1));
	let hackAnalyze = (s) => ns.getServerMoneyAvailable(s) * ns.hackAnalyze(s);

	let scriptRam = ns.getScriptRam("v.js");
	let availableThreads = (s) => Math.trunc(freeRam(s) / scriptRam);

	let pidRunningScripts = [];

	while (true) {
		ns.print("WARNING NEW RUN")

		rootServers(ns);
		await infect(ns, 'v.js');
		writeMessagesFromPort1(ns);

		let allServers = getServers(ns);

		pidRunningScripts = pidRunningScripts.filter(p => ns.getRunningScript(p) != null);

		let busyServers = pidRunningScripts.map(p => ns.getRunningScript(p).args[0]);
		ns.print(`${busyServers.length} Busy servers: ${busyServers}`);

		let serversToHack = allServers
			.filter(s => s.hasAdminRights && !!s.moneyMax && !s.purchasedByPlayer);

		let poorestServer = serversToHack.sort((a, b) => moneyPercent(a.hostname) - moneyPercent(b.hostname))[0];
		ns.print(`Poorest server: ${poorestServer.hostname}`);

		serversToHack = serversToHack.filter(s => !busyServers.includes(s.hostname));
		ns.print(`${serversToHack.length} Servers to hack: ${serversToHack.map(s => s.hostname)}`);

		let serversForWork = allServers
			.filter(s => s.hasAdminRights && freeRam(s.hostname) > scriptRam)
			.sort((a, b) => freeRam(b.hostname) - freeRam(a.hostname));
		ns.print(`${serversForWork.length} Servers for work: ${serversForWork.map(s => s.hostname)}`);

		for (let s of serversToHack) {
			s.whatToDo = whatToDo(s.hostname);
			s.needThreads =
				s.whatToDo == "weaken" ? threadsToWeaken(s.hostname) :
					s.whatToDo == "grow" ? threadsToGrow(s.hostname) :
						threadsToHack(s.hostname);
		}

		serversToHack = serversToHack.sort((a, b) => hackAnalyze(a.hostname) - hackAnalyze(b.hostname));

		for (let serverForWork of serversForWork) {
			serverForWork.availableThreads = availableThreads(serverForWork.hostname);

			while (serverForWork.availableThreads >= 1) {
				if (serversToHack.length > 0) {
					let serverToHack = serversToHack.pop();
					let threads = serverForWork.availableThreads > serverToHack.needThreads ? serverToHack.needThreads : serverForWork.availableThreads;
					serverForWork.availableThreads = serverForWork.availableThreads - threads;
					let pid = ns.exec('v.js', serverForWork.hostname, threads, serverToHack.hostname, serverToHack.whatToDo);
					pidRunningScripts.push(pid);
					ns.print(`INFO run v.js on ${serverForWork.hostname} with ${threads} threads to ${serverToHack.whatToDo} ${serverToHack.hostname}`);
				} else {
					ns.exec('v.js', serverForWork.hostname, serverForWork.availableThreads, poorestServer.hostname, "grow");
					ns.print(`INFO run v.js on ${serverForWork.hostname} with ${serverForWork.availableThreads} threads to grow poorest server`);
					serverForWork.availableThreads = 0;
				}

				await ns.sleep(100);
			}
		}

		await ns.sleep(10000);
	}
}

/** @param {NS} ns */
function writeMessagesFromPort1(ns) {
	let info;
	do {
		info = ns.readPort(1);
		if (info != 'NULL PORT DATA')
			ns.print(`SUCCESS ${info}`);
	} while (info != 'NULL PORT DATA')
}