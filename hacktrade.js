import { getServers, numToString, log, getCompanyServer } from 'core.js'
import { settings } from 'settings.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    ns.disableLog('ALL')
    ns.clearLog()

}