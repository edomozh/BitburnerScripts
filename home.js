/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("sleep")
    ns.tail()
    ns.clearLog()

    let money = () => ns.getPlayer().money * 0.5

    while (true) {
        if (ns.getUpgradeHomeCoresCost() < money())
            ns.upgradeHomeCores()

        if (ns.getUpgradeHomeRamCost() < money())
            ns.upgradeHomeRam()

        await ns.sleep(60000)
    }
}