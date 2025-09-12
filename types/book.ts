export type BookType = {
    _id: string;
    title: string;
    author: [
      {
        _id: string;
        name: string;
      }
    ];
    bookCoverImage: {
      url_secura: string;
    };
    synopsis: string;
    description?: string;
    genre?: string;
    yearBook?: string;
    theme?: string[];
    contentBook: {
      url_secura: string;
    };
  };