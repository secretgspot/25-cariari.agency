<div class="loader"></div>

<style>
	.loader {
		position: fixed;
		width: 100%;
		height: 6px;
		top: 0;
		left: 0;
		right: 0;
		border-radius: var(--border-radius);
		overflow: hidden;
		z-index: 12;
	}
	.loader:before,
	.loader:after {
		content: "";
		position: absolute;
		top: 0;
		width: 100%;
		height: 3px;
		transform: translate(-100%, 0);
	}

	.loader:before {
		background-color: var(--success);
		animation: loading 3300ms cubic-bezier(0.23, 1, 0.32, 1) infinite;
	}

	.loader:after {
		background-color: var(--info);
		animation: loading 3300ms 300ms cubic-bezier(0.23, 1, 0.32, 1) infinite;
	}

	@keyframes loading {
		75% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(100%, 0);
		}
	}

	@media only screen and (min-width: 540px) {
		.loader {
			height: 3px;
		}
		.loader:before,
		.loader:after {
			height: 1px;
		}
	}
</style>
