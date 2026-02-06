<script lang="ts">
  import { createAlbum, type AlbumResponseDto } from '@immich/sdk';
  import { Field, FormModal, Input, Textarea } from '@immich/ui';
  import { mdiPlus } from '@mdi/js';
  import { t } from 'svelte-i18n';

  type Props = {
    parentAlbum: AlbumResponseDto;
    onClose: () => void;
    onCreated?: (album: AlbumResponseDto) => void;
  };

  let { parentAlbum, onClose, onCreated }: Props = $props();

  let albumName = $state('');
  let description = $state('');

  const onSubmit = async () => {
    if (!albumName.trim()) {
      return;
    }

    try {
      const newAlbum = await createAlbum({
        createAlbumDto: {
          albumName: albumName.trim(),
          description: description.trim() || undefined,
        },
      });
      onCreated?.(newAlbum);
      onClose();
      return true;
    } catch (error_) {
      console.error('Failed to create subalbum:', error_);
      return false;
    }
  };
</script>

<FormModal icon={mdiPlus} title={$t('create_subalbum')} size="medium" {onClose} {onSubmit}>
  <div class="flex flex-col gap-4 p-4">
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
      {$t('creating_subalbum_under', { values: { albumName: parentAlbum.albumName } })}
    </p>

    <Field label={$t('album_name')}>
      <Input bind:value={albumName} autofocus />
    </Field>

    <Field label={$t('description')}>
      <Textarea bind:value={description} />
    </Field>
  </div>
</FormModal>
