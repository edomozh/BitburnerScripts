import { getServers, rootServers, infect, log, msToSec, stringify, getDate } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog()
	ns.tail()

	let industries = ['Agriculture']
	let cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
	let jobs = ['Operations', 'Engineer', 'Business', 'Management', 'Research & Development', 'Training']
	let resources = ['Real Estate', 'AI Cores', 'Robots', 'Hardware']

	let corp = ns.corporation.getCorporation()
	if (!corp) return;

	for (let industry of industries)
		if (!corp.divisions.map(d => d.type).includes(industry) &&
			ns.corporation.getExpandIndustryCost(industry) < corp.funds)
			ns.corporation.expandIndustry(industry, industry)

	while (true) {
		corp = ns.corporation.getCorporation()
		for (let division of corp.divisions) {
			for (let city of cities)
				if (!division.cities.includes(city) &&
					ns.corporation.getExpandCityCost() < corp.funds)
					ns.corporation.expandCity(division.name, city)

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

				await manageEmployees(division, city)
				await manageResources(division, city)
			}
		}

		await ns.sleep(60e3)
	}

	async function manageEmployees(division, city) {
		log(ns, 'i', `manage employees in ${division.name} ${city}`)

		let employees = shuffle(ns.corporation.getOffice(division.name, city).employees)

		for (let employee of employees) {
			await ns.corporation.assignJob(division.name, city, employee, jobs[Math.floor(Math.random() * jobs.length)])
		}
	}

	function shuffle(array) { array.sort(() => Math.random() - 0.5); }

	async function manageResources(division, city) {
		log(ns, 'i', `manage resources in ${division.name} ${city}`)

		let size = ns.corporation.getWarehouse(division.name, city).size
		let sizeUsed = ns.corporation.getWarehouse(division.name, city).sizeUsed
		let resource = resources[0]

		if (size / sizeUsed > 2)
			try {
				log(ns, 'i', `try to buy ${resource}`)
				ns.corporation.bulkPurchase(division.name, city, resource, 1e3)
			}
			catch { log(ns, 'e', `probably bulkPurchase is not allowed`) }
	}
}