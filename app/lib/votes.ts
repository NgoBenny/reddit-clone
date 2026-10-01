import type { Vote } from "@prisma/client";

export function getVoteSummary(
  votes: Pick<Vote, "userId" | "voteType">[],
  userId?: string,
) {
  return {
    voteCount: votes.reduce((count, vote) => count + (vote.voteType === "UP" ? 1 : -1), 0),
    currentVote: userId ? votes.find((vote) => vote.userId === userId)?.voteType : undefined,
  };
}
