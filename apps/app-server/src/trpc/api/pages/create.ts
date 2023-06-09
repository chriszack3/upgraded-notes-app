import { isNanoID } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import type { InferProcedureOpts } from 'src/trpc/helpers';
import { authProcedure } from 'src/trpc/helpers';
import { createGroup, groupCreationSchema } from 'src/utils/groups';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    parentPageId: z.string().refine(isNanoID),
    groupId: z.string().refine(isNanoID),
    pageId: z.string().refine(isNanoID),

    pageEncryptedSymmetricKeyring: z.instanceof(Uint8Array),
    pageEncryptedRelativeTitle: z.instanceof(Uint8Array),
    pageEncryptedAbsoluteTitle: z.instanceof(Uint8Array),

    groupCreation: groupCreationSchema().optional(),
  }),
);

export const createProcedure = once(() => baseProcedure.mutation(create));

export async function create({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`], [`group-lock:${input.groupId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        // Check sufficient permissions

        if (input.groupCreation == null) {
          await ctx.assertSufficientGroupPermissions({
            userId: ctx.userId,
            groupId: input.groupId,
            permission: 'editGroupPages',
          });
        }

        // Get some necessary user data

        const [userPlan, personalGroupId] = await ctx.dataAbstraction.hmget(
          'user',
          ctx.userId,
          ['plan', 'personal-group-id'],
        );

        // Assert agent is subscribed

        if (input.groupId !== personalGroupId || input.groupCreation != null) {
          await ctx.assertUserSubscribed({ userId: ctx.userId });
        }

        // Check if can create page

        let numFreePages;

        if (userPlan !== 'pro') {
          numFreePages =
            (await ctx.dataAbstraction.hget(
              'user',
              ctx.userId,
              'num-free-pages',
            )) + 1;

          if (numFreePages > 50) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You have reached your limit of 50 free pages.',
            });
          }

          await ctx.dataAbstraction.patch(
            'user',
            ctx.userId,
            { num_free_pages: numFreePages },
            { dtrx },
          );
        }

        // Create group if requested

        if (input.groupCreation != null) {
          await createGroup({
            userId: ctx.userId,

            groupId: input.groupId,
            groupIsPersonal: false,
            groupMainPageId: input.pageId,

            ...input.groupCreation,

            dtrx,
          });
        }

        // Create page

        await Promise.all([
          ctx.dataAbstraction.insert(
            'page',
            input.pageId,
            {
              id: input.pageId,
              encrypted_symmetric_keyring: input.pageEncryptedSymmetricKeyring,
              encrypted_relative_title: input.pageEncryptedRelativeTitle,

              encrypted_absolute_title: input.pageEncryptedAbsoluteTitle,
              group_id: input.groupId,
              free: userPlan !== 'pro',
            },
            { dtrx },
          ),

          ctx.dataAbstraction.insert(
            'user-page',
            `${ctx.userId}:${input.pageId}`,
            {
              user_id: ctx.userId,
              page_id: input.pageId,
              last_parent_id: input.parentPageId,
            },
            { dtrx },
          ),
        ]);

        checkRedlockSignalAborted(signals);

        return {
          pageId: input.pageId,

          numFreePages: numFreePages,
        };
      });
    },
  );
}
