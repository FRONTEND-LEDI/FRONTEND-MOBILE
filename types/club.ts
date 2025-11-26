export type Foro = {
  _id: string;
  title: string;
  description: string;
};
export type CommentUser = {
  _id: string;
  userName: string;
  avatar?: string;
};

export type Comment = {
  _id: string;
  idComent?: string;
  idForo: string;
  idUser: CommentUser | string | null;
  content: string;
  createdAt?: string;
};
