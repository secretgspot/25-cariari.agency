<script>
	import Nav from '#lib/Nav.svelte';
	import Icon from '#lib/Icon.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const stats = $derived(data.stats);

	// Formatting Helpers
	function formatCurrency(val) {
		if (typeof val !== 'number' || Number.isNaN(val) || val <= 0) return '—';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(val);
	}

	function formatNumber(val) {
		if (typeof val !== 'number' || Number.isNaN(val)) return '0';
		return new Intl.NumberFormat('en-US').format(val);
	}
</script>

<svelte:head>
	<title>Market Intelligence & Stats | Cariari Agency Admin</title>
</svelte:head>

<Nav fixed />

<main class="stats-page">
	<!-- Admin Navigation & Header -->
	<header class="page-header">
		<nav class="admin-breadcrumb" aria-label="Breadcrumb">
			<a href="/admin" class="breadcrumb-link">
				<Icon kind="icon_arrow_left" size="16" />
				<span>Admin Hub</span>
			</a>
			<span class="breadcrumb-sep">/</span>
			<span class="breadcrumb-current">Market Stats</span>
		</nav>

		<div class="title-row">
			<h1 class="gold-text">Market Intelligence & Analytics</h1>
			<p class="header-desc">
				Comprehensive valuation benchmarks, inventory velocity, and buyer demand trends across Real Cariari.
			</p>
		</div>
	</header>

	<!-- 1. TOP-LINE KPI CARDS (THE 6 PILLARS) -->
	<section class="kpi-grid" aria-label="Key Performance Indicators">
		<!-- Active Inventory -->
		<div class="kpi-card hero-kpi">
			<div class="kpi-label">Active Market Inventory</div>
			<div class="kpi-value gold-text">{formatNumber(stats.inventory.active)}</div>
			<div class="kpi-sub">
				<span>{stats.inventory.forSale} For Sale</span>
				<span class="sep">•</span>
				<span>{stats.inventory.forRent} For Rent</span>
				{#if stats.inventory.inactive > 0}
					<span class="sep">•</span>
					<span class="muted-note">{stats.inventory.inactive} Drafts</span>
				{/if}
			</div>
		</div>

		<!-- Median Sale Price -->
		<div class="kpi-card">
			<div class="kpi-label">Median Sale Price</div>
			<div class="kpi-value">{formatCurrency(stats.sales.medianPrice)}</div>
			<div class="kpi-sub">
				<span>Avg: {formatCurrency(stats.sales.averagePrice)}</span>
				{#if stats.sales.totalVolume > 0}
					<span class="sep">•</span>
					<span>Vol: {formatCurrency(stats.sales.totalVolume)}</span>
				{/if}
			</div>
		</div>

		<!-- Median Monthly Rent -->
		<div class="kpi-card">
			<div class="kpi-label">Median Monthly Rent</div>
			<div class="kpi-value">{formatCurrency(stats.rentals.medianRent)}<span class="unit">/mo</span></div>
			<div class="kpi-sub">
				<span>Avg: {formatCurrency(stats.rentals.averageRent)}/mo</span>
				<span class="sep">•</span>
				<span>{stats.rentals.count} active rentals</span>
			</div>
		</div>

		<!-- Construction Price / m2 -->
		<div class="kpi-card">
			<div class="kpi-label">Average Building $/m²</div>
			<div class="kpi-value">{formatCurrency(stats.valuation.averagePricePerM2)}<span class="unit">/m²</span></div>
			<div class="kpi-sub">
				<span>Median: {formatCurrency(stats.valuation.medianPricePerM2)}/m²</span>
				{#if stats.valuation.averageLotPricePerM2 > 0}
					<span class="sep">•</span>
					<span>Lot: {formatCurrency(stats.valuation.averageLotPricePerM2)}/m²</span>
				{/if}
			</div>
		</div>

		<!-- Days on Market (DOM) -->
		<div class="kpi-card">
			<div class="kpi-label">Market Velocity (DOM)</div>
			<div class="kpi-value">{stats.velocity.medianDOM} <span class="unit">days</span></div>
			<div class="kpi-sub">
				<span>Avg: {stats.velocity.averageDOM} days on market</span>
			</div>
		</div>

		<!-- Gross Rental Yield -->
		<div class="kpi-card">
			<div class="kpi-label">Est. Gross Rental Yield</div>
			<div class="kpi-value">{stats.valuation.grossRentalYield > 0 ? `${stats.valuation.grossRentalYield}%` : '—'}</div>
			<div class="kpi-sub">
				<span>Annualized Rent vs. Sale Price</span>
			</div>
		</div>
	</section>

	<!-- 2. TWO-COLUMN ANALYTICS SECTION: PRICING TIERS & CARRYING COSTS -->
	<div class="analytics-row">
		<!-- Left: Sales Price Tier Distribution -->
		<section class="card analytics-card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="properties" size="24" /></span>
					<div>
						<h2>Price Tier Distribution</h2>
						<span class="card-subtitle">Active For Sale inventory segmented by market bracket</span>
					</div>
				</div>
			</div>

			<div class="tier-bars-list">
				{#each stats.sales.priceTiers as tier}
					<div class="tier-item">
						<div class="tier-info">
							<span class="tier-label">{tier.label}</span>
							<span class="tier-count">{tier.count} listings ({tier.percentage}%)</span>
						</div>
						<div class="progress-track" role="progressbar" aria-valuenow={tier.percentage} aria-valuemin="0" aria-valuemax="100">
							<div class="progress-fill" style="width: {tier.percentage}%;"></div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Right: Market Velocity & Carrying Costs -->
		<section class="card analytics-card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="view" size="24" /></span>
					<div>
						<h2>Listing Freshness & Velocity</h2>
						<span class="card-subtitle">Inventory absorption breakdown by listing age</span>
					</div>
				</div>
			</div>

			<div class="velocity-brackets">
				<div class="velocity-box fresh">
					<div class="velocity-badge">Fresh (&lt;30d)</div>
					<div class="velocity-count">{stats.velocity.brackets.fresh.count}</div>
					<div class="velocity-pct">{stats.velocity.brackets.fresh.percentage}% of inventory</div>
					<p class="velocity-desc">Peak buyer curiosity window</p>
				</div>

				<div class="velocity-box active-mid">
					<div class="velocity-badge">Active (30–90d)</div>
					<div class="velocity-count">{stats.velocity.brackets.active.count}</div>
					<div class="velocity-pct">{stats.velocity.brackets.active.percentage}% of inventory</div>
					<p class="velocity-desc">Normal market absorption</p>
				</div>

				<div class="velocity-box aging">
					<div class="velocity-badge">Aging (&gt;90d)</div>
					<div class="velocity-count">{stats.velocity.brackets.aging.count}</div>
					<div class="velocity-pct">{stats.velocity.brackets.aging.percentage}% of inventory</div>
					<p class="velocity-desc">Prime for price revision</p>
				</div>
			</div>

			<div class="carrying-costs-footer">
				<div class="cost-stat">
					<span class="cost-label">Average Monthly HOA / Condo Fee:</span>
					<span class="cost-val">{formatCurrency(stats.carryingCosts.averageHOA)}/mo</span>
				</div>
				<div class="cost-stat">
					<span class="cost-label">Average Annual Property Taxes:</span>
					<span class="cost-val">{formatCurrency(stats.carryingCosts.averageAnnualTax)}/yr</span>
				</div>
			</div>
		</section>
	</div>

	<!-- 3. BEDROOM COMPOSITION & VALUATION MATRIX -->
	<section class="card">
		<div class="card-header">
			<div class="card-title-group">
				<span class="section-icon"><Icon kind="beds" size="24" /></span>
				<div>
					<h2>Bedroom Breakdown & Space Valuation</h2>
					<span class="card-subtitle">Market pricing and construction footprint by bedroom count</span>
				</div>
			</div>
		</div>

		<div class="table-container">
			<table class="stats-table">
				<thead>
					<tr>
						<th>Configuration</th>
						<th>Active Listings</th>
						<th>Avg Sale Price</th>
						<th>Avg Monthly Rent</th>
						<th>Avg Construction Size</th>
					</tr>
				</thead>
				<tbody>
					{#each stats.bedrooms as bed}
						<tr>
							<td class="config-name">
								<strong>{bed.label}</strong>
							</td>
							<td>
								<span class="pill-count">{bed.count} {bed.count === 1 ? 'property' : 'properties'}</span>
							</td>
							<td class="price-val">
								{formatCurrency(bed.avgPrice)}
							</td>
							<td class="rent-val">
								{bed.avgRent > 0 ? `${formatCurrency(bed.avgRent)}/mo` : '—'}
							</td>
							<td class="size-val">
								{bed.avgBuildingSize > 0 ? `${formatNumber(bed.avgBuildingSize)} m²` : '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<!-- 4. LEAD & INQUIRY DEMAND INTELLIGENCE -->
	<section class="card demand-section">
		<div class="card-header">
			<div class="card-title-group">
				<span class="section-icon"><Icon kind="email" size="24" /></span>
				<div>
					<h2>Buyer & Renter Demand Intelligence</h2>
					<span class="card-subtitle">Inquiry activity signals and most popular listings in Real Cariari</span>
				</div>
			</div>
			
			<div class="demand-pills">
				<span class="status-pill pill-new">
					{stats.demand.status.new} New Leads
				</span>
				<span class="status-pill pill-contacted">
					{stats.demand.status.contacted} In Progress
				</span>
				<span class="status-pill pill-closed">
					{stats.demand.status.closed} Closed
				</span>
			</div>
		</div>

		<div class="demand-metrics-strip">
			<div class="demand-stat-box">
				<span class="demand-stat-num">{stats.demand.totalInquiries}</span>
				<span class="demand-stat-label">Total Leads Received</span>
			</div>
			<div class="demand-stat-box">
				<span class="demand-stat-num">{stats.demand.recentInquiries}</span>
				<span class="demand-stat-label">Leads in Last 30 Days</span>
			</div>
			<div class="demand-stat-box">
				<span class="demand-stat-num">{stats.demand.demandIndex}</span>
				<span class="demand-stat-label">Inquiries / Listing Ratio</span>
			</div>
		</div>

		<!-- Top 5 Most Inquired Properties -->
		<div class="top-properties-block">
			<h3 class="top-title">Top 5 Most Inquired Listings</h3>
			{#if stats.demand.topProperties.length === 0}
				<div class="empty-state">
					<p>No inquiry data recorded yet for active listings.</p>
				</div>
			{:else}
				<div class="top-grid">
					{#each stats.demand.topProperties as prop, index}
						<a href="/{prop.id}" class="top-prop-card" title="View Property {prop.msl}">
							<div class="top-rank">#{index + 1}</div>
							{#if prop.photo}
								<img src={prop.photo} alt={prop.msl} class="top-thumb" loading="lazy" />
							{:else}
								<div class="top-thumb-placeholder">
									<Icon kind="home" size="32" />
								</div>
							{/if}
							<div class="top-prop-info">
								<div class="top-msl-row">
									<span class="top-msl">{prop.msl}</span>
									<span class="inquiry-badge">🔥 {prop.inquiryCount} {prop.inquiryCount === 1 ? 'inquiry' : 'inquiries'}</span>
								</div>
								<div class="top-address">{prop.address}</div>
								<div class="top-pricing">
									{#if prop.price}
										<span class="top-price">{formatCurrency(prop.price)}</span>
									{/if}
									{#if prop.rent}
										<span class="top-rent">{formatCurrency(prop.rent)}/mo</span>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	/* ==========================================================================
	   ADMIN STATS & MARKET INTELLIGENCE PAGE STYLES
	   ========================================================================== */

	.stats-page {
		max-width: 1240px;
		margin: 0 auto;
		padding: calc(var(--size-8) * 1.5) var(--size-4) var(--size-8);
		color: var(--text-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
		border-bottom: 1px solid var(--surface-3);
		padding-bottom: var(--size-5);
	}

	.admin-breadcrumb {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		font-size: 0.9rem;
	}

	.breadcrumb-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-2);
		text-decoration: none;
		font-weight: 600;
		transition: color var(--transition);

		&:hover {
			color: var(--accent);
		}
	}

	.breadcrumb-sep {
		color: var(--surface-4);
	}

	.breadcrumb-current {
		color: var(--text-1);
		font-weight: 600;
	}

	.title-row {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	h1 {
		font-size: clamp(2rem, 3.5vw, 2.6rem);
		font-weight: 700;
		line-height: 1.15;
		margin: var(--size-2) 0;
	}

	.header-desc {
		font-size: 1rem;
		color: var(--text-2);
		max-width: 680px;
	}

	.gold-text {
		background-image: var(--gold-text);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* -------------------------------------------------------------
	   KPI GRID
	   ------------------------------------------------------------- */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--size-4);
	}

	.kpi-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-4) var(--size-5);
		box-shadow: var(--shadow-1);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--size-2);
		transition: border-color var(--transition), transform var(--transition);

		&:hover {
			border-color: var(--surface-4);
			transform: translateY(-2px);
		}
	}

	.hero-kpi {
		border-color: rgba(212, 175, 55, 0.4);
		background: linear-gradient(135deg, var(--surface-1) 0%, rgba(212, 175, 55, 0.06) 100%);
	}

	.kpi-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.kpi-value {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.5px;
		color: var(--text-1);

		.unit {
			font-size: 1rem;
			font-weight: 500;
			color: var(--text-2);
			margin-left: 2px;
		}
	}

	.kpi-sub {
		font-size: 0.85rem;
		color: var(--text-2);
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;

		.sep {
			opacity: 0.4;
		}

		.muted-note {
			opacity: 0.7;
		}
	}

	/* -------------------------------------------------------------
	   CARDS & ANALYTICS LAYOUT
	   ------------------------------------------------------------- */
	.analytics-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: var(--size-5);
	}

	.card {
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-5);
		box-shadow: var(--shadow-2);
		backdrop-filter: blur(8px);
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--size-3);
		margin-bottom: var(--size-4);
		padding-bottom: var(--size-3);
		border-bottom: 1px solid var(--surface-3);
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: var(--size-3);

		h2 {
			font-size: 1.25rem;
			font-weight: 700;
			margin: 0;
		}
	}

	.card-subtitle {
		font-size: 0.85rem;
		color: var(--text-2);
	}

	.section-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--surface-2);
		border-radius: var(--radius-2);
		color: var(--accent);
		border: 1px solid var(--surface-3);
	}

	/* Tier progress bars */
	.tier-bars-list {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.tier-item {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tier-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
	}

	.tier-label {
		font-weight: 600;
	}

	.tier-count {
		color: var(--text-2);
	}

	.progress-track {
		height: 8px;
		background: var(--surface-2);
		border-radius: var(--radius-round);
		overflow: hidden;
		border: 1px solid var(--surface-3);
	}

	.progress-fill {
		height: 100%;
		background: var(--gradient-gold);
		border-radius: var(--radius-round);
		transition: width 0.3s ease;
	}

	/* Velocity Brackets */
	.velocity-brackets {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: var(--size-3);
		margin-bottom: var(--size-4);
	}

	.velocity-box {
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;

		&.fresh {
			border-color: rgba(46, 160, 67, 0.4);
		}
		&.active-mid {
			border-color: rgba(212, 175, 55, 0.4);
		}
		&.aging {
			border-color: rgba(219, 109, 40, 0.4);
		}
	}

	.velocity-badge {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		color: var(--text-2);
	}

	.velocity-count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-1);
	}

	.velocity-pct {
		font-size: 0.8rem;
		color: var(--text-2);
	}

	.velocity-desc {
		font-size: 0.75rem;
		color: var(--text-2);
		margin-top: 4px;
		line-height: 1.2;
	}

	.carrying-costs-footer {
		border-top: 1px solid var(--surface-3);
		padding-top: var(--size-3);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.cost-stat {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
	}

	.cost-label {
		color: var(--text-2);
	}

	.cost-val {
		font-weight: 600;
		color: var(--text-1);
	}

	/* -------------------------------------------------------------
	   TABLES
	   ------------------------------------------------------------- */
	.table-container {
		overflow-x: auto;
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;

		th {
			text-align: left;
			padding: var(--size-3) var(--size-4);
			background: var(--surface-2);
			color: var(--text-2);
			font-weight: 600;
			font-size: 0.85rem;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			border-bottom: 1px solid var(--surface-3);
		}

		td {
			padding: var(--size-3) var(--size-4);
			border-bottom: 1px solid var(--surface-3);
		}

		tbody tr:hover {
			background: var(--surface-2);
		}
	}

	.pill-count {
		display: inline-block;
		padding: 2px 10px;
		background: var(--surface-3);
		border-radius: var(--radius-round);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.price-val {
		font-weight: 600;
		color: var(--text-1);
	}

	.rent-val, .size-val {
		color: var(--text-2);
	}

	/* -------------------------------------------------------------
	   DEMAND & INQUIRIES SECTION
	   ------------------------------------------------------------- */
	.demand-pills {
		display: flex;
		gap: var(--size-2);
		flex-wrap: wrap;
	}

	.status-pill {
		padding: 4px 10px;
		border-radius: var(--radius-round);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;

		&.pill-new {
			background: rgba(33, 150, 243, 0.15);
			color: #64b5f6;
			border: 1px solid rgba(33, 150, 243, 0.3);
		}
		&.pill-contacted {
			background: rgba(255, 152, 0, 0.15);
			color: #ffb74d;
			border: 1px solid rgba(255, 152, 0, 0.3);
		}
		&.pill-closed {
			background: rgba(76, 175, 80, 0.15);
			color: #81c784;
			border: 1px solid rgba(76, 175, 80, 0.3);
		}
	}

	.demand-metrics-strip {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--size-4);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-4);
		margin-bottom: var(--size-5);
	}

	.demand-stat-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2px;
	}

	.demand-stat-num {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--accent);
	}

	.demand-stat-label {
		font-size: 0.85rem;
		color: var(--text-2);
	}

	.top-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: var(--size-3);
	}

	.top-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--size-4);
	}

	.top-prop-card {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		text-decoration: none;
		color: inherit;
		position: relative;
		overflow: hidden;
		transition: border-color var(--transition), transform var(--transition);

		&:hover {
			border-color: var(--accent);
			transform: translateY(-2px);
		}
	}

	.top-rank {
		position: absolute;
		top: 6px;
		left: 6px;
		background: rgba(18, 18, 20, 0.85);
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: var(--radius-1);
		z-index: 2;
	}

	.top-thumb {
		width: 76px;
		height: 76px;
		border-radius: var(--radius-2);
		object-fit: cover;
		flex-shrink: 0;
	}

	.top-thumb-placeholder {
		width: 76px;
		height: 76px;
		border-radius: var(--radius-2);
		background: var(--surface-3);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-2);
		flex-shrink: 0;
	}

	.top-prop-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow: hidden;
	}

	.top-msl-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
	}

	.top-msl {
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--text-1);
	}

	.inquiry-badge {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent);
		background: rgba(212, 175, 55, 0.12);
		padding: 2px 6px;
		border-radius: var(--radius-round);
	}

	.top-address {
		font-size: 0.8rem;
		color: var(--text-2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.top-pricing {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		margin-top: 2px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.top-price {
		color: var(--text-1);
	}

	.top-rent {
		color: var(--accent);
	}

	.empty-state {
		text-align: center;
		padding: var(--size-5);
		color: var(--text-2);
	}

	/* -------------------------------------------------------------
	   PRINT PRESENTATION MODE
	   ------------------------------------------------------------- */
	@media print {
		:global(nav),
		:global(.form-logout) {
			display: none !important;
		}

		.stats-page {
			padding: 0;
			max-width: 100%;
			color: #000 !important;
			background: #fff !important;
		}

		.gold-text {
			background: none !important;
			-webkit-text-fill-color: #000 !important;
			color: #000 !important;
		}

		.card, .kpi-card, .velocity-box, .demand-metrics-strip, .top-prop-card {
			background: #fff !important;
			border: 1px solid #ccc !important;
			box-shadow: none !important;
			color: #000 !important;
		}

		.kpi-value, .velocity-count, .demand-stat-num {
			color: #000 !important;
		}
	}
</style>
