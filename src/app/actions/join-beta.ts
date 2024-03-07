'use server';
import { auth, clerkClient } from '@clerk/nextjs';

export const joinBeta = async () => {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    throw new Error('Not authenticated');
  }

  // Add beta to their clerk public metadata
  const features = sessionClaims.metadata.features ?? [];
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      features: [...new Set([...features, 'beta' as const]).values()],
    },
  });
};
