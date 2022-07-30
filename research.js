/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    ns.disableLog("ALL")
    ns.clearLog()

    let server = ns.args[0]
}
