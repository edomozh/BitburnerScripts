import { writeStatus, log } from 'all.js'

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.stock.hasWSEAccount() &&
        ns.stock.hasTIXAPIAccess() &&
        ns.stock.has4SData() &&
        ns.stock.has4SDataTIXAPI())
        writeStatus(ns, 'hasMarketAccess', true)

}