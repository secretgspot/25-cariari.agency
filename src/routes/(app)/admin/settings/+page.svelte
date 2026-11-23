<script>
	import { enhance } from '$app/forms';
	import Nav from '#lib/Nav.svelte';
	import Icon from '#lib/Icon.svelte';
	import Toggle from '#lib/Toggle.svelte';
	import { Button } from '#lib/buttons/index.js';
	import { addToast } from '#lib/toasts/index.js';

	/** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
	let { data, form } = $props();

	// Local mutable state
	let settings = $state({
		site_name: 'Cariari Agency',
		site_tagline: 'Costa Rica Real Estate',
		contact_email: 'info@cariari.agency',
		contact_phone: '+506 2222-2222',
		office_address: 'San José, Costa Rica',
		default_agent_email: 'agent@cariari.agency',
		social_facebook: '',
		social_instagram: '',
		social_linkedin: '',
		social_youtube: '',
		forward_inquiries_to_realtor: false,
		maintenance_mode: false,
		enable_registration: true
	});

	// Synchronize local form state with incoming server data
	$effect(() => {
		if (data.settings) {
			settings = {
				site_name: data.settings.site_name ?? 'Cariari Agency',
				site_tagline: data.settings.site_tagline ?? 'Costa Rica Real Estate',
				contact_email: data.settings.contact_email ?? 'info@cariari.agency',
				contact_phone: data.settings.contact_phone ?? '+506 2222-2222',
				office_address: data.settings.office_address ?? 'San José, Costa Rica',
				default_agent_email: data.settings.default_agent_email ?? 'agent@cariari.agency',
				social_facebook: data.settings.social_facebook ?? '',
				social_instagram: data.settings.social_instagram ?? '',
				social_linkedin: data.settings.social_linkedin ?? '',
				social_youtube: data.settings.social_youtube ?? '',
				forward_inquiries_to_realtor: Boolean(data.settings.forward_inquiries_to_realtor),
				maintenance_mode: Boolean(data.settings.maintenance_mode),
				enable_registration: data.settings.enable_registration ?? true
			};
		}
	});

	let saving = $state(false);
	let statusMessage = $state('');
	let statusType = $state(''); // 'success' | 'error' | ''
</script>

<svelte:head>
	<title>Admin Settings | Cariari Agency</title>
</svelte:head>

<Nav fixed />

<main class="settings-page">
	<header class="page-header">
		<nav class="admin-breadcrumb" aria-label="Breadcrumb">
			<a href="/admin" class="breadcrumb-link">
				<Icon kind="icon_arrow_left" size="16" />
				<span>Admin Hub</span>
			</a>
			<span class="breadcrumb-sep">/</span>
			<span class="breadcrumb-current">Site & Lead Settings</span>
		</nav>

		<h1 class="gold-text">Site & Lead Settings</h1>
		<p class="header-desc">
			Configure inquiry routing, agency contact credentials, and platform defaults.
		</p>
	</header>

	{#if statusMessage}
		<div class="feedback-banner {statusType}" role="alert">
			<span class="feedback-icon">{statusType === 'success' ? '✓' : '⚠️'}</span>
			<p>{statusMessage}</p>
		</div>
	{/if}

	<form
		method="POST"
		class="settings-form"
		use:enhance={() => {
			saving = true;
			statusMessage = '';
			statusType = '';

			return async ({ result, update }) => {
				await update({ reset: false });
				saving = false;

				if (result.type === 'success') {
					statusType = 'success';
					statusMessage = result.data?.message || 'Settings saved successfully';
					addToast({
						message: 'Settings saved successfully',
						type: 'success',
						timeout: 2500
					});
				} else if (result.type === 'failure') {
					statusType = 'error';
					statusMessage = result.data?.error || 'Failed to save settings. Please check the values.';
					addToast({
						message: statusMessage,
						type: 'error',
						timeout: 4000
					});
				} else if (result.type === 'error') {
					statusType = 'error';
					statusMessage = 'An unexpected server error occurred.';
					addToast({
						message: statusMessage,
						type: 'error',
						timeout: 4000
					});
				}
			};
		}}>
		
		<!-- 1. LEAD & INQUIRY MANAGEMENT (HERO SECTION) -->
		<section class="card hero-card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="email" size="24" /></span>
					<div>
						<h2>Lead & Inquiry Routing</h2>
						<span class="card-subtitle">Control distribution and privacy of incoming client leads</span>
					</div>
				</div>
				<span class="status-pill {settings.forward_inquiries_to_realtor ? 'pill-forward' : 'pill-private'}">
					{settings.forward_inquiries_to_realtor ? 'Forwarding to Agents' : 'Direct Agency Control'}
				</span>
			</div>

			<div class="lead-toggle-container">
				<div class="toggle-control-row">
					<div class="toggle-label-group">
						<label for="forward_inquiries_to_realtor" class="toggle-title">
							Forward Inquiries to Listing Agent
						</label>
						<p class="toggle-description">
							When disabled, inquiries are saved to database and sent <strong>ONLY to agency admin email</strong>,
							giving you complete control over leads. When enabled, inquiries are also forwarded directly to the property's listing agent.
						</p>
					</div>

					<Toggle
						name="forward_inquiries_to_realtor"
						bind:checked={settings.forward_inquiries_to_realtor}
						label={settings.forward_inquiries_to_realtor ? 'Forwarding' : 'Direct'}
						kind="flip"
						colored
						on="Forward"
						off="Direct"
					/>
				</div>

				<!-- Visual routing indicator -->
				<div class="routing-explanation-box {settings.forward_inquiries_to_realtor ? 'is-forward' : 'is-private'}">
					{#if !settings.forward_inquiries_to_realtor}
						<div class="routing-visual">
							<span class="routing-step">Visitor Submits</span>
							<span class="routing-arrow">➔</span>
							<span class="routing-step highlight">Supabase DB</span>
							<span class="routing-arrow">➔</span>
							<span class="routing-step highlight">Agency Admin ({settings.contact_email})</span>
						</div>
						<p class="routing-note">
							🛡️ <strong>Agency Exclusivity Active:</strong> Listing agents cannot receive customer contact details directly. All inquiries remain centrally managed.
						</p>
					{:else}
						<div class="routing-visual">
							<span class="routing-step">Visitor Submits</span>
							<span class="routing-arrow">➔</span>
							<span class="routing-step highlight">Supabase DB</span>
							<span class="routing-arrow">➔</span>
							<span class="routing-step">Admin & Listing Agent ({settings.default_agent_email})</span>
						</div>
						<p class="routing-note">
							⚡ <strong>Direct Agent Routing Active:</strong> Inquiries are sent to both admin and the assigned property realtor for immediate follow-up.
						</p>
					{/if}
				</div>
			</div>
		</section>

		<!-- 2. GENERAL AGENCY INFORMATION -->
		<section class="card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="home" size="24" /></span>
					<div>
						<h2>General Agency Information</h2>
						<span class="card-subtitle">Public contact details, branding names, and default routing emails</span>
					</div>
				</div>
			</div>

			<div class="grid-form">
				<div class="field-group">
					<label for="site_name">Site / Agency Name</label>
					<input
						type="text"
						id="site_name"
						name="site_name"
						required
						bind:value={settings.site_name}
						placeholder="ex: Cariari Agency"
					/>
				</div>

				<div class="field-group">
					<label for="site_tagline">Tagline</label>
					<input
						type="text"
						id="site_tagline"
						name="site_tagline"
						bind:value={settings.site_tagline}
						placeholder="ex: Costa Rica Real Estate"
					/>
				</div>

				<div class="field-group">
					<label for="contact_email">
						Main Agency Admin Email <span class="required">*</span>
					</label>
					<input
						type="email"
						id="contact_email"
						name="contact_email"
						required
						bind:value={settings.contact_email}
						placeholder="info@cariari.agency"
					/>
					<small class="field-hint">Primary recipient for all website inquiries, notifications, and customer leads.</small>
				</div>

				<div class="field-group">
					<label for="default_agent_email">
						Default Listing Agent Email <span class="required">*</span>
					</label>
					<input
						type="email"
						id="default_agent_email"
						name="default_agent_email"
						required
						bind:value={settings.default_agent_email}
						placeholder="agent@cariari.agency"
					/>
					<small class="field-hint">Used as fallback when a property does not have a designated agent.</small>
				</div>

				<div class="field-group">
					<label for="contact_phone">Main Phone / WhatsApp</label>
					<input
						type="text"
						id="contact_phone"
						name="contact_phone"
						bind:value={settings.contact_phone}
						placeholder="+506 2222-2222"
					/>
				</div>

				<div class="field-group">
					<label for="office_address">Office Address</label>
					<input
						type="text"
						id="office_address"
						name="office_address"
						bind:value={settings.office_address}
						placeholder="San José, Costa Rica"
					/>
				</div>
			</div>
		</section>

		<!-- 3. SOCIAL MEDIA CHANNELS -->
		<section class="card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="properties" size="24" /></span>
					<div>
						<h2>Social Media Profiles</h2>
						<span class="card-subtitle">Official agency social links displayed in footer and about pages</span>
					</div>
				</div>
			</div>

			<div class="grid-form">
				<div class="field-group">
					<label for="social_facebook">Facebook URL</label>
					<input
						type="url"
						id="social_facebook"
						name="social_facebook"
						bind:value={settings.social_facebook}
						placeholder="https://facebook.com/cariariagency"
					/>
				</div>

				<div class="field-group">
					<label for="social_instagram">Instagram URL</label>
					<input
						type="url"
						id="social_instagram"
						name="social_instagram"
						bind:value={settings.social_instagram}
						placeholder="https://instagram.com/cariariagency"
					/>
				</div>

				<div class="field-group">
					<label for="social_linkedin">LinkedIn URL</label>
					<input
						type="url"
						id="social_linkedin"
						name="social_linkedin"
						bind:value={settings.social_linkedin}
						placeholder="https://linkedin.com/company/cariariagency"
					/>
				</div>

				<div class="field-group">
					<label for="social_youtube">YouTube Channel</label>
					<input
						type="url"
						id="social_youtube"
						name="social_youtube"
						bind:value={settings.social_youtube}
						placeholder="https://youtube.com/@cariariagency"
					/>
				</div>
			</div>
		</section>

		<!-- 4. SYSTEM CONTROLS -->
		<section class="card">
			<div class="card-header">
				<div class="card-title-group">
					<span class="section-icon"><Icon kind="info" size="24" /></span>
					<div>
						<h2>Platform Controls</h2>
						<span class="card-subtitle">Maintenance switches and account registration access</span>
					</div>
				</div>
			</div>

			<div class="system-toggles-grid">
				<div class="toggle-item">
					<div class="toggle-item-info">
						<label for="maintenance_mode" class="toggle-title">Maintenance Mode</label>
						<p class="toggle-description">
							Temporarily pauses public browsing with a maintenance screen.
						</p>
					</div>
					<Toggle
						name="maintenance_mode"
						bind:checked={settings.maintenance_mode}
						label={settings.maintenance_mode ? 'Active' : 'Off'}
						kind="flip"
						colored
						on="ON"
						off="OFF"
					/>
				</div>

				<div class="toggle-item">
					<div class="toggle-item-info">
						<label for="enable_registration" class="toggle-title">Allow Realtor Registration</label>
						<p class="toggle-description">
							Enables new realtors to register accounts to list properties.
						</p>
					</div>
					<Toggle
						name="enable_registration"
						bind:checked={settings.enable_registration}
						label={settings.enable_registration ? 'Allowed' : 'Disabled'}
						kind="flip"
						colored
						on="ON"
						off="OFF"
					/>
				</div>
			</div>
		</section>

		<!-- FORM BUTTONS -->
		<footer class="buttons-group">
			<Button
				type="submit"
				shadow
				loading={saving}
				disabled={saving}>
				{#snippet icon()}
					<Icon kind="save" size="27" />
				{/snippet}
				Save Settings
			</Button>
		</footer>
	</form>
</main>

<style>
	.settings-page {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--size-8) var(--size-4) var(--size-10);
		color: var(--text-1);
	}

	.page-header {
		margin-bottom: var(--size-6);
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.admin-breadcrumb {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		font-size: 0.9rem;
		margin-bottom: var(--size-1);
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

	h1 {
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 700;
		line-height: 1.15;
		margin: var(--size-2) 0;
	}

	.header-desc {
		font-size: 1.05rem;
		color: var(--text-2);
		max-width: 640px;
	}

	.gold-text {
		background-image: var(--gold-text);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.feedback-banner {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: var(--size-3) var(--size-4);
		border-radius: var(--radius-2);
		margin-bottom: var(--size-5);
		font-weight: 500;
		animation: fadeIn 0.25s ease;

		&.success {
			background: rgba(46, 125, 50, 0.15);
			border: 1px solid var(--success);
			color: var(--success);
		}

		&.error {
			background: rgba(211, 47, 47, 0.15);
			border: 1px solid var(--error);
			color: var(--error);
		}
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--size-6);
	}

	/* Glassmorphic Cards */
	.card {
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-5);
		box-shadow: var(--shadow-2);
		backdrop-filter: blur(8px);
		transition: border-color var(--transition);

		&:hover {
			border-color: var(--surface-4);
		}
	}

	.hero-card {
		border: 1px solid rgba(212, 175, 55, 0.35);
		background: linear-gradient(
			135deg,
			var(--surface-1) 0%,
			rgba(212, 175, 55, 0.05) 100%
		);
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 3px;
			background: var(--gold-text);
		}
	}

	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--size-3);
		margin-bottom: var(--size-4);
		padding-bottom: var(--size-3);
		border-bottom: 1px solid var(--surface-3);
		flex-wrap: wrap;
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.section-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--accent);
		border: 1px solid var(--surface-3);
		flex-shrink: 0;
	}

	.card-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		color: var(--text-1);
	}

	.card-subtitle {
		font-size: 0.85rem;
		color: var(--text-2);
		display: block;
		margin-top: 2px;
	}

	.status-pill {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 4px 10px;
		border-radius: 9999px;
		align-self: center;

		&.pill-private {
			background: rgba(46, 125, 50, 0.15);
			color: var(--success);
			border: 1px solid rgba(46, 125, 50, 0.4);
		}

		&.pill-forward {
			background: rgba(33, 150, 243, 0.15);
			color: var(--info);
			border: 1px solid rgba(33, 150, 243, 0.4);
		}
	}

	/* Lead Toggle Layout */
	.lead-toggle-container {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.toggle-control-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--size-4);
	}

	.toggle-label-group {
		flex: 1;
	}

	.toggle-title {
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--text-1);
		display: block;
		margin-bottom: var(--size-1);
		cursor: pointer;
	}

	.toggle-description {
		font-size: 0.9rem;
		color: var(--text-2);
		line-height: 1.5;
		margin: 0;

		strong {
			color: var(--text-1);
		}
	}



	/* Routing Diagram Box */
	.routing-explanation-box {
		padding: var(--size-3) var(--size-4);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		display: flex;
		flex-direction: column;
		gap: var(--size-2);

		&.is-private {
			border-left: 3px solid var(--success);
		}

		&.is-forward {
			border-left: 3px solid var(--accent);
		}
	}

	.routing-visual {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		flex-wrap: wrap;
		font-size: 0.85rem;
	}

	.routing-step {
		padding: 2px 8px;
		border-radius: var(--radius-1);
		background: var(--surface-3);
		color: var(--text-2);
		font-weight: 500;

		&.highlight {
			background: var(--surface-4);
			color: var(--text-1);
			font-weight: 600;
		}
	}

	.routing-arrow {
		color: var(--accent);
		font-weight: bold;
	}

	.routing-note {
		font-size: 0.85rem;
		color: var(--text-2);
		margin: 0;

		strong {
			color: var(--text-1);
		}
	}

	/* Grid Form */
	.grid-form {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--size-4);

		@media (min-width: 640px) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);

		label {
			font-size: 0.85rem;
			font-weight: 600;
			color: var(--text-2);
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}

		.required {
			color: var(--accent);
		}

		input {
			width: 100%;
			padding: var(--size-2) var(--size-3);
			border-radius: var(--radius-2);
			border: 1px solid var(--surface-3);
			background: var(--surface-2);
			color: var(--text-1);
			font-size: 0.95rem;
			transition: all var(--transition);

			&:focus {
				outline: none;
				border-color: var(--accent);
				box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
			}

			&::placeholder {
				color: var(--text-2);
				opacity: 0.5;
			}
		}

		.field-hint {
			font-size: 0.78rem;
			color: var(--text-2);
			margin-top: 2px;
		}
	}

	/* System Toggles */
	.system-toggles-grid {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
	}

	.toggle-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-4);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
	}

	.toggle-item-info {
		flex: 1;
	}

	/* Form Submit Buttons */
	footer.buttons-group {
		display: grid;
		justify-items: center;
		gap: var(--size-2);
		padding: var(--size-5) 0 var(--size-8);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		from {
			opacity: 0.4;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1.1);
		}
	}
</style>
