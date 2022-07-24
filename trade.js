/** @param {NS} ns */
export async function main(ns) {
	let stockSymbols = ns.stock.getSymbols();
	let portfolio = [];

	const BUY_FC_THRESH = 0.65;
	const SELL_FC_THRESH = 0.5;
	const PROFIT_THRESH = 2.5;
	const STOP_LOSS = 0.4;
	const SPEND_RATIO = 0.25;

	for (const stock of stockSymbols) {
		let pos = ns.stock.getPosition(stock);
		if (pos[0] > 0) {
			portfolio.push({ sym: stock, value: pos[1], shares: pos[0] })
		}
	};

	while (true) {
		await ns.sleep(6000);
		
		if (ns.getServerMoneyAvailable('home') < 100000000) continue;
		 
		for (const stock of stockSymbols) {
			if (portfolio.findIndex(obj => obj.sym === stock) !== -1) {
				let i = portfolio.findIndex(obj => obj.sym === stock);

				if (ns.stock.getAskPrice(stock) >= portfolio[i].value * PROFIT_THRESH)
					sellStock(stock);
				else if (ns.stock.getForecast(stock) < STOP_LOSS)
					sellStock(stock);

			}
			else if (ns.stock.getForecast(stock) >= BUY_FC_THRESH) {
				buyStock(stock);
			}
		}

	}

	function buyStock(stock) {
		let stockPrice = ns.stock.getAskPrice(stock);
		let shares = stockBuyQuantCalc(stockPrice, stock);

		if (ns.stock.getVolatility(stock) <= 0.05) {
			ns.stock.buy(stock, shares);
			portfolio.push({ sym: stock, value: stockPrice, shares: shares });
		}
	}

	function sellStock(stock) {
		let position = ns.stock.getPosition(stock);
		let forecast = ns.stock.getForecast(stock);
		if (forecast < SELL_FC_THRESH) {
			let i = portfolio.findIndex(obj => obj.sym === stock);
			portfolio.splice(i, 1);
			ns.stock.sell(stock, position[0]);
		}
	};

	function stockBuyQuantCalc(stockPrice, stock) {
		let playerMoney = ns.getServerMoneyAvailable('home');
		let maxSpend = playerMoney * SPEND_RATIO;
		let calcShares = maxSpend / stockPrice;
		let maxShares = ns.stock.getMaxShares(stock);

		if (calcShares > maxShares)
			return maxShares;
		else
			return calcShares;
	}
}