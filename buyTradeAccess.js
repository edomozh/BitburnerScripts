import { writeStatus } from 'core.js'

/** @param {NS} ns **/
export async function main(ns) {

    if (!ns.stock.hasWSEAccount()) ns.stock.purchaseWseAccount()
    if (!ns.stock.hasTIXAPIAccess()) ns.stock.purchaseTixApi()
    if (!ns.stock.has4SData()) ns.stock.purchase4SMarketData()
    if (ns.stock.has4SData() && !ns.stock.has4SDataTIXAPI()) ns.stock.purchase4SMarketDataTixApi()

    if (ns.stock.hasWSEAccount() &&
        ns.stock.hasTIXAPIAccess() &&
        ns.stock.has4SData() &&
        ns.stock.has4SDataTIXAPI())
        writeStatus(ns, 'hasMarketAccess', true)
}