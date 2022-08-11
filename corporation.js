import { getServers, rootServers, infect, log, msToSec, stringify, getDate } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog()
	ns.tail()

	let maxEmploees = 60;
	let industries = ['Agriculture']
	let upgrades = []
	let unlocks = []
	let cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
	let jobs = ['Research & Development', 'Operations', 'Engineer', 'Business', 'Management', 'Training']
	let resources = ['Real Estate', 'AI Cores', 'Robots', 'Hardware']
	let researches = ['Hi-Tech R&D Laboratory', 'AutoBrew', 'AutoPartyManager', 'Automatic Drug Administration', 'Go-Juice', 'CPH4 Injections', 'Bulk Purchasing', 'Drones', 'Drones - Assembly', 'Drones - Transport', 'HRBuddy-Recruitment', 'HRBuddy-Training', 'JoyWire', 'Market-TA.I', 'Market-TA.II', 'Overclock', 'Sti.mu', 'Self-Correcting Assemblers']

	let corp = ns.corporation.getCorporation()
	if (!corp) return;

	for (let industry of industries)
		if (!corp.divisions.map(d => d.type).includes(industry) &&
			ns.corporation.getExpandIndustryCost(industry) < corp.funds)
			ns.corporation.expandIndustry(industry, industry)

	for (let division of corp.divisions)
		for (let city of cities)
			if (!division.cities.includes(city) &&
				ns.corporation.getExpandCityCost() < corp.funds)
				ns.corporation.expandCity(division.name, city)

	while (true) {
		corp = ns.corporation.getCorporation()
		//await manageDividends(corp)
		//await manageShares(corp)
		//await manageUpgrades(corp)
		//await manageUnlocks(corp)

		for (let division of corp.divisions) {
		
			//await manageResearches(corp)
			for (let city of division.cities) {
				await manageOffice(corp, division, city)
				await manageWarehouse(corp, division, city)
				await manageEmployees(division, city)
				await manageResources(division, city)
			}
		}

		await ns.sleep(60e3)
	}
	async function manageOffice(corp, division, city) {

		if (ns.corporation.getOffice(division.name, city).size < maxEmploees &&
			ns.corporation.getOfficeSizeUpgradeCost(division.name, city, 1))
			ns.corporation.upgradeOfficeSize(division.name, city, 1)

		let vacancy = ns.corporation.getOffice(division.name, city).size - ns.corporation.getOffice(division.name, city).employees.length

		for (o of Array(vacancy))
			ns.corporation.hireEmployee(division.name, city)
	}

	async function manageWarehouse(corp, division, city) {
		if (ns.corporation.getPurchaseWarehouseCost() < corp.funds)
			ns.corporation.purchaseWarehouse(division.name, city)

		if (ns.corporation.getUpgradeWarehouseCost(division.name, city) < corp.funds)
			ns.corporation.upgradeWarehouse(division.name, city)

		//ns.corporation.hasUnlockUpgrade()
		try { ns.corporation.setSmartSupply(division.name, city, true) }
		catch { log(ns, 'e', `${division.name} ${city} setSmartSupply failed`) }
	}

	async function manageEmployees(division, city) {
		log(ns, 'i', `manage employees in ${division.name} ${city}`)

		let employees = shuffle(ns.corporation.getOffice(division.name, city).employees)

		let allResearched = true;
		for (let research of researches)
			allResearched = ns.corporation.hasResearched(division.name, research) && allResearched

		let divisionJobs = allResearched ? jobs.filter(j => j !== jobs[0]) : jobs

		for (let employee of employees)
			await ns.corporation.assignJob(division.name, city, employee, divisionJobs[Math.floor(Math.random() * divisionJobs.length)])

	}

	function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

	async function manageResources(division, city) {
		log(ns, 'i', `manage resources in ${division.name} ${city}`)

		let size = ns.corporation.getWarehouse(division.name, city).size
		let sizeUsed = ns.corporation.getWarehouse(division.name, city).sizeUsed
		let resource = resources[0]

		if (size / sizeUsed > 2)
			try {
				log(ns, 'i', `try to buy ${resource}`)
				ns.corporation.bulkPurchase(division.name, city, resource, 1e6)
			}
			catch { log(ns, 'e', `probably bulkPurchase is not allowed`) }
	}
}