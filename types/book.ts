export enum format {
  BOOK = "ebook",
  AUDIO = "audiobook",
  VIDEO= "videobook",
}

export interface BookType {
  _id: string;
  title: string;
  author: [{ 
    _id:string
    fullName:string
  }];
  bookCoverImage?: { url_secura?: string };
  summary?: string;
  synopsis?: string;
  available: boolean;
  subgenre?: string[];
  theme?: string[];
  yearBook?: string;
  contentBook?: { url_secura?: string };
  totalPages?: number;
  duration?: number;
  genre?: string;
  level?: string;
  format?: format;
  fileExtension: string;
}
