import { getServers } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
    while (true) {
        let servers = getServers(ns)
            .filter(s => s.hasAdminRights)
            .filter(s => !s.purchasedByPlayer)
            .map(s => s.hostname);
            
        for (const server of servers) {
            await ns.grow(server);
            await ns.weaken(server);
            await ns.grow(server);
            await ns.weaken(server);
            await ns.hack(server);
        }
    }
}

