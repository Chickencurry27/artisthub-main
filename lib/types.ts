export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  artistname: string | null;
  imageUrl: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  name: string | null;
  email: string;
  subscriptionTier: string;
};