import { readStatus, writeStatus, log, numToString } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.killall()
    ns.clearLog()
    ns.tail()

    writeStatus(ns, 'hasPrograms', false)
    writeStatus(ns, 'hasMarketAccess', false)
    writeStatus(ns, 'hasCorporation', false)

    let ram = () => ns.getServerMaxRam('home')
    let ramCost = () => ram() * 3.2e4 * Math.pow(1.58, Math.log2(ram()))
    let money = () => ns.getServerMoneyAvailable('home')
    let enough = (s) => ns.getServerMaxRam('home') - ns.getServerUsedRam('home') > ns.getScriptRam(s)

    while (true) {
        var status = readStatus(ns)

        if (money() > ramCost()) await buy(ns, 'buyRam.js')
        
        if (!status.hasPrograms) await buy(ns, 'buyPrograms.js')
        
        if (!status.hasMarketAccess) await buy(ns, 'buyTradeAccess.js')

        await exec(ns, 'hacknet.js')

        await exec(ns, 'hacker.js', 'allres')

        if (status.hasMarketAccess) await exec(ns, 'trade.js')

        if (status.hasCorporation) await exec(ns, 'corporation.js')

        await ns.sleep(600e3)
    }

    /** @param {NS} ns */
    async function exec(ns, scriptName, ...args) {
        if (enough(scriptName) && !ns.getRunningScript(scriptName, 'home'))
            ns.exec(scriptName, 'home', 1, ...args)
        await ns.sleep(1e3)
    }

    /** @param {NS} ns */
    async function buy(ns, script) {
        ns.killall()

        while (!enough(script))
            await ns.sleep(1e3)

        await exec(ns, script)

        await ns.sleep(1e3)
    }
}

