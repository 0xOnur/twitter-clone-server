interface IChoice {
  _id: IObjectId,
  text: string;
  votes: string[];
  percentage?: number;
}

interface IPoll {
  author: IObjectId;
  choices: IChoice[];
  expiresAt: Date;
}
