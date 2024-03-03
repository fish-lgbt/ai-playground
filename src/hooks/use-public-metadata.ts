import { useUser } from '@clerk/nextjs';

type PublicMetadata = {
  roles?: string[];
  plan?: string;
};

export const usePublicMetadata = () => {
  const { user } = useUser();
  return user?.publicMetadata as PublicMetadata;
};
