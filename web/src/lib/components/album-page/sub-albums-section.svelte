<script lang="ts">
  import { t } from 'svelte-i18n';
  import type { AlbumResponseDto } from '@immich/sdk';
  import AlbumCard from '$lib/components/album-page/album-card.svelte';
  import { goto } from '$app/navigation';
  import { AppRoute } from '$lib/constants';

  export let subAlbums: AlbumResponseDto[] = [];
  export let onCreateSubAlbum: (() => void) | undefined = undefined;
</script>

{#if subAlbums.length > 0 || onCreateSubAlbum}
  <section class="mt-6" aria-label={$t('sub_albums')}>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-immich-primary dark:text-immich-dark-primary">
        {$t('sub_albums')}
        {#if subAlbums.length > 0}
          <span class="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({$t('sub_albums_count', { values: { count: subAlbums.length } })})
          </span>
        {/if}
      </h2>
      {#if onCreateSubAlbum}
        <button
          on:click={onCreateSubAlbum}
          class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium
                 text-immich-primary hover:bg-immich-primary/10
                 dark:text-immich-dark-primary dark:hover:bg-immich-dark-primary/10
                 transition-colors"
        >
          + {$t('add_sub_album')}
        </button>
      {/if}
    </div>

    {#if subAlbums.length > 0}
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {#each subAlbums as album (album.id)}
          <AlbumCard
            {album}
            onSelect={() => goto(`${AppRoute.ALBUMS}/${album.id}`)}
          />
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-400 dark:text-gray-500 italic">
        {$t('no_sub_albums_yet', { default: 'No sub-albums yet.' })}
      </p>
    {/if}
  </section>
{/if}
