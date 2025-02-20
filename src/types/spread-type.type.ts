export interface SpreadType {
  _id: string;
  name: string;
  description: string;
  positions: Array<{
    position: number;
    aspect: string;
  }>;
  context: string;
} 