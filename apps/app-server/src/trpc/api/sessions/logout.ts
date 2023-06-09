import { once } from 'lodash';
import type { InferProcedureOpts } from 'src/trpc/helpers';
import { optionalAuthProcedure } from 'src/trpc/helpers';
import { clearCookies } from 'src/utils/cookies';

export const logoutProcedure = once(() =>
  optionalAuthProcedure.mutation(logout),
);

export async function logout({
  ctx,
}: InferProcedureOpts<typeof optionalAuthProcedure>) {
  // Invalidate session

  if (ctx.sessionId != null) {
    await ctx.dataAbstraction.patch('session', ctx.sessionId, {
      invalidated: true,
    });
  }

  // Clear cookies

  clearCookies(ctx.res);
}
