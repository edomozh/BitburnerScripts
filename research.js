/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    ns.disableLog('ALL')
    ns.clearLog()

    let s = ns.args[0]
    let maxm = ns.getServerMaxMoney(s)
    let avail = ns.getServerMoneyAvailable(s)
    let anal = ns.growthAnalyze(s, ns.getServerMaxMoney(s) / ns.getServerMoneyAvailable(s))

    ns.print(maxm)
    ns.print(avail)
    ns.print(anal)



}
