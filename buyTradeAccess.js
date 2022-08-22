import { writeStatus, log } from 'all.js'

/** @param {NS} ns **/
export async function main(ns) {
    
    if (!ns.stock.hasWSEAccount()) ns.stock.purchaseWseAccount()
    if (!ns.stock.hasTIXAPIAccess()) ns.stock.purchaseTixApi()
    if (!ns.stock.has4SData()) ns.stock.purchase4SMarketData()
    if (ns.stock.has4SData() && !ns.stock.has4SDataTIXAPI()) ns.stock.purchase4SMarketDataTixApi()
}