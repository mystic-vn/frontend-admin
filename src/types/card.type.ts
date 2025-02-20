export interface Card {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  keywords: string[];
  meanings: {
    upright: string[];
    reversed: string[];
  };
  suit?: string;
  arcanaType: string;
  number?: number;
} 