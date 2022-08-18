import { log, stringify, numToString } from 'core.js'

/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog()
	ns.tail()

	let upgradeSize = 15
	let industries = ['Agriculture', 'Healthcare']
	let upgrades = ['Smart Storage', 'Smart Factories', 'Wilson Analytics', 'Neural Accelerators', 'Project Insight', 'Nuoptimal Nootropic Injector Implants', 'FocusWires', 'DreamSense', 'Speech Processor Implants', 'ABC SalesBots']
	let unlocks = ['Warehouse API', 'Office API', 'Smart Supply', 'Shady Accounting', 'Government Partnership', 'Export', 'Market Research - Demand', 'Shady Accounting', 'Market Data - Competition']
	let cities = ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven']
	let jobs = ['Operations', 'Engineer', 'Business', 'Management', 'Research & Development', 'Training']
	let researches = ['Bulk Purchasing', 'Hi-Tech R&D Laboratory', 'AutoBrew', 'AutoPartyManager', 'Automatic Drug Administration', 'Go-Juice', 'CPH4 Injections', 'Drones', 'Drones - Assembly', 'Drones - Transport', 'HRBuddy-Recruitment', 'HRBuddy-Training', 'JoyWire', 'Market-TA.I', 'Market-TA.II', 'Overclock', 'Sti.mu', 'Self-Correcting Assemblers']
	let materials = ['Water', 'Energy', 'Food', 'Plants', 'AI Cores', 'Robots', 'Hardware', 'Real Estate']

	let industriConfigs = [
		{
			name: 'Agriculture',
			ownproduct: false,
			products: ['Food', 'Plants'],
			booster: 'Real Estate',
			maxemp: 150
		},
		{
			name: 'Healthcare',
			ownproduct: true,
			products: [],
			booster: null,
			maxemp: 120
		}
	]

	let config = (name) => industriConfigs.find(c => c.name == name)
	let funds = () => ns.corporation.getCorporation().funds / 2

	ns.corporation.createCorporation('AIcorp', true)

	while (true) {
		let corp = ns.corporation.getCorporation()

		//await manageUnlocks()

		//await manageExpansion(corp, 2)
		//await manageDividends(corp)
		//await manageShares(corp)
		//await manageUpgrades(100)

		for (let division of corp.divisions) {
			await manageResearches(division)
			
			for (let city of division.cities) {
				await manageOffice(division, city, 30)
				await manageEmployees(division, city)
				await manageWarehouse(division, city, 20)
				//await manageMaterials(division, city, 10)
				//await manageProducts(division, city, 1)
			}
		}

		//ns.corporation.goPublic()
		await ns.sleep(10e3)
	}

	async function manageUpgrades() {
		for (let upgrade of upgrades.slice(0, 2))
			if (ns.corporation.getUpgradeLevelCost(upgrade) < funds() / 10) {
				log(ns, 'c', `upgrade ${upgrade}`)
				ns.corporation.levelUpgrade(upgrade)
			}
	}

	async function manageUnlocks() {
		for (let unlock of unlocks)
			if (!ns.corporation.hasUnlockUpgrade(unlock))
				if (ns.corporation.getUnlockUpgradeCost(unlock) > funds()) return
				else ns.corporation.unlockUpgrade(unlock)
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

	async function manageOffice(division, city) {
		if (!ns.corporation.hasUnlockUpgrade(unlocks[2])) return

		if (ns.corporation.getOffice(division.name, city).size < config(division.name).maxemp &&
			ns.corporation.getOfficeSizeUpgradeCost(division.name, city, upgradeSize) < funds())
			ns.corporation.upgradeOfficeSize(division.name, city, upgradeSize)

		let office = ns.corporation.getOffice(division.name, city)
		let vacancy = office.size - office.employees.length

		if (!vacancy) return

		log(ns, 'c', `hire ${vacancy} employees in ${division.name} ${city}`)
		for (let i = 0; i < vacancy; i++) {
			let emp = ns.corporation.hireEmployee(division.name, city)
			await ns.corporation.assignJob(division.name, city, emp.name, jobs[5])
		}
	}

	async function manageWarehouse(division, city) {
		if (!ns.corporation.hasUnlockUpgrade(unlocks[1])) return

		ns.corporation.setSmartSupply(division.name, city, true)
		log(ns, 'c', `set true smart supply in ${division.name} ${city}`)

		/*
		if (!ns.corporation.hasWarehouse(division.name, city) &&
			ns.corporation.getPurchaseWarehouseCost() < funds())
			ns.corporation.purchaseWarehouse(division.name, city)

		if (ns.corporation.hasWarehouse(division.name, city) &&
			ns.corporation.getUpgradeWarehouseCost(division.name, city) < funds())
			ns.corporation.upgradeWarehouse(division.name, city)
		*/
	}

	function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

	async function manageEmployees(division, city) {
		if (!ns.corporation.hasUnlockUpgrade(unlocks[2])) return

		log(ns, 'c', `manage employees in ${division.name} ${city}`)

		let office = ns.corporation.getOffice(division.name, city)
		let employees = shuffle(office.employees)

		let allResearched = true
		for (let research of researches)
			allResearched = ns.corporation.hasResearched(division.name, research) && allResearched

		let divisionJobs = allResearched ? jobs.filter(j => j !== jobs[4]) : jobs

		for (let i = 0; i < employees.length; i++) {
			await ns.corporation.assignJob(division.name, city, employees[i], divisionJobs[i % divisionJobs.length])
			log(ns, 'c', `assign ${employees[i]} to ${divisionJobs[i % divisionJobs.length]}`)
		}
	}

	async function manageMaterials(division, city) {
		ns.corporation.sellMaterial(division.name, city, materials[2], 'MAX', 'MP')
		ns.corporation.sellMaterial(division.name, city, materials[3], 'MAX', 'MP')

		let size = ns.corporation.getWarehouse(division.name, city).size
		let sizeUsed = ns.corporation.getWarehouse(division.name, city).sizeUsed
		let realEstate = materials[materials.length - 1]

		log(ns, 'i', `in ${division.name} ${city} warehouse size is ${numToString(size)} used ${numToString(sizeUsed)}`)

		if (size / sizeUsed > 2) {
			log(ns, 'c', `buy ${realEstate} in ${division.name} ${city}`)
			if (ns.corporation.hasResearched(division.name, researches[0]) &&
				ns.corporation.getMaterial(division.name, city, realEstate).cost * 1e6 < funds())
				try { ns.corporation.bulkPurchase(division.name, city, realEstate, 1e6) }
				catch (e) { log(ns, 'e', `${stringify(e)}`) }
		}
	}
}