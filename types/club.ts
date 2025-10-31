export type Foro = {
  _id: string;
  title: string;
  description: string;
};
export type CommentUser = {
  _id: string;
  userName?: string;
};

export type Comentario = {
  _id: string;
  idComent?: string;
  idForo: string;
  idUser: string | CommentUser;
  content: string;
  createdAt?: string;
};
