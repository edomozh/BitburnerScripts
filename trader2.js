import { getServers, numToString, log, getCompanyServer, msToSec } from 'all.js'
import { settings } from 'settings.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    ns.disableLog('ALL')
    ns.clearLog()

    let status = {}

    let pids = []
    let virus = settings().hackfile
    let home = "home"
    let stock = "ICRS"
    let target = getCompanyServer(stock)

    ns.print(target)

    log(ns, 'c', `${home} ${target}`)

    let fullness = (s) => Math.trunc((ns.getServerMoneyAvailable(s) / ns.getServerMaxMoney(s)) * 100)
    let growThreads = (s) => Math.ceil(ns.growthAnalyze(s, ns.getServerMaxMoney(s) / ns.getServerMoneyAvailable(s)))

    let threads = growThreads(target)


    log(ns, 'c', `${threads} ${home} ${"grow"} ${target} ${fullness(target)}% ${msToSec(ns.getGrowTime(target))}`)
  
    if (threads > 0) {
        let pid = ns.exec(virus, home, threads, target, "grow")
        pids.push(pid)
    }

    while (pids.filter(p => ns.getRunningScript(p) != null).length > 0)
        await ns.sleep(1e3)

    log(ns, 'c', `fullness ${fullness(target)}%`)

    while (true) {
        await ns.sleep(1e3)
        let price = ns.stock.getAskPrice(stock)
        log(ns, 'c', `${numToString(price)}`)
    }

}