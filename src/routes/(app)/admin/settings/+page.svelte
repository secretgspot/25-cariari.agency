<script>
	import { enhance } from '$app/forms';
	import Nav from '#lib/Nav.svelte';
	import Icon from '#lib/Icon.svelte';
	import { Button } from '#lib/buttons/index.js';
	import { addToast } from '#lib/toasts/index.js';
	import { playChime } from '#lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '#lib/utils/vibrate.js';

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

	function toggleSetting(key) {
		settings[key] = !settings[key];
		try {
			playChime(settings[key] ? 587 : 440, 0.08, 0.15, 'sine');
			vibrate(vibratePatterns.basic);
		} catch {}
	}
</script>

<svelte:head>
	<title>Admin Settings | Cariari Agency</title>
</svelte:head>

<Nav fixed />

<main class="settings-page">
	<header class="page-header">
		<div class="header-badge">
			<span class="badge-icon">🔥</span>
			<span class="badge-text">Administrator Control Panel</span>
		</div>
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

					<div class="luxury-switch-group">
						<button
							type="button"
							class="luxury-switch"
							class:checked={settings.forward_inquiries_to_realtor}
							role="switch"
							aria-checked={settings.forward_inquiries_to_realtor}
							aria-label="Toggle forwarding inquiries to listing agent"
							onclick={() => toggleSetting('forward_inquiries_to_realtor')}>
							<span class="switch-status-text">
								{settings.forward_inquiries_to_realtor ? 'ON' : 'OFF'}
							</span>
							<span class="switch-slider">
								<span class="switch-knob"></span>
							</span>
						</button>
						<input
							type="hidden"
							name="forward_inquiries_to_realtor"
							value={settings.forward_inquiries_to_realtor}
						/>
					</div>
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
					<div class="luxury-switch-group">
						<button
							type="button"
							class="luxury-switch"
							class:checked={settings.maintenance_mode}
							role="switch"
							aria-checked={settings.maintenance_mode}
							aria-label="Toggle maintenance mode"
							onclick={() => toggleSetting('maintenance_mode')}>
							<span class="switch-status-text">
								{settings.maintenance_mode ? 'ON' : 'OFF'}
							</span>
							<span class="switch-slider">
								<span class="switch-knob"></span>
							</span>
						</button>
						<input
							type="hidden"
							name="maintenance_mode"
							value={settings.maintenance_mode}
						/>
					</div>
				</div>

				<div class="toggle-item">
					<div class="toggle-item-info">
						<label for="enable_registration" class="toggle-title">Allow Realtor Registration</label>
						<p class="toggle-description">
							Enables new realtors to register accounts to list properties.
						</p>
					</div>
					<div class="luxury-switch-group">
						<button
							type="button"
							class="luxury-switch"
							class:checked={settings.enable_registration}
							role="switch"
							aria-checked={settings.enable_registration}
							aria-label="Toggle realtor registration"
							onclick={() => toggleSetting('enable_registration')}>
							<span class="switch-status-text">
								{settings.enable_registration ? 'ON' : 'OFF'}
							</span>
							<span class="switch-slider">
								<span class="switch-knob"></span>
							</span>
						</button>
						<input
							type="hidden"
							name="enable_registration"
							value={settings.enable_registration}
						/>
					</div>
				</div>
			</div>
		</section>

		<!-- SUBMIT ACTION BAR -->
		<div class="action-bar">
			<div class="action-info">
				<span class="save-status">
					{#if saving}
						<span class="saving-pulse"></span> Saving changes to Supabase...
					{:else}
						All changes update database immediately upon saving.
					{/if}
				</span>
			</div>
			<div class="action-buttons">
				<Button
					type="submit"
					loading={saving}
					disabled={saving}
					size="regular"
					buzz
					sound
					class="save-button">
					Save Settings
				</Button>
			</div>
		</div>
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
	}

	.header-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		padding: var(--size-1) var(--size-3);
		border-radius: var(--radius-pill, 9999px);
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.3);
		margin-bottom: var(--size-2);
	}

	.badge-text {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--accent);
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

	.luxury-switch-group {
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
	}

	.luxury-switch {
		display: inline-flex;
		align-items: center;
		gap: var(--size-3);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-round, 9999px);
		padding: 4px 6px 4px 14px;
		cursor: pointer;
		user-select: none;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);

		&:hover {
			border-color: var(--accent);
			background: var(--surface-3);
		}

		&:focus-visible {
			outline: 2px solid var(--accent);
			outline-offset: 2px;
		}

		&.checked {
			background: rgba(46, 125, 50, 0.15);
			border-color: var(--success);

			.switch-status-text {
				color: var(--success);
			}

			.switch-slider {
				background: var(--success);
				box-shadow: 0 0 12px rgba(46, 125, 50, 0.4);

				.switch-knob {
					transform: translateX(24px);
					background: #ffffff;
				}
			}
		}
	}

	.switch-status-text {
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-2);
		min-width: 2.2ch;
		text-align: right;
		transition: color 0.2s ease;
	}

	.switch-slider {
		display: block;
		width: 52px;
		height: 28px;
		border-radius: 9999px;
		background: var(--surface-4);
		position: relative;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		padding: 3px;
		box-sizing: border-box;
	}

	.switch-knob {
		display: block;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--text-2);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
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

	/* Sticky Action Bar */
	.action-bar {
		position: sticky;
		bottom: var(--size-3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-4);
		padding: var(--size-3) var(--size-5);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		border: 1px solid rgba(212, 175, 55, 0.4);
		box-shadow: var(--shadow-3);
		backdrop-filter: blur(12px);
		z-index: 10;
		flex-wrap: wrap;
	}

	.action-info {
		flex: 1;
		min-width: 220px;
	}

	.save-status {
		font-size: 0.85rem;
		color: var(--text-2);
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}

	.saving-pulse {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		animation: pulse 1s infinite alternate;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	:global(.save-button) {
		background: var(--accent) !important;
		color: var(--surface-1-dark) !important;
		font-weight: 700 !important;
		padding: 0.6rem 1.6rem !important;
		border-radius: var(--radius-2) !important;
		letter-spacing: 0.03em;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		transition: transform 0.15s ease, filter 0.15s ease;

		&:hover:not(:disabled) {
			filter: brightness(1.1);
			transform: translateY(-1px);
		}
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
