import { numToString, log } from 'all.js'

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
    ns.disableLog('sleep')

    let profit = (c) => ns.singularity.getCrimeStats(c).money

    let crimes = ['shoplift', 'rob a store', 'mug someone', 'larceny',
        'deal drugs', 'forge corporate bonds', 'traffick illegal arms',
        'homicide', 'grand theft auto', 'kidnap', 'assassination', 'heist']
        .sort((a, b) => profit(b) - profit(a))

    let trashhold = 0.9

    while (true) {

        while (ns.singularity.isBusy())
            await ns.sleep(10000)

        for (const crime of crimes) {
            if (ns.singularity.getCrimeChance(crime) >= trashhold) {
                log(ns, 'i', `${crime} will bring ${numToString(profit(crime))}`)
                await ns.sleep(ns.singularity.commitCrime(crime))
                break
            }
        }

    }
}