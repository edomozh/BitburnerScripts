import { getServers, rootServers, infect, log, msToSec, stringify, getDate } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	//ns.disableLog("ALL")
	ns.clearLog()
	ns.tail()

	let industries = ['Agriculture']
	let cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
	let jobs = ['Operations', 'Engineer', 'Business', 'Management', 'Research & Development', 'Training']
	let resources = ['Real Estate']
	let employees = [];

	let corp = ns.corporation.getCorporation()
	if (!corp) return;

	log(ns, 'w', stringify(corp))

	for (let industry of industries)
		if (!corp.divisions.map(d => d.name).includes(industry) &&
			ns.corporation.getExpandIndustryCost(industry) < corp.funds)
			try { ns.corporation.expandIndustry(industry, industry) }
			catch { log(ns, 'e', `${industry} already exists`) }

	corp = ns.corporation.getCorporation()
	for (let division of corp.divisions)
		for (let city of division.cities) {
			if (ns.corporation.getPurchaseWarehouseCost() < corp.funds)
				ns.corporation.purchaseWarehouse(division.name, city)

			if (ns.corporation.getUpgradeWarehouseCost(division.name, city) < corp.funds)
				ns.corporation.upgradeWarehouse(division.name, city)

			if (ns.corporation.getOffice(division.name, city).size < 100 &&
				ns.corporation.getOfficeSizeUpgradeCost(division.name, city, 1))
				ns.corporation.upgradeOfficeSize(division.name, city, 1)

			if (ns.corporation.getOffice(division.name, city).size >
				ns.corporation.getOffice(division.name, city).employees.length)
				ns.corporation.hireEmployee(division.name, city)

			try { ns.corporation.setSmartSupply(division.name, city, true) }
			catch { log(ns, 'e', `${division.name} ${city} setSmartSupply failed`) }

			await manageEmployees(corp, division, city)
			await manageResources(corp, division, city)
		}

	async function manageEmployees(corp, division, city) {
		log(ns, 'i', `manage employees in ${division.name} ${city}`)

		let employees = ns.corporation.getOffice(division.name, city).employees

		for (let employee of employees)
			await ns.corporation.assignJob(division.name, city, employee, jobs[Math.floor(Math.random() * jobs.length)])
	}

	async function manageResources(corp, division, city) {
		log(ns, 'i', `manage resources in ${division.name} ${city}`)

		let size = ns.corporation.getWarehouse(division.name, sity).size
		let sizeUsed = ns.corporation.getWarehouse(division.name, sity).sizeUsed
		let resource = resources[Math.floor(Math.random() * resources.length)]

		log(ns, 'i', `try to buy ${resource}`)
		if (size / sizeUsed > 2)
			ns.corporation.bulkPurchase(division.name, sity, resource, 1e3)
	}
}