'use server';
import { auth, clerkClient } from '@clerk/nextjs';

export const leaveBeta = async () => {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Remove beta from their clerk public metadata
  const features = sessionClaims.metadata.features?.filter((feature) => feature !== 'beta') ?? [];
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      features,
    },
  });
};
