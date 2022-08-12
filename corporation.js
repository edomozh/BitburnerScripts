import { log, stringify, numToString } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog()
	ns.tail()

	let maxEmploees = 120;
	let upgradeSize = 6;
	let industries = ['Agriculture', 'Energy']
	let upgrades = ['Smart Storage', 'Smart Factories', 'Wilson Analytics', 'Neural Accelerators', 'Project Insight', 'Nuoptimal Nootropic Injector Implants', 'FocusWires', 'DreamSense', 'Speech Processor Implants', 'ABC SalesBots']
	let unlocks = ['Smart Supply', 'Office API', 'Warehouse API', 'Shady Accounting', 'Government Partnership', 'Export', 'Market Research - Demand', 'Shady Accounting', 'Market Data - Competition']
	let cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
	let jobs = ['Research & Development', 'Operations', 'Engineer', 'Business', 'Management', 'Training']
	let researches = ['Bulk Purchasing', 'Hi-Tech R&D Laboratory', 'AutoBrew', 'AutoPartyManager', 'Automatic Drug Administration', 'Go-Juice', 'CPH4 Injections', 'Drones', 'Drones - Assembly', 'Drones - Transport', 'HRBuddy-Recruitment', 'HRBuddy-Training', 'JoyWire', 'Market-TA.I', 'Market-TA.II', 'Overclock', 'Sti.mu', 'Self-Correcting Assemblers']
	let materials = ['Water', 'Energy', 'Food', 'Plants', 'AI Cores', 'Robots', 'Hardware', 'Real Estate']

	let funds = (priority) => ns.corporation.getCorporation().funds / (priority ? priority : 1)

	while (true) {
		let corp = ns.corporation.getCorporation()

		if (!corp) return;

		await manageExpansion(corp)
		//await manageDividends(corp)
		//await manageShares(corp)
		await manageUnlocks(1)
		await manageUpgrades(100)

		for (let division of corp.divisions) {
			await manageResearches(division)

			for (let city of division.cities) {
				await manageOffice(division, city, 10)
				await manageWarehouse(division, city, 10)
				await manageEmployees(division, city)
				await manageMaterials(division, city, 1)
				//await manageProducts(division, city, 1)
			}
		}

		//ns.corporation.goPublic()
		await ns.sleep(10e3)
	}

	async function manageUpgrades(priority) {
		for (let upgrade of upgrades)
			if (ns.corporation.getUpgradeLevelCost(upgrade) < funds(priority)) {
				log(ns, 'c', `upgrade ${upgrade}`)
				ns.corporation.levelUpgrade(upgrade)
			}
	}

	async function manageUnlocks(priority) {
		for (let unlock of unlocks)
			if (!ns.corporation.hasUnlockUpgrade(unlock) &&
				ns.corporation.getUnlockUpgradeCost(unlock) < funds(priority)) {
				log(ns, 'c', `unlock ${unlock}`)
				ns.corporation.unlockUpgrade(unlock)
			}
	}

	async function manageResearches(division) {
		for (let research of researches)
			if (!ns.corporation.hasResearched(division.name, research) &&
				ns.corporation.getResearchCost(division.name, research) < ns.corporation.getDivision(division.name).research) {
				log(ns, 'c', `research ${research} in ${division.name}`)
				ns.corporation.research(division.name, research)
			}
	}

	async function manageExpansion(corp) {
		for (let industry of industries)
			if (!corp.divisions.map(d => d.type).includes(industry) && ns.corporation.getExpandIndustryCost(industry) < funds()) {
				log(ns, 'c', `expand industry ${industry}`)
				ns.corporation.expandIndustry(industry, industry)
			}

		for (let division of corp.divisions)
			for (let city of cities)
				if (!division.cities.includes(city) && ns.corporation.getExpandCityCost() < funds()) {
					log(ns, 'c', `expand city ${city} in ${division.name}`)
					ns.corporation.expandCity(division.name, city)
				}
	}

	async function manageOffice(division, city, priority) {

		if (ns.corporation.getOffice(division.name, city).size < maxEmploees &&
			ns.corporation.getOfficeSizeUpgradeCost(division.name, city, upgradeSize) < funds(priority))
			ns.corporation.upgradeOfficeSize(division.name, city, upgradeSize)

		let vacancy = ns.corporation.getOffice(division.name, city).size - ns.corporation.getOffice(division.name, city).employees.length

		if (!vacancy) return;
		log(ns, 'c', `hire ${vacancy} employees in ${division.name} ${city}`)
		for (let o of Array(vacancy)) {
			let emp = ns.corporation.hireEmployee(division.name, city)
			await ns.corporation.assignJob(division.name, city, emp.name, jobs[5])
		}
	}

	async function manageWarehouse(division, city, priority) {
		if (!ns.corporation.hasWarehouse(division.name, city) &&
			ns.corporation.getPurchaseWarehouseCost() < funds(priority))
			ns.corporation.purchaseWarehouse(division.name, city)

		if (ns.corporation.hasWarehouse(division.name, city) &&
			ns.corporation.getUpgradeWarehouseCost(division.name, city) < funds(priority))
			ns.corporation.upgradeWarehouse(division.name, city)

		// ns.corporation.hasUnlockUpgrade()
		log(ns, 'c', `set true smart supply in ${division.name} ${city}`)
		ns.corporation.setSmartSupply(division.name, city, true)
	}

	function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

	async function manageEmployees(division, city) {
		log(ns, 'c', `manage employees in ${division.name} ${city}`)
		let employees = shuffle(ns.corporation.getOffice(division.name, city).employees)

		let allResearched = true
		for (let research of researches)
			allResearched = ns.corporation.hasResearched(division.name, research) && allResearched

		let divisionJobs = allResearched ? jobs.filter(j => j !== jobs[0]) : jobs

		for (let employee of employees)
			await ns.corporation.assignJob(division.name, city, employee, divisionJobs[Math.floor(Math.random() * divisionJobs.length)])
	}

	async function manageMaterials(division, city, priority) {
		ns.corporation.sellMaterial(division.name, city, materials[2], 'MAX', 'MP')
		ns.corporation.sellMaterial(division.name, city, materials[3], 'MAX', 'MP')

		let size = ns.corporation.getWarehouse(division.name, city).size
		let sizeUsed = ns.corporation.getWarehouse(division.name, city).sizeUsed
		let realEstate = materials[materials.length - 1]

		log(ns, 'i', `in ${division.name} ${city} warehouse size is ${numToString(size)} used ${numToString(sizeUsed)}`)

		if (size / sizeUsed > 2) {
			log(ns, 'c', `buy ${realEstate} in ${division.name} ${city}`)
			if (ns.corporation.hasResearched(division.name, researches[0]) &&
				ns.corporation.getMaterial(division.name, city, realEstate).cost * 1e6 < funds(priority))
				ns.corporation.bulkPurchase(division.name, city, realEstate, 1e6)
		}
	}
}