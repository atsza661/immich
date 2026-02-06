<script lang="ts">
  import AlbumCard from '$lib/components/album-page/album-card.svelte';
  import { Route } from '$lib/route';
  import type { AlbumResponseDto } from '@immich/sdk';
  import { Icon } from '@immich/ui';
  import { mdiChevronRight, mdiFolder } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  interface Props {
    subalbums: AlbumResponseDto[];
    isLoading?: boolean;
    onShowContextMenu?: (position: { x: number; y: number }, album: AlbumResponseDto) => void;
  }

  let { subalbums, isLoading = false, onShowContextMenu }: Props = $props();

  let isCollapsed = $state(false);
</script>

<div class="my-6">
  {#if subalbums.length > 0}
    <div class="mb-4">
      <button
        type="button"
        onclick={() => (isCollapsed = !isCollapsed)}
        class="w-full text-start mt-2 pt-2 pe-2 pb-2 rounded-md transition-colors cursor-pointer dark:text-immich-dark-fg hover:text-primary hover:bg-subtle dark:hover:bg-immich-dark-gray"
        aria-expanded={!isCollapsed}
      >
        <Icon
          icon={mdiChevronRight}
          size="24"
          class="inline-block -mt-2.5 transition-all duration-250 {isCollapsed ? '' : 'rotate-90'}"
        />
        <Icon icon={mdiFolder} size="24" class="inline-block" />
        <span class="font-bold text-lg text-black dark:text-white ms-2">{$t('subalbums')}</span>
        <span class="ms-1.5">({subalbums.length})</span>
      </button>
      <hr class="dark:border-immich-dark-gray" />
    </div>

    {#if !isCollapsed && !isLoading}
      <div class="mt-4" transition:slide={{ duration: 300 }}>
        <div class="grid grid-auto-fill-56 gap-y-4">
          {#each subalbums as album (album.id)}
            <a
              href={Route.viewAlbum(album)}
              class="group relative outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
            >
              <AlbumCard
                {album}
                preload={true}
                onShowContextMenu={onShowContextMenu ? (position) => onShowContextMenu?.(position, album) : undefined}
              />
            </a>
          {/each}
        </div>
      </div>
    {/if}

    {#if isLoading}
      <div class="flex justify-center py-8">
        <div class="text-gray-500 dark:text-gray-400">{$t('loading')}</div>
      </div>
    {/if}
  {/if}
</div>
