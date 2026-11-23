<script>
	import Nav from '#lib/Nav.svelte';
	import Icon from '#lib/Icon.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard | Cariari Agency</title>
</svelte:head>

<Nav fixed />

<main class="admin-hub-page">
	<header class="page-header">
		<div class="header-badge">
			<span class="badge-icon">🔥</span>
			<span class="badge-text">Administrator Control Panel</span>
		</div>
		<h1 class="gold-text">Agency Administration</h1>
		<p class="header-desc">
			Welcome to the Cariari Agency central administration hub. Choose a dedicated management console below.
		</p>
	</header>

	<section class="admin-sections-grid" aria-label="Admin Control Modules">
		<!-- Section 1: Market Stats & Analytics -->
		<a href="/admin/stats" class="section-card stats-module">
			<div class="card-top">
				<div class="module-icon">
					<Icon kind="receipt" size="32" />
				</div>
				<span class="module-tag">Analytics</span>
			</div>

			<div class="card-body">
				<h2>Market Intelligence & Stats</h2>
				<p class="module-desc">
					Essential market data for real estate agents: valuation benchmarks, price per square meter ($/m²),
					Days on Market (DOM) velocity, price tier distribution, and buyer inquiry demand.
				</p>
			</div>

			<div class="card-footer">
				<span class="footer-stat">
					<strong>{data.quickCounts.activeProperties}</strong> Active Listings
				</span>
				<span class="cta-link">
					<span>View Market Stats</span>
					<span class="arrow">&rarr;</span>
				</span>
			</div>
		</a>

		<!-- Section 2: Site & Lead Settings -->
		<a href="/admin/settings" class="section-card settings-module">
			<div class="card-top">
				<div class="module-icon">
					<Icon kind="modify" size="32" />
				</div>
				<span class="module-tag">Configuration</span>
			</div>

			<div class="card-body">
				<h2>Site & Lead Settings</h2>
				<p class="module-desc">
					Configure inquiry distribution rules (forward to listing agent vs. direct agency control),
					contact email credentials, public office info, and security defaults.
				</p>
			</div>

			<div class="card-footer">
				<span class="footer-stat">
					<strong>Lead Routing</strong> & Platform Controls
				</span>
				<span class="cta-link">
					<span>Manage Settings</span>
					<span class="arrow">&rarr;</span>
				</span>
			</div>
		</a>
	</section>
</main>

<style>
	/* ==========================================================================
	   ADMIN HUB PAGE STYLES
	   ========================================================================== */

	.admin-hub-page {
		max-width: 1040px;
		margin: 0 auto;
		padding: calc(var(--size-8) * 1.5) var(--size-4) var(--size-10);
		color: var(--text-1);
		display: flex;
		flex-direction: column;
		gap: var(--size-8);
		width: 100%;
		box-sizing: border-box;
		min-width: 0;
	}

	.page-header {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		border-bottom: 1px solid var(--surface-3);
		padding-bottom: var(--size-5);
		width: 100%;
		box-sizing: border-box;
	}

	.header-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		padding: 4px 12px;
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.3);
		border-radius: var(--radius-round);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--accent);
		width: fit-content;
	}

	h1 {
		font-size: clamp(1.8rem, 5vw, 2.85rem);
		font-weight: 700;
		line-height: 1.2;
		margin: var(--size-1) 0;
		word-break: break-word;
	}

	.header-desc {
		font-size: 1.05rem;
		color: var(--text-2);
		max-width: 680px;
		line-height: 1.5;
	}

	.gold-text {
		background-image: var(--gold-text);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* Modules Grid */
	.admin-sections-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--size-6);
		width: 100%;
		min-width: 0;
	}

	@media (min-width: 720px) {
		.admin-sections-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.section-card {
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-6);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--size-5);
		text-decoration: none;
		color: inherit;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-2);
		backdrop-filter: blur(8px);
		min-width: 0;
		box-sizing: border-box;
		transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);

		&:hover {
			border-color: var(--accent);
			transform: translateY(-3px);
			box-shadow: var(--shadow-3);

			.cta-link {
				color: var(--accent);
				.arrow {
					transform: translateX(4px);
				}
			}
		}
	}

	.stats-module {
		background: linear-gradient(
			135deg,
			var(--surface-1) 0%,
			rgba(212, 175, 55, 0.04) 100%
		);
	}

	.settings-module {
		background: linear-gradient(
			135deg,
			var(--surface-1) 0%,
			rgba(33, 150, 243, 0.04) 100%
		);
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.module-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		background: var(--surface-2);
		border-radius: var(--radius-2);
		color: var(--accent);
		border: 1px solid var(--surface-3);
	}

	.module-tag {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 4px 10px;
		border-radius: var(--radius-round);
		background: var(--surface-2);
		color: var(--text-2);
		border: 1px solid var(--surface-3);
	}

	.card-body {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);

		h2 {
			font-size: 1.45rem;
			font-weight: 700;
			margin: 0;
			color: var(--text-1);
		}

		.module-desc {
			font-size: 0.95rem;
			color: var(--text-2);
			line-height: 1.5;
			margin: 0;
		}
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: var(--size-4);
		border-top: 1px solid var(--surface-3);
		font-size: 0.9rem;
	}

	.footer-stat {
		color: var(--text-2);

		strong {
			color: var(--text-1);
		}
	}

	.cta-link {
		font-weight: 600;
		color: var(--text-1);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: color var(--transition);

		.arrow {
			transition: transform var(--transition);
		}
	}
</style>
