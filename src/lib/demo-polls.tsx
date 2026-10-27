import { createContext, useContext, useReducer, type ReactNode } from "react";

export type DemoVotes = Record<number, number>;
export function recordDemoVote(state: DemoVotes, action: { pollId: number; option: number; optionCount: number }): DemoVotes {
  if (state[action.pollId] !== undefined || !Number.isInteger(action.option) || action.option < 0 || action.option >= action.optionCount) return state;
  return { ...state, [action.pollId]: action.option };
}
export function pollResults(options: { votes: number }[], selected?: number) {
  const counts = options.map((option, index) => option.votes + (index === selected ? 1 : 0));
  const total = counts.reduce((sum, count) => sum + count, 0);
  return { total, counts, percentages: counts.map((count) => total ? Math.round(count / total * 100) : 0) };
}
const DemoPollContext = createContext<{ votes: DemoVotes; vote: (pollId: number, option: number, optionCount: number) => void }>({ votes: {}, vote: () => {} });
export function DemoPollProvider({ children }: { children: ReactNode }) {
  const [votes, dispatch] = useReducer(recordDemoVote, {});
  return <DemoPollContext.Provider value={{ votes, vote: (pollId, option, optionCount) => dispatch({ pollId, option, optionCount }) }}>{children}</DemoPollContext.Provider>;
}
export const useDemoPolls = () => useContext(DemoPollContext);