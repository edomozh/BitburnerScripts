import { readStatus } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.killall()
    ns.clearLog()
    ns.tail()

    let enough = (s) => ns.getServerMaxRam('home') - ns.getServerUsedRam('home') > ns.getScriptRam(s)

    while (true) {
        var status = readStatus(ns)

        exec(ns, 'hacknet.js')

        exec(ns, 'hacker.js', 'allres')

        exec(ns, 'buyRam.js')

        if (!status.hasPrograms) exec(ns, 'buyPrograms.js')

        if (!status.hasMarketAccess) exec(ns, 'buyTradeAccess.js')

        if (status.hasMarketAccess) exec(ns, 'trade.js')

        if (status.hasCorporation) exec(ns, 'corporation.js')

        await ns.sleep(60e3)
    }

    function exec(ns, scriptName, ...args) {
        if (enough(scriptName) && !ns.getRunningScript(scriptName, 'home'))
            ns.exec(scriptName, 'home', 1, ...args)
    }
}

