import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { median, average, calculateMarketStats } from './marketStats.js';

describe('Market Stats Calculation Engine', () => {
	test('median handles empty, odd, and even arrays', () => {
		assert.equal(median([]), 0);
		assert.equal(median([100]), 100);
		assert.equal(median([10, 20, 30]), 20);
		assert.equal(median([10, 20, 30, 40]), 25);
		assert.equal(median([null, undefined, NaN, 50, 150]), 100);
	});

	test('average handles empty and non-numeric inputs', () => {
		assert.equal(average([]), 0);
		assert.equal(average([10, 20, 30]), 20);
		assert.equal(average([null, 100, 200]), 150);
	});

	test('calculates accurate real estate metrics with sample properties and inquiries', () => {
		const baseDate = new Date('2026-11-23T12:00:00Z');

		const sampleProperties = [
			{
				id: 'prop-1',
				msl: '101A',
				address: 'Condo Bella Vista',
				price: 300000,
				rent: null,
				building_size: 150,
				lot_size: 200,
				beds: 3,
				baths: 2,
				fees: 250,
				taxes: 1200,
				is_active: true,
				created_at: '2026-11-13T12:00:00Z' // 10 days ago (Fresh)
			},
			{
				id: 'prop-2',
				msl: '102B',
				address: 'Villa Cariari',
				price: 600000,
				rent: 3000,
				building_size: 300,
				lot_size: 500,
				beds: 4,
				baths: 3,
				fees: 350,
				taxes: 2400,
				is_active: true,
				created_at: '2026-10-09T12:00:00Z' // 45 days ago (Active)
			},
			{
				id: 'prop-3',
				msl: '103C',
				address: 'Studio Real',
				price: null,
				rent: 1200,
				building_size: 60,
				lot_size: 0,
				beds: 1,
				baths: 1,
				fees: 100,
				taxes: 400,
				is_active: true,
				created_at: '2026-07-26T12:00:00Z' // 120 days ago (Aging)
			},
			{
				id: 'prop-4',
				msl: '104D',
				address: 'Draft House',
				price: 450000,
				rent: null,
				is_active: false,
				created_at: '2026-11-01T12:00:00Z'
			}
		];

		const sampleInquiries = [
			{ id: 'inq-1', property_id: 'prop-2', status: 'new', created_at: '2026-11-20T10:00:00Z' },
			{ id: 'inq-2', property_id: 'prop-2', status: 'contacted', created_at: '2026-11-21T10:00:00Z' },
			{ id: 'inq-3', property_id: 'prop-1', status: 'closed', created_at: '2026-11-22T10:00:00Z' }
		];

		const stats = calculateMarketStats(sampleProperties, sampleInquiries, { now: baseDate });

		// Inventory checks
		assert.equal(stats.inventory.total, 4);
		assert.equal(stats.inventory.active, 3);
		assert.equal(stats.inventory.inactive, 1);
		assert.equal(stats.inventory.forSale, 2);
		assert.equal(stats.inventory.forRent, 2);
		assert.equal(stats.inventory.dual, 1);

		// Sales Pricing
		assert.equal(stats.sales.count, 2);
		assert.equal(stats.sales.totalVolume, 900000);
		assert.equal(stats.sales.averagePrice, 450000);
		assert.equal(stats.sales.medianPrice, 450000);

		// Rentals Pricing
		assert.equal(stats.rentals.count, 2);
		assert.equal(stats.rentals.totalMonthlyVolume, 4200);
		assert.equal(stats.rentals.averageRent, 2100);
		assert.equal(stats.rentals.medianRent, 2100);

		// Price per m²:
		// prop-1: 300000 / 150 = 2000
		// prop-2: 600000 / 300 = 2000
		assert.equal(stats.valuation.averagePricePerM2, 2000);
		assert.equal(stats.valuation.medianPricePerM2, 2000);

		// DOM brackets:
		// 10 days (<30 -> fresh)
		// 45 days (30-90 -> active)
		// 120 days (>90 -> aging)
		assert.equal(stats.velocity.brackets.fresh.count, 1);
		assert.equal(stats.velocity.brackets.active.count, 1);
		assert.equal(stats.velocity.brackets.aging.count, 1);

		// Inquiries & Top Properties
		assert.equal(stats.demand.totalInquiries, 3);
		assert.equal(stats.demand.status.new, 1);
		assert.equal(stats.demand.status.contacted, 1);
		assert.equal(stats.demand.status.closed, 1);
		assert.equal(stats.demand.topProperties.length, 2);
		assert.equal(stats.demand.topProperties[0].id, 'prop-2');
		assert.equal(stats.demand.topProperties[0].inquiryCount, 2);
		assert.equal(stats.demand.topProperties[1].id, 'prop-1');
		assert.equal(stats.demand.topProperties[1].inquiryCount, 1);
	});

	test('handles empty dataset gracefully without division by zero', () => {
		const stats = calculateMarketStats([], []);
		assert.equal(stats.inventory.total, 0);
		assert.equal(stats.inventory.active, 0);
		assert.equal(stats.sales.averagePrice, 0);
		assert.equal(stats.valuation.averagePricePerM2, 0);
		assert.equal(stats.velocity.averageDOM, 0);
		assert.equal(stats.demand.totalInquiries, 0);
		assert.deepEqual(stats.demand.topProperties, []);
	});
});
