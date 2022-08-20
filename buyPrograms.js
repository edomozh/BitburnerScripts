import { log, writeStatus, readStatus } from 'core.js'

/** @param {NS} ns **/
export async function main(ns) {

    let programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']

    ns.singularity.purchaseTor()

    for (const p of programs)
        ns.singularity.purchaseProgram(p)

    if (!programs.map(p => ns.fileExists(p)).some(e => e == false))
        writeStatus(ns, 'hasPrograms', true)
} 