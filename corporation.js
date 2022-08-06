/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL")
	ns.clearLog()
	ns.tail()

	var industries = ["Agriculture", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
	var products = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]

	var owner = ns.args[0] == "self"

	var corp = ns.corporation.getCorporation()
	ns.print(JSON.stringify(corp, null, 2))

	if (ns.getPlayer().money < 159e9 && owner) return

	if (!corp) ns.corporation.createCorporation("...")

	corp = ns.corporation.getCorporation()

	ns.corporation.getExpandIndustryCost()

	ns.corporation.expandIndustry("Agriculture", "Agriculture")
}