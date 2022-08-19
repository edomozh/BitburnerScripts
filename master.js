import { log, writeStatus, readStatus } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog()
	ns.tail()

    var status = writeStatus(ns, 'hacknet', true)
    var status = writeStatus(ns, 'corporation', true)
    var status = readStatus(ns)
    log(ns, 'd', status)
}


