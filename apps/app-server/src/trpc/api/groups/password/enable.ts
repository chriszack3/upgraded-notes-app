import { isNanoID } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import type { InferProcedureOpts } from 'src/trpc/helpers';
import { authProcedure } from 'src/trpc/helpers';
import {
  computePasswordHash,
  encryptGroupRehashedPasswordHash,
} from 'src/utils/crypto';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),

    groupPasswordHash: z.instanceof(Uint8Array),

    groupEncryptedContentKeyring: z.instanceof(Uint8Array),
  }),
);

export const enableProcedure = once(() => baseProcedure.mutation(enable));

export async function enable({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`], [`group-lock:${input.groupId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        // Assert agent is subscribed

        await ctx.assertUserSubscribed({ userId: ctx.userId });

        // Check if user can edit group settings

        await ctx.assertSufficientGroupPermissions({
          userId: ctx.userId,
          groupId: input.groupId,
          permission: 'editGroupSettings',
        });

        // Check if group is password protected

        if (
          await ctx.dataAbstraction.hget(
            'group',
            input.groupId,
            'is-password-protected',
          )
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This group is already password protected.',
          });
        }

        // Enable password protection

        await ctx.dataAbstraction.patch(
          'group',
          input.groupId,
          {
            encrypted_rehashed_password_hash: encryptGroupRehashedPasswordHash(
              computePasswordHash(input.groupPasswordHash),
            ),

            encrypted_content_keyring: input.groupEncryptedContentKeyring,
          },
          { dtrx },
        );

        checkRedlockSignalAborted(signals);
      });
    },
  );
}
