<script>
	import { page } from '$app/state';
	import { Button } from '$lib/buttons';
	import { slide } from 'svelte/transition';
	
	import { addToast } from '$lib/toasts/store';

	// import JSONDump from "$lib/JSONDump.svelte";

	/** @type {{msl: any, attachments?: any}} */
	let { msl, attachments = $bindable([]), supabase } = $props();

	let error = '',
		message = '',
		loading = $state(false),
		isDragOver = $state(false);

	const cleaupString = (str) => {
		return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
	};

	function handleDrop(event) {
		// console.log("files", event.dataTransfer.files);
		addFiles(event.dataTransfer.files);
		isDragOver = false;
	}

	const addFiles = async (files) => {
		isDragOver = false;

		for await (const file of files) {
			let newFile = {
				name: cleaupString(file.name),
				file: file,
			};

			// attachments = [...attachments, newFile];

			await uploadFile(newFile);
			// console.log(file, newFile);
		}
	};

	const uploadFile = async (target) => {
		loading = true;

		// console.log("UPLOAD FILE: ", target);
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('photos')
			.upload(`/${msl}/${target.name}`, target.file);
		if (uploadError) {
			// console.log("upload err: ", uploadError);
			addToast({
				message: `Failed to upload ${uploadError.message}`,
				type: 'error',
				dismissible: false,
				timeout: 3000,
			});
		}
		if (uploadData) {
			// console.log("upload data: ", uploadData);
			await populatePhotosTable(target);
			addToast({
				message: `Photo ${uploadData.path} added!`,
				type: 'success',
				dismissible: false,
				timeout: 1200,
			});
		}

		loading = false;
	};

	const deleteFile = async (target) => {
		loading = true;

		// console.log("DELETE FILE: ", target);
		const { data: deleteFile, error: errDelete } = await supabase.storage
			.from('photos')
			.remove([`${msl}/${target}`]);
		if (errDelete) {
			// console.log(errDelete);
			addToast({
				message: `Failed to delete file ${errDelete.message}, try again in few seconds`,
				type: 'error',
				dismissible: false,
				timeout: 3000,
			});
		}
		if (deleteFile) {
			// console.log("deleteFile + index: ", deleteFile);
			attachments = attachments.filter((item) => item.name != target);

			addToast({
				message: `Photo ${target} deleted!`,
				type: 'success',
				dismissible: false,
				timeout: 1200,
			});
		}
		loading = false;
	};

	const populatePhotosTable = async (target) => {
		loading = true;

		const { data: publicUrlData } = await supabase.storage
			.from('photos')
			.getPublicUrl(`${msl}/${target.name}`);

		if (publicUrlData) {
			// console.log("update", target);
			const { data: updatePhotosTableData, error: updatePhotosTableErr } = await supabase
				.from('photos')
				.update({
					name: target.name,
					extension: target.name.split('.').pop(),
					msl,
					file_url: publicUrlData.publicUrl,
				})
				.eq('file_path', `${msl}/${target.name}`)
				.select('*')
				.single();
			if (updatePhotosTableErr) {
				addToast({
					message: `Failed to attach photos to msl ${updatePhotosTableErr.message}`,
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			}
			if (updatePhotosTableData) {
				// console.log("updated photos table: ", updatePhotosTableData);

				attachments = [...attachments, updatePhotosTableData];
				// addToast({
				// 	message: `Details for ${target.name} adjusted successfully`,
				// 	type: "success",
				// 	dismissible: false,
				// 	timeout: 1200,
				// });
			}
		}

		loading = false;
	};

	const emptyBucket = async () => {
		const { data, error } = await data.supabase.storage.emptyBucket('photos');
		if (error) console.error(error);
		if (data) console.log(data);
	};
</script>

<!-- <JSONDump name="attachments" data={attachments} /> -->
<!-- <button onclick|preventDefault={emptyBucket}>Clear Bucket</button> -->

<div class="drop-container">
	<div
		class:active={isDragOver}
		class="dropzone"
		ondragover={preventDefault(() => (isDragOver = true))}
		ondragleave={preventDefault(() => (isDragOver = false))}
		ondrop={preventDefault(handleDrop)}
		role="region">
		<small>Drop photos here</small>

		<input
			multiple
			class="file-input"
			type="file"
			accept="image/*"
			name="file"
			onchange={(event) => addFiles(event.target.files)} />
	</div>

	<div class="file-list">
		{#each attachments || [] as file (file)}
			<div class="card" transition:slide={{ duration: 93 }}>
				<img src={file.file_url} alt={file.name} />
				{#if page.data.session.user.id == file.user_id}
					<div class="file-action">
						<Button
							type="button"
							size="icon"
							disabled={loading}
							{loading}
							onclick={deleteFile(file.name)}>
							{#snippet icon()}
								<svg
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="18px"
									height="18px"
									><path
										d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z" /></svg>
							{/snippet}
							Delete
						</Button>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
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
		/* box-shadow: var(--shadow-small); */
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
	}
	.card img {
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius);
	}
	.card:hover .file-action,
	.card:focus .file-action {
		display: flex;
	}

	.file-action {
		display: none;
		justify-content: space-between;
		position: absolute;
		right: calc(var(--padding-extra-small) * -1);
		top: calc(var(--padding-extra-small) * -1);
		width: 27px;
		height: 27px;
	}

	/* @media only screen and (min-width: 541px) {
		.drop-container {
			grid-template-columns: 1fr 1fr;
		}
	} */
</style>
