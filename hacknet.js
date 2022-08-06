/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL')

    let myMoney = () => ns.getServerMoneyAvailable('home') * 0.5

    while (true) {
        await ns.sleep(1000)

        if (ns.hacknet.getPurchaseNodeCost() < myMoney())
            ns.hacknet.purchaseNode()

        for (var i = 0; i < ns.hacknet.numNodes(); i++) {
            var mod = ns.hacknet.getNodeStats(i).level % 10
            if (ns.hacknet.getLevelUpgradeCost(i, 10 - mod) < myMoney())
                ns.hacknet.upgradeLevel(i, 10 - mod)

            if (ns.hacknet.getRamUpgradeCost(i) < myMoney())
                ns.hacknet.upgradeRam(i)

            if (ns.hacknet.getCoreUpgradeCost(i) < myMoney())
                ns.hacknet.upgradeCore(i)
        }
    }
}