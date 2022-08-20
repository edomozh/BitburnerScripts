import { log, writeStatus, readStatus } from 'core.js'

/** @param {NS} ns **/
export async function main(ns) {

    let programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe',
        'ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe', 'Formulas.exe']

    ns.singularity.purchaseTor()

    for (const p of programs)
        ns.singularity.purchaseProgram(p)

    if (!programs.map(p => ns.fileExists(p)).some(e => e == false))
        writeStatus(ns, 'hasPrograms', true)
} 