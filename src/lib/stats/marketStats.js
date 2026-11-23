/**
 * Real Estate Market Analytics Engine for Cariari Agency
 * Computes essential valuation, inventory, velocity, and lead demand statistics.
 */

/**
 * Calculates the median of an array of numbers.
 * @param {number[]} numbers
 * @returns {number}
 */
export function median(numbers) {
	if (!Array.isArray(numbers)) return 0;
	const valid = numbers.filter((n) => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n));
	if (valid.length === 0) return 0;
	const sorted = [...valid].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 !== 0) {
		return Math.round(sorted[mid]);
	}
	return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Calculates the mean/average of an array of numbers.
 * @param {number[]} numbers
 * @returns {number}
 */
export function average(numbers) {
	if (!Array.isArray(numbers)) return 0;
	const valid = numbers.filter((n) => typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n));
	if (valid.length === 0) return 0;
	const sum = valid.reduce((acc, curr) => acc + curr, 0);
	return Math.round(sum / valid.length);
}

/**
 * Computes comprehensive real estate market statistics.
 * @param {Array<Record<string, any>>} properties
 * @param {Array<Record<string, any>>} [inquiries=[]]
 * @param {{ now?: Date | string | number }} [options={}]
 */
export function calculateMarketStats(properties = [], inquiries = [], options = {}) {
	const refTime = options.now ? new Date(options.now).getTime() : Date.now();
	const ONE_DAY_MS = 1000 * 60 * 60 * 24;

	const allProps = Array.isArray(properties) ? properties : [];
	const allInquiries = Array.isArray(inquiries) ? inquiries : [];

	const totalListings = allProps.length;
	const activeListings = allProps.filter((p) => p.is_active !== false);
	const inactiveListings = allProps.filter((p) => p.is_active === false);

	// -------------------------------------------------------------
	// 1. Pricing & Valuation Benchmarks (Active Listings)
	// -------------------------------------------------------------
	const saleProps = activeListings.filter((p) => typeof p.price === 'number' && p.price > 0);
	const rentProps = activeListings.filter((p) => typeof p.rent === 'number' && p.rent > 0);
	const dualProps = activeListings.filter(
		(p) => typeof p.price === 'number' && p.price > 0 && typeof p.rent === 'number' && p.rent > 0
	);

	const salePrices = saleProps.map((p) => p.price);
	const rentPrices = rentProps.map((p) => p.rent);

	const totalSaleVolume = salePrices.reduce((acc, p) => acc + p, 0);
	const totalMonthlyRent = rentPrices.reduce((acc, r) => acc + r, 0);

	const medianSalePrice = median(salePrices);
	const averageSalePrice = average(salePrices);
	const minSalePrice = salePrices.length ? Math.min(...salePrices) : 0;
	const maxSalePrice = salePrices.length ? Math.max(...salePrices) : 0;

	const medianRent = median(rentPrices);
	const averageRent = average(rentPrices);
	const minRent = rentPrices.length ? Math.min(...rentPrices) : 0;
	const maxRent = rentPrices.length ? Math.max(...rentPrices) : 0;

	// Construction Price / m²
	const buildingRates = saleProps
		.filter((p) => typeof p.building_size === 'number' && p.building_size > 0)
		.map((p) => p.price / p.building_size);

	const medianPricePerM2 = median(buildingRates);
	const averagePricePerM2 = average(buildingRates);

	// Lot Price / m²
	const lotRates = saleProps
		.filter((p) => typeof p.lot_size === 'number' && p.lot_size > 0)
		.map((p) => p.price / p.lot_size);

	const medianLotPricePerM2 = median(lotRates);
	const averageLotPricePerM2 = average(lotRates);

	// Rental Rate / m² / month
	const rentM2Rates = rentProps
		.filter((p) => typeof p.building_size === 'number' && p.building_size > 0)
		.map((p) => p.rent / p.building_size);

	const averageRentPerM2 = average(rentM2Rates);

	// Gross Rental Yield (%)
	let grossRentalYield = 0;
	if (dualProps.length > 0) {
		const yields = dualProps.map((p) => ((p.rent * 12) / p.price) * 100);
		grossRentalYield = Number((yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(2));
	} else if (averageSalePrice > 0 && averageRent > 0) {
		grossRentalYield = Number((((averageRent * 12) / averageSalePrice) * 100).toFixed(2));
	}

	// -------------------------------------------------------------
	// 2. Carrying Costs (HOA & Property Taxes)
	// -------------------------------------------------------------
	const feeProps = activeListings.filter((p) => typeof p.fees === 'number' && p.fees > 0);
	const averageHOA = average(feeProps.map((p) => p.fees));

	const taxProps = activeListings.filter((p) => typeof p.taxes === 'number' && p.taxes > 0);
	const averageAnnualTax = average(taxProps.map((p) => p.taxes));

	// -------------------------------------------------------------
	// 3. Market Velocity: Days on Market (DOM)
	// -------------------------------------------------------------
	const domValues = activeListings
		.filter((p) => p.created_at)
		.map((p) => {
			const createdTime = new Date(p.created_at).getTime();
			return Math.max(0, Math.floor((refTime - createdTime) / ONE_DAY_MS));
		});

	const averageDOM = average(domValues);
	const medianDOM = median(domValues);

	let freshCount = 0; // < 30 days
	let activeCount = 0; // 30 - 90 days
	let agingCount = 0; // > 90 days

	for (const dom of domValues) {
		if (dom < 30) freshCount++;
		else if (dom <= 90) activeCount++;
		else agingCount++;
	}

	const totalActiveWithDOM = domValues.length || 1;
	const domBrackets = {
		fresh: { count: freshCount, percentage: Math.round((freshCount / totalActiveWithDOM) * 100) },
		active: { count: activeCount, percentage: Math.round((activeCount / totalActiveWithDOM) * 100) },
		aging: { count: agingCount, percentage: Math.round((agingCount / totalActiveWithDOM) * 100) }
	};

	// -------------------------------------------------------------
	// 4. Price Tier Distribution (Sales)
	// -------------------------------------------------------------
	const totalSaleCount = saleProps.length || 1;
	let tierUnder250k = 0;
	let tier250kTo500k = 0;
	let tier500kTo850k = 0;
	let tierOver850k = 0;

	for (const p of saleProps) {
		if (p.price < 250000) tierUnder250k++;
		else if (p.price <= 500000) tier250kTo500k++;
		else if (p.price <= 850000) tier500kTo850k++;
		else tierOver850k++;
	}

	const salePriceTiers = [
		{ label: 'Under $250K', count: tierUnder250k, percentage: Math.round((tierUnder250k / totalSaleCount) * 100) },
		{ label: '$250K - $500K', count: tier250kTo500k, percentage: Math.round((tier250kTo500k / totalSaleCount) * 100) },
		{ label: '$500K - $850K', count: tier500kTo850k, percentage: Math.round((tier500kTo850k / totalSaleCount) * 100) },
		{ label: '$850K+ (Luxury)', count: tierOver850k, percentage: Math.round((tierOver850k / totalSaleCount) * 100) }
	];

	// -------------------------------------------------------------
	// 5. Bedroom Breakdown & Pricing
	// -------------------------------------------------------------
	const bedCategories = [
		{ label: '1 - 2 Beds', filter: (b) => b <= 2 && b > 0 },
		{ label: '3 Beds', filter: (b) => b === 3 },
		{ label: '4 Beds', filter: (b) => b === 4 },
		{ label: '5+ Beds', filter: (b) => b >= 5 }
	];

	const bedroomBreakdown = bedCategories.map((cat) => {
		const matched = activeListings.filter((p) => typeof p.beds === 'number' && cat.filter(p.beds));
		const prices = matched.filter((p) => p.price && p.price > 0).map((p) => p.price);
		const rents = matched.filter((p) => p.rent && p.rent > 0).map((p) => p.rent);
		const sizes = matched.filter((p) => p.building_size && p.building_size > 0).map((p) => p.building_size);

		return {
			label: cat.label,
			count: matched.length,
			avgPrice: average(prices),
			avgRent: average(rents),
			avgBuildingSize: average(sizes)
		};
	});

	// -------------------------------------------------------------
	// 6. Lead & Demand Funnel (Inquiries)
	// -------------------------------------------------------------
	const totalInquiries = allInquiries.length;
	const thirtyDaysAgo = refTime - 30 * ONE_DAY_MS;
	const recentInquiries = allInquiries.filter((inq) => {
		if (!inq.created_at) return false;
		return new Date(inq.created_at).getTime() >= thirtyDaysAgo;
	}).length;

	let newCount = 0;
	let contactedCount = 0;
	let closedCount = 0;

	const inquiryCountsByPropId = new Map();

	for (const inq of allInquiries) {
		const st = (inq.status || 'new').toLowerCase();
		if (st === 'contacted') contactedCount++;
		else if (st === 'closed') closedCount++;
		else newCount++;

		if (inq.property_id) {
			inquiryCountsByPropId.set(inq.property_id, (inquiryCountsByPropId.get(inq.property_id) || 0) + 1);
		}
	}

	const topInquiredProperties = Array.from(inquiryCountsByPropId.entries())
		.map(([propId, count]) => {
			const prop = allProps.find((p) => p.id === propId);
			return {
				id: propId,
				msl: prop?.msl || 'N/A',
				address: prop?.address || 'Real Cariari',
				price: prop?.price || null,
				rent: prop?.rent || null,
				photo: prop?.photo || null,
				beds: prop?.beds ?? null,
				baths: prop?.baths ?? null,
				building_size: prop?.building_size ?? null,
				inquiryCount: count
			};
		})
		.sort((a, b) => b.inquiryCount - a.inquiryCount)
		.slice(0, 5);

	const demandIndex = activeListings.length > 0 ? Number((totalInquiries / activeListings.length).toFixed(1)) : 0;

	return {
		inventory: {
			total: totalListings,
			active: activeListings.length,
			inactive: inactiveListings.length,
			forSale: saleProps.length,
			forRent: rentProps.length,
			dual: dualProps.length
		},
		sales: {
			count: saleProps.length,
			totalVolume: totalSaleVolume,
			medianPrice: medianSalePrice,
			averagePrice: averageSalePrice,
			minPrice: minSalePrice,
			maxPrice: maxSalePrice,
			priceTiers: salePriceTiers
		},
		rentals: {
			count: rentProps.length,
			totalMonthlyVolume: totalMonthlyRent,
			medianRent,
			averageRent,
			minRent,
			maxRent
		},
		valuation: {
			medianPricePerM2,
			averagePricePerM2,
			medianLotPricePerM2,
			averageLotPricePerM2,
			averageRentPerM2,
			grossRentalYield
		},
		carryingCosts: {
			averageHOA,
			averageAnnualTax
		},
		velocity: {
			averageDOM,
			medianDOM,
			brackets: domBrackets
		},
		bedrooms: bedroomBreakdown,
		demand: {
			totalInquiries,
			recentInquiries,
			demandIndex,
			status: {
				new: newCount,
				contacted: contactedCount,
				closed: closedCount
			},
			topProperties: topInquiredProperties
		}
	};
}
