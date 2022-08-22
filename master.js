import { readStatus, writeStatus, log, numToString } from 'all.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.killall()
    ns.clearLog()
    ns.tail()

    writeStatus(ns, 'hasPrograms', false)
    writeStatus(ns, 'hasMarketAccess', false)
    writeStatus(ns, 'hasCorporation', false)

    let ram = () => ns.getServerMaxRam('home')
    let upgradeRamCost = () => ram() * 3.2e4 * Math.pow(1.58, Math.log2(ram())) * (status.hasMarketAccess ? 0.5 : 1)
    let money = () => ns.getServerMoneyAvailable('home')
    let enough = (s) => ns.getServerMaxRam('home') - ns.getServerUsedRam('home') > ns.getScriptRam(s)

    while (true) {
        var status = readStatus(ns)

        await exec(ns, 'checkTradeAccess.js')

        if (!status.hasMarketAccess && money() > 31.2e9) await buy(ns, 'buyTradeAccess.js')

        if (money() > upgradeRamCost()) await buy(ns, 'buyHomeRam.js')

        if (!status.hasPrograms) await buy(ns, 'buyPrograms.js')

        if (!status.maxHackNodes) await exec(ns, 'buyHackNodes.js')

        await exec(ns, 'hacker.js', 'allres')

        if (status.hasMarketAccess) await exec(ns, 'trader.js')

        if (status.hasCorporation) await exec(ns, 'director.js')

        await ns.sleep(10e3)
    }

    /** @param {NS} ns */
    async function exec(ns, scriptName, ...args) {
        if (enough(scriptName) && !ns.getRunningScript(scriptName, 'home'))
            ns.exec(scriptName, 'home', 1, ...args)
        await ns.sleep(1e3)
    }

    /** @param {NS} ns */
    async function buy(ns, script) {
        if (!enough(script))
            ns.killall()

        while (!enough(script))
            await ns.sleep(1e3)

        await exec(ns, script, 'buy')

        await ns.sleep(1e3)
    }
}

