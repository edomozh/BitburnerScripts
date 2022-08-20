import { readStatus } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.killall()
    ns.clearLog()
    ns.tail()

    let enough = (s) => ns.getServerMaxRam('home') - ns.getServerUsedRam('home') > ns.getScriptRam(s)

    while (true) {
        var status = readStatus(ns)

        if (!status.hasPrograms) await exec(ns, 'buyPrograms.js')

        if (!status.hasMarketAccess) await exec(ns, 'buyTradeAccess.js')

        await exec(ns, 'buyRam.js')

        await exec(ns, 'hacknet.js')

        await exec(ns, 'hacker.js', 'allres')

        if (status.hasMarketAccess) await exec(ns, 'trade.js')

        if (status.hasCorporation) await exec(ns, 'corporation.js')

        await ns.sleep(60e3)
    }

    /** @param {NS} ns */
    async function exec(ns, scriptName, ...args) {
        if (enough(scriptName) && !ns.getRunningScript(scriptName, 'home'))
            ns.exec(scriptName, 'home', 1, ...args)
        await ns.sleep(1e3)
    }
}

