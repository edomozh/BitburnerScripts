import { settings } from 'settings.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    ns.disableLog('ALL')
    ns.clearLog()

    ns.print(JSON.stringify(settings(), null, 2))
}
