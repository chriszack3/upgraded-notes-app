<template>
  <DeepBtn
    label="Rotate encryption keys"
    color="primary"
    @click="_rotateGroupKeys()"
  />
</template>

<script setup lang="ts">
import { rotateGroupKeys } from 'src/code/api-interface/groups/key-rotation';
import { asyncDialog, handleError } from 'src/code/utils/misc';

const groupId = inject<string>('groupId')!;

async function _rotateGroupKeys() {
  try {
    await asyncDialog({
      title: 'Rotate encryption keys',
      message: 'Are you sure you want to rotate the group encryption keys?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    await rotateGroupKeys({ groupId });
  } catch (error: any) {
    handleError(error);
  }
}
</script>
