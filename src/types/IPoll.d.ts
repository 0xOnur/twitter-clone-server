interface IChoice {
  _id: string,
  text: string;
  votes: string[];
  percentage?: number;
}

interface IPoll {
  author: string;
  choices: IChoice[];
  expiresAt: Date;
}
