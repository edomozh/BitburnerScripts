/** @param {NS} ns */
export async function main(ns) {

    let money = () => ns.getServerMoneyAvailable('home')

    if (ns.singularity.getUpgradeHomeCoresCost() < money())
        ns.singularity.upgradeHomeCores()

    if (ns.singularity.getUpgradeHomeRamCost() < money())
        ns.singularity.upgradeHomeRam()
}