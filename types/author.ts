export type AuthorType = {
  _id: string;
  fullName: string;
  biography: string;
  avatar: {
    id_image: string;
    url_secura: string;
  };
  bibliography?: string[];
};
