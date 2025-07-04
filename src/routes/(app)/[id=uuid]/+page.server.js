import { error } from '@sveltejs/kit';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
    const { supabaseClient } = await getSupabase(event);
    const { id } = event.params;

    const { data: property, error: err } = await supabaseClient
        .from('properties')
        .select('*, photos(file_url)')
        .eq('id', id)
        .single();

    if (err || !property) {
        console.error(err);
        error(404, 'Property not found');
    }

    return {
        property
    };
}
