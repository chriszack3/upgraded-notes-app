import type { GroupJoinInvitationModel } from '@deeplib/db';
import type { DataField } from '@stdlib/data';
import { splitStr } from '@stdlib/misc';

import { userHasPermission } from '../../roles';

export const role: DataField<GroupJoinInvitationModel> = {
  notifyUpdates: true,

  userGettable: async ({ userId, suffix, dataAbstraction }) => {
    const [groupId, targetId] = splitStr(suffix, ':', 2);

    return (
      userId === targetId ||
      (await userHasPermission(
        dataAbstraction,
        userId,
        groupId,
        'viewGroupPages',
      ))
    );
  },

  columns: ['role'],
};
