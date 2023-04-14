import { once } from 'lodash';
import { trpc } from 'src/trpc/server';

import { registerProcedure } from './register';
import { verifyEmailProcedure } from './verify-email';

export const usersRouter = once(() =>
  trpc.router({
    register: registerProcedure(),
    verifyEmail: verifyEmailProcedure(),
  }),
);
