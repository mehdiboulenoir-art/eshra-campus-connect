import { describe, expect, it } from "vitest";
import { pollResults, recordDemoVote } from "@/lib/demo-polls";

describe("Interactive demo poll", () => {
  it("adds the student vote to the selected option and recalculates results", () => {
    const options = [{ votes: 142 }, { votes: 98 }, { votes: 76 }];
    const votes = recordDemoVote({}, { pollId: 1, option: 2, optionCount: 3 });
    expect(pollResults(options, votes[1])).toEqual({ total: 317, counts: [142, 98, 77], percentages: [45, 31, 24] });
  });
  it("does not count a second vote for the same poll", () => {
    const state = { 1: 0 };
    expect(recordDemoVote(state, { pollId: 1, option: 1, optionCount: 3 })).toBe(state);
  });
  it("rejects options outside the poll", () => {
    expect(recordDemoVote({}, { pollId: 1, option: 3, optionCount: 3 })).toEqual({});
  });
});