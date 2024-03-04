import { useUser } from '@clerk/nextjs';

export const usePublicMetadata = () => {
  const { user } = useUser();
  return user?.publicMetadata;
};
