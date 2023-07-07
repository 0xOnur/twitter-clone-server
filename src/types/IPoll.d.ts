interface IChoice {
  id: number;
  text: string;
}

interface IDuration {
  days: number;
  hours: number;
  minutes: number;
}

export interface IPoll {
  choices: IChoice[];
  duration: IDuration;
  showPoll: boolean;
}
