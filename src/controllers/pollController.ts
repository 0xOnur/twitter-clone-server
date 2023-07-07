import Poll from "../schemas/poll.schema";
import { IPoll } from "../types/IPoll";

export const createPoll = async (userId: string, pollData: IPoll) => {
  // duration object to milliseconds
  const durationInMs =
    pollData.duration.days * 24 * 60 * 60 * 1000 +
    pollData.duration.hours * 60 * 60 * 1000 +
    pollData.duration.minutes * 60 * 1000;

  const expiryDate = new Date(Date.now() + durationInMs);

  const newPoll = new Poll({
    userId: userId, // assuming you have user info in req
    choices: pollData.choices.map((choice) => ({
      text: choice.text,
      votes: [],
    })),
    active: pollData.showPoll,
    expiresAt: expiryDate,
  });

  try {
    const savedPoll = await newPoll.save();
    return savedPoll;
  } catch (error) {
    throw error;
  }
};
