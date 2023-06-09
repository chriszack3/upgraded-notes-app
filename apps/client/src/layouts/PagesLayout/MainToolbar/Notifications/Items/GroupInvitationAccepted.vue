<template>
  <NotificationItem
    :notification="notification"
    @click="onClick"
  >
    <q-item-label>{{ notificationInfo.get()?.message }}</q-item-label>
  </NotificationItem>
</template>

<script setup lang="ts">
import type { DeepNotesNotification } from '@deeplib/misc';
import { wrapSymmetricKey } from '@stdlib/crypto';
import { createSmartComputed } from '@stdlib/vue';
import { unpack } from 'msgpackr';
import type { QMenu } from 'quasar';
import { getGroupInvitationAcceptedNotificationInfo } from 'src/code/pages/notifications/group-invitation-accepted';
import GroupSettingsDialog from 'src/layouts/PagesLayout/RightSidebar/PageProperties/GroupSettingsDialog/GroupSettingsDialog.vue';
import type { Ref } from 'vue';

import NotificationItem from '../NotificationItem.vue';

const props = defineProps<{
  notification: DeepNotesNotification;
}>();

const notificationContent = computed(() => {
  const symmetricKey = wrapSymmetricKey(
    internals.keyPair.decrypt(props.notification.encryptedSymmetricKey),
  );

  return unpack(
    symmetricKey.decrypt(props.notification.encryptedContent, {
      padding: true,
      associatedData: { context: 'UserNotificationContent' },
    }),
  );
});

const notificationInfo = createSmartComputed({
  get: () =>
    getGroupInvitationAcceptedNotificationInfo(notificationContent.value),
});

const notificationsMenu = inject('notificationsMenu') as Ref<QMenu>;

async function onClick() {
  await router().push(`/groups/${notificationContent.value.groupId}`);

  $quasar().dialog({
    component: GroupSettingsDialog,

    componentProps: {
      groupId: notificationContent.value.groupId,
      initialTab: 'Members',
    },
  });

  notificationsMenu.value.hide();
}
</script>
