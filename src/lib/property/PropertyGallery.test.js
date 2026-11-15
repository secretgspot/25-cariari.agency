import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { compile } from 'svelte/compiler';

test('PropertyGallery - Svelte 5 compilation and contract verification', () => {
	const filePath = path.resolve('src/lib/property/PropertyGallery.svelte');
	const source = fs.readFileSync(filePath, 'utf-8');

	// Compile component for client
	const clientResult = compile(source, {
		filename: 'PropertyGallery.svelte',
		generate: 'client'
	});
	assert.ok(clientResult.js.code, 'Client compilation succeeded');

	// Compile component for server (SSR)
	const serverResult = compile(source, {
		filename: 'PropertyGallery.svelte',
		generate: 'server'
	});
	assert.ok(serverResult.js.code, 'Server compilation succeeded');

	// Contract checks on source code
	assert.ok(source.includes('PLACEHOLDER_URL = \'/placeholder/1080x810.png\''), 'Has fallback placeholder');
	assert.ok(source.includes('scroll-snap-type: x mandatory'), 'Uses native CSS scroll-snap');
	assert.ok(source.includes('overscroll-behavior-x: contain'), 'Contains horizontal overscroll');
	assert.ok(source.includes('fetchpriority="high"'), 'Hero photo has fetchpriority="high"');
	assert.ok(source.includes('loading="eager"'), 'Hero photo has loading="eager"');
	assert.ok(source.includes('loading="lazy"'), 'Secondary photos have loading="lazy"');
	assert.ok(source.includes('decoding="async"'), 'Secondary photos have decoding="async"');
	assert.ok(source.includes('role="dialog"'), 'Lightbox has dialog role');
	assert.ok(source.includes('aria-modal="true"'), 'Lightbox has aria-modal="true"');
	assert.ok(source.includes('activeMobileIndex + 1'), 'Reactive mobile index calculation present');
	assert.ok(source.includes('View all {photos.length} photos'), 'Desktop 5+ photos button present');
	assert.ok(source.includes('Escape'), 'Handles Escape key in lightbox');
	assert.ok(source.includes('ArrowRight'), 'Handles ArrowRight in lightbox');
	assert.ok(source.includes('ArrowLeft'), 'Handles ArrowLeft in lightbox');
});
