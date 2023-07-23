interface IChoice {
  _id: ObjectId,
  text: string;
  votes: string[];
  percentage?: number;
}

interface IPoll {
  author: ObjectId;
  choices: IChoice[];
  expiresAt: Date;
}
