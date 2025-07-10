<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# What is the best way to upload files directly to Supabase storage in SvelteKit2

The best way to upload files **directly to Supabase Storage in SvelteKit 2** depends primarily on the file size and your reliability needs:

### Recommended Approach: Standard Upload for Files ≤ 6MB

- Use the **standard upload method** provided by the Supabase JS SDK (`supabase.storage.from(bucket).upload(...)`).
- It uses a simple `multipart/form-data` upload.
- Ideal for small files (up to 6MB) for simplicity and ease of implementation.
- You can optionally set `upsert: true` to overwrite existing files, but it's generally recommended to upload to new paths to avoid CDN propagation delays.

**Example:**

```js
const { data, error } = await supabase
  .storage
  .from('your_bucket')
  .upload('path/to/file.ext', file, { upsert: false });

if (error) {
  console.error('Upload error:', error.message);
} else {
  console.log('Upload success:', data);
}
```

This is straightforward to implement in SvelteKit 2 by binding a file input and calling this upload function on user action[^1].

### For Files Larger Than 6MB: Use TUS Resumable Uploads

- Supabase recommends using **TUS protocol** for files larger than 6MB.
- TUS enables resumable uploads, improving reliability for large files or unstable connections.
- This requires integrating a TUS client (e.g., `@uppy/tus` or `tus-js-client`) with Supabase Storage endpoints.
- More complex but necessary for large file uploads.


### Additional Tips for SvelteKit 2 Integration

- Upload files **directly from the client** using the Supabase JS client to avoid server-side file handling complications.
- Bind the file input in your Svelte component and pass the selected `File` object directly to Supabase's `.upload()` method.
- Avoid sending files as JSON or base64 strings to the server and then uploading; this causes issues with file integrity.
- Use unique file paths (e.g., with UUIDs) to prevent overwriting and CDN caching issues[^3][^4].
- Configure your Supabase Storage bucket policies to allow uploads from your client app securely.


### Summary Table

| File Size | Upload Method | Notes |
| :-- | :-- | :-- |
| ≤ 6MB | Supabase Standard Upload | Simple, uses `upload()` method |
| > 6MB | TUS Resumable Upload | Reliable, resumable, requires TUS client |

### References

- Supabase Docs on Standard Uploads and TUS: "Standard Uploads" section explains the simple upload and recommends TUS for >6MB files[^1][^8].
- Community advice highlights direct client-side uploads with Supabase JS SDK and warns against server-side file transformations[^4].
- Tutorials emphasize using UUIDs for file names to avoid conflicts and CDN caching issues[^3][^6].

**In short:** For most SvelteKit 2 apps, upload files directly on the client using Supabase's standard `.upload()` method for files under 6MB. For larger files, implement TUS resumable uploads for reliability. This approach balances simplicity and robustness.

<div style="text-align: center">⁂</div>

[^1]: https://supabase.com/docs/guides/storage/uploads/standard-uploads

[^2]: https://trigger.dev/docs/guides/examples/supabase-storage-upload

[^3]: https://www.youtube.com/watch?v=HvOvdD2nX1k

[^4]: https://www.reddit.com/r/sveltejs/comments/xvhb7u/how_should_i_go_about_file_uploads/

[^5]: https://community.weweb.io/t/whats-the-best-way-tu-opload-a-file-directly-to-supabase-storage/1517

[^6]: https://www.youtube.com/watch?v=8tfdY0Sf2rA

[^7]: https://supabase.com/docs/guides/getting-started/quickstarts/sveltekit

[^8]: https://supabase.com/docs/guides/storage

[^9]: https://www.youtube.com/watch?v=vmX4nV5ZWOo

[^10]: https://www.youtube.com/watch?v=1tsUB58KX2s

