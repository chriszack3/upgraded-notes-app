<template>
  <div style="font-weight: bold; font-size: 19px; max-width: 240px">
    {{ groupNames()(page.react.groupId).get().text }}
  </div>

  <Gap style="height: 8px" />

  <div>This group is password protected.</div>

  <Gap style="height: 12px" />

  <q-form style="display: flex; flex-direction: column; width: 240px">
    <PasswordField
      placeholder="Password"
      autocomplete="current-password"
      v-model="password"
    />

    <Gap style="height: 16px" />

    <DeepBtn
      label="Enter"
      type="submit"
      color="primary"
      style="font-size: 16px"
      delay
      @click.prevent="onEnterPassword()"
    />
  </q-form>
</template>

<script setup lang="ts">
import { DataLayer } from '@stdlib/crypto';
import { computeGroupPasswordValues } from 'src/code/crypto';
import { groupContentKeyrings } from 'src/code/pages/computed/group-content-keyrings';
import { groupNames } from 'src/code/pages/computed/group-names';
import type { Page } from 'src/code/pages/page/page';
import { GROUP_CONTENT_KEYRING } from 'src/stores/pages';

const page = inject<Page>('page')!;

const password = ref('');

async function onEnterPassword() {
  try {
    let groupContentKeyring = await groupContentKeyrings()(
      page.react.groupId,
    ).getAsync();

    if (groupContentKeyring == null) {
      throw new Error('Group keyring not found.');
    }

    if (groupContentKeyring.topLayer === DataLayer.Symmetric) {
      const groupPasswordValues = await computeGroupPasswordValues(
        page.react.groupId,
        password.value,
      );

      groupContentKeyring = groupContentKeyring.unwrapSymmetric(
        groupPasswordValues.passwordKey,
        {
          associatedData: {
            context: 'GroupContentKeyringPasswordProtection',
            groupId: page.react.groupId,
          },
        },
      );
    }

    pagesStore().dict[`${GROUP_CONTENT_KEYRING}:${page.react.groupId}`] =
      groupContentKeyring;
  } catch (error) {
    $quasar().notify({
      message: 'Incorrect password.',
      type: 'negative',
    });

    mainLogger.error(error);
  }
}
</script>
