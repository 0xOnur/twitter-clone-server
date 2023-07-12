import { IAuthenticateRequest } from "../types/IAuthenticateRequest";
import { Request, Response } from "express";
import Poll from "../schemas/poll.schema";
import { IPoll } from "../types/IPoll";
import { Types } from "mongoose";

// Create Poll
export const createPoll = async (userId: string, pollData: IPoll) => {

  const newPoll = new Poll({
    author: userId, // assuming you have user info in req
    choices: pollData.choices.map((choice) => ({
      text: choice.text,
      votes: [],
    })),
    expiresAt: pollData.expiresAt,
  });

  try {
    const savedPoll = await newPoll.save();
    return savedPoll;
  } catch (error) {
    throw error;
  }
};


// Get Poll
export const getPoll =async (req: Request, res: Response) => {
  try {
    const pollId = req.params.pollId;

    const poll = await Poll.findById(pollId)

    if (!poll) {
      res.status(404).json({ message: "Poll not found" });
      return;
    }

    //calculate total votes and percentage choice
    const totalVotes = poll.choices.reduce((sum, choice) => sum + choice.votes.length, 0);
    const choicesWithPercentages = totalVotes 
  ? poll.choices.map((choice) => {
    return {
      text: choice.text,
      votes: choice.votes,
      _id: choice._id,
      percentage: (choice.votes.length / totalVotes) * 100,
    }
  }) 
  : poll.choices;

    //append totalvotes to poll
    const response = {
      ...poll.toJSON(),
      totalVotes,
      choices: choicesWithPercentages
    };

    res.status(200).json(response);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Vote Poll
export const votePoll =async (req: IAuthenticateRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const pollId = req.params.pollId;
    console.log("🚀 ~ file: pollController.ts:66 ~ votePoll ~ pollId:", pollId)
    const choiceId = req.query.choiceId;
    console.log("🚀 ~ file: pollController.ts:68 ~ votePoll ~ choiceId:", choiceId)

    const poll = await Poll.findById(pollId)

    if (!poll) {
      throw new Error("Poll not found");
    }

    //check if poll is expired
    if (poll.expiresAt < new Date()) {
      throw new Error("Poll is expired");
    }

    //check if user has already voted
    const hasVoted = poll.choices.some((choice) =>
      choice.votes.includes(new Types.ObjectId(userId))
    );

    if (hasVoted) {
      throw new Error("You have already voted");
    }

    //check if choice exists
    const choice = poll.choices.find(
      (choice) => choice._id!.toString() === choiceId
    );

    if (!choice) {
      throw new Error("Choice not found");
    }

    //add vote to choice
    choice.votes.push(new Types.ObjectId(userId));

    await poll.save();

    res.status(200).json({ message: "Voted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}