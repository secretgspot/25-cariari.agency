<script>
	import { Button } from '$lib/buttons';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} ExistingAttachment
	 * @property {string} id - The UUID of the photo record in the database.
	 * @property {string} name - The original file name.
	 * @property {string} file_url - The public URL of the photo in Supabase Storage.
	 * @property {string} file_path - The path of the file in the Supabase Storage bucket.
	 * @property {string} user_id - The ID of the user who uploaded the photo.
	 * @property {string} [msl] - (Optional) msl property if needed for your specific schema.
	 * @property {string} [property_id] - (Optional) property_id if needed for your specific schema.
	 */

	/**
	 * @typedef {Object} NewFilePreview
	 * @property {File} file - The actual File object.
	 * @property {string} previewUrl - The data URL for local preview.
	 */

	/**
	 * @typedef {ExistingAttachment | (NewFilePreview & {name: string})} DisplayItem
	 */

	/**
	 * Props for the Uploader component.
	 * @type {{
	 * existingAttachments?: ExistingAttachment[];
	 * newFiles?: File[];
	 * loading?: boolean;
	 * currentUserId?: string;
	 * isAdmin?: boolean;
	 * onDeleteExisting?: (photo: ExistingAttachment) => void;
	 * }}
	 */
	let {
		existingAttachments = $bindable([]),
		newFiles = $bindable([]),
		loading = false,
		currentUserId,
		isAdmin = false,
		onDeleteExisting = (photo) => {},
	} = $props();

	let isDragOver = $state(false);
	let newFilePreviews = $state([]); // Still needed to store preview URLs for new files

	/**
	 * Combines existing attachments and new file previews into a single list for display.
	 * This derived state will react to changes in existingAttachments, newFiles, and newFilePreviews.
	 * @type {DisplayItem[]}
	 */
	let displayItems = $derived([
		...(existingAttachments || []).map((file) => ({
			// Properties for existing files
			id: file.id,
			name: file.name,
			url: file.file_url,
			isNew: false, // Flag to identify existing vs. new
			canDelete: currentUserId === file.user_id || isAdmin,
			action: () => onDeleteExisting(file),
		})),
		...(newFiles || []).map((file) => {
			// Find the corresponding preview URL for the new file
			const preview = newFilePreviews.find((p) => p.file === file);
			return {
				// Properties for new files
				id: crypto.randomUUID(), // Provide a unique key for new files
				name: file.name,
				url: preview?.previewUrl || '', // Use the preview URL
				isNew: true, // Flag to identify existing vs. new
				canDelete: true, // New files can always be removed locally
				action: () => removeNewFile(file),
			};
		}),
	]);

	/**
	 * Cleans up a string by normalizing and removing diacritics.
	 * @param {string} str - The input string.
	 * @returns {string} The cleaned string.
	 */
	const cleanupString = (str) => {
		return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
	};

	/**
	 * Handles files dropped onto the dropzone.
	 * @param {DragEvent} event - The drag event.
	 */
	function handleDrop(event) {
		event.preventDefault();
		isDragOver = false;
		if (event.dataTransfer?.files) {
			addNewFiles(event.dataTransfer.files);
		}
	}

	/**
	 * Handles files selected via the file input.
	 * @param {Event} event - The change event from the file input.
	 */
	function handleFileChange(event) {
		const input = event.target;
		if (input.files) {
			addNewFiles(input.files);
		}
	}

	/**
	 * Adds new files to the local state for preview and later upload.
	 * @param {FileList} files - The FileList object from the input or drop event.
	 */
	const addNewFiles = (files) => {
		isDragOver = false;
		const filesArray = Array.from(files);

		filesArray.forEach((file) => {
			const cleanedFile = new File([file], cleanupString(file.name), { type: file.type });
			newFiles = [...newFiles, cleanedFile]; // Add to the bindable prop

			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					newFilePreviews = [
						...newFilePreviews,
						{ file: cleanedFile, previewUrl: e.target.result },
					];
				}
			};
			reader.readAsDataURL(cleanedFile);
		});
	};

	/**
	 * Removes a newly selected file from the preview list before it's uploaded.
	 * @param {File} fileToRemove - The File object to remove.
	 */
	function removeNewFile(fileToRemove) {
		newFiles = newFiles.filter((file) => file !== fileToRemove);
		newFilePreviews = newFilePreviews.filter((p) => p.file !== fileToRemove);
	}
</script>

<div class="drop-container">
	<div
		class:active={isDragOver}
		class="dropzone"
		ondragover={(e) => {
			e.preventDefault();
			isDragOver = true;
		}}
		ondragleave={(e) => {
			e.preventDefault();
			isDragOver = false;
		}}
		ondrop={handleDrop}
		role="region">
		<small>Drop photos here or click to select</small>
		<input
			multiple
			class="file-input"
			type="file"
			accept="image/*"
			name="photos"
			onchange={handleFileChange} />
	</div>

	<div class="file-list">
		{#each displayItems || [] as item (item.id)}
			<div class="card" transition:slide={{ duration: 93 }}>
				<img src={item.url} alt={item.name} loading="lazy" />
				{#if item.canDelete}
					<div class="file-action">
						<Button type="button" size="icon" disabled={loading} onclick={item.action}>
							{#snippet icon()}
								<svg
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="18px"
									height="18px">
									<path
										d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z" />
								</svg>
							{/snippet}
							{item.isNew ? 'Remove' : 'Delete'}
						</Button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	/* Your existing styles */
	.drop-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--gap-medium);
		margin-bottom: var(--gap-medium);
	}

	.dropzone {
		position: relative;
		border: var(--border);
		border-style: dashed;
		border-radius: var(--border-radius);
		border-width: 6px;
		display: flex;
		padding: var(--padding-large);
		justify-content: center;
		align-items: center;
		text-align: center;
		height: 90px;
	}

	.active {
		border-color: var(--accent-focus);
		background: var(--primary-focus);
	}

	input[type='file'] {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		opacity: 0;
		cursor: pointer;
	}

	.file-list {
		display: grid;
		gap: var(--gap-small);
		grid-template: auto/repeat(auto-fill, minmax(120px, 140px));
		justify-content: center;
	}

	.card {
		display: flex;
		position: relative;
		max-width: 150px;
		max-height: 150px;
		border-radius: var(--border-radius);
	}
	.card img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--border-radius);
	}
	.card:hover .file-action,
	.card:focus-within .file-action {
		display: flex;
	}

	.file-action {
		display: flex;
		justify-content: space-between;
		position: absolute;
		right: calc(var(--padding-extra-small) * -1);
		top: calc(var(--padding-extra-small) * -1);
		width: 27px;
		height: 27px;
		@media (min-width: 481px) {
			display: none;
		}
		:global(.btn-icon) {
			background: var(--secondary);
			color: var(--secondary-content);
			&:hover {
				background: var(--error);
				color: var(--error-content);
			}
		}
	}
</style>
