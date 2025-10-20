export type AuthorType = {
  _id: string;
  fullName: string;
  biography: string;
  profession: string;
  birthdate: Date;
  birthplace: string;
  nationality: string;
  writingGenre: string[];
  avatar: {
    id_image: string;
    url_secura: string;
  };
}