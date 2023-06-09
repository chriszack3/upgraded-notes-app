import type { GroupMemberModel } from '@deeplib/db';
import type { DataField } from '@stdlib/data';
import { splitStr } from '@stdlib/misc';

import { userHasPermission } from '../../roles';

export const encryptedName: DataField<GroupMemberModel> = {
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
  userSettable: ({ userId, suffix }) => userId === splitStr(suffix, ':', 2)[1],

  columns: ['encrypted_name'],
};
