export type User = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
  prompts: Prompt[];
};

export type Feedback = {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  user: User;
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPublic: boolean;
  remixOf?: string | null;
  author: User;
  remixCount: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string | null;
  feedbacks: Feedback[];
};

