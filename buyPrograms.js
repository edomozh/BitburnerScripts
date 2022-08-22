import { log, writeStatus, readStatus } from 'all.js'

/** @param {NS} ns **/
export async function main(ns) {

    let programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']

    ns.singularity.purchaseTor()

    if (ns.args.includes('buy'))
        for (const p of programs)
            ns.singularity.purchaseProgram(p)

    if (!programs.map(p => ns.fileExists(p)).some(e => e == false))
        writeStatus(ns, 'hasPrograms', true)
} 