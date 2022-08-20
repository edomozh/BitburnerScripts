import { readStatus } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.killall()
    ns.clearLog()
    ns.tail()

    let money = () => ns.getServerMoneyAvailable('home')
    let enough = (s) => ns.getServerMaxRam('home') > ns.getScriptRam(s)

    while (true) {
        var status = readStatus(ns)

        if (enough('hacknet.js') && !ns.getRunningScript('hacknet.js', 'home') && money() < 1e9)
            ns.exec('hacknet.js', 'home')

        if (enough('hacker.js') && !ns.getRunningScript('hacker.js', 'home', 'allres'))
            ns.exec('hacker.js', 'home', 1, 'allres')

        if (enough('buyRam.js') && !ns.getRunningScript('buyRam.js', 'home') && money() < 1e9)
            ns.exec('buyRam.js', 'home')

        if (enough('buyPrograms.js') && !status.hasPrograms)
            ns.exec('buyPrograms.js', 'home')

        if (enough('buyTradeAccess.js') && !status.hasMarketAccess)
            ns.exec('buyTradeAccess.js', 'home')

        if (enough('trade.js') && status.hasMarketAccess && !ns.getRunningScript('trade.js', 'home'))
            ns.exec('trade.js', 'home')

        if (enough('corporation.js') && status.hasCorporation && !ns.getRunningScript('corporation.js', 'home'))
            ns.exec('corporation.js', 'home')

        await ns.sleep(60e3)
    }
}


