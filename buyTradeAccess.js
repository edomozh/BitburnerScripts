import { writeStatus } from 'core.js'

/** @param {NS} ns **/
export async function main(ns) {
    if (ns.stock.purchaseWseAccount() &&
        ns.stock.purchaseTixApi() &&
        ns.stock.purchase4SMarketData() &&
        ns.stock.purchase4SMarketDataTixApi())
        writeStatus(ns, 'hasMarketAccess', true)
}