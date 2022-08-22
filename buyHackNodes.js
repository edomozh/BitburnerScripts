import { writeStatus, log } from 'all.js'

/** @param {NS} ns **/
export async function main(ns) {

    if (ns.hacknet.getPurchaseNodeCost() > 10e6) {
        writeStatus(ns, 'maxHackNodes', true)
        return
    }

    let money = () => ns.getServerMoneyAvailable('home') * 0.5

    while (true) {

        if (ns.hacknet.getPurchaseNodeCost() < money())
            ns.hacknet.purchaseNode()

        for (var i = 0; i < ns.hacknet.numNodes(); i++) {
            var mod = ns.hacknet.getNodeStats(i).level % 10
            if (ns.hacknet.getLevelUpgradeCost(i, 10 - mod) < money())
                ns.hacknet.upgradeLevel(i, 10 - mod)

            if (ns.hacknet.getRamUpgradeCost(i) < money())
                ns.hacknet.upgradeRam(i)

            if (ns.hacknet.getCoreUpgradeCost(i) < money())
                ns.hacknet.upgradeCore(i)
        }

        await ns.sleep(1e3)
    }
}