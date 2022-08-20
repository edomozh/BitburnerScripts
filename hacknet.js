/** @param {NS} ns **/
export async function main(ns) {

    let money = () => Math.min(10e6, ns.getServerMoneyAvailable('home') * 0.5)

    while (true) {
        await ns.sleep(1e3)

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
    }
}