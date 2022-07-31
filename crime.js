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

        while (ns.isBusy())
            await ns.sleep(10000)

        for (const crime of crimes) {
            if (ns.getCrimeChance(crime) >= trashhold) {
                ns.print(`${crime} will bring : ${ns.singularity.getCrimeStats(crime).money.toLocaleString('en-US')}$`)
                await ns.sleep(ns.commitCrime(crime))
                break
            }
        }

    }
}