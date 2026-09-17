/**
 * The planning workspace behind the homepage demo, as a pure state machine.
 *
 * Mirrors what the dashboard's budget and task tools actually do — a total you
 * set, expenses you log and mark paid, tasks you move through three stages —
 * so the demo teaches the real thing. Nothing is stored or sent.
 *
 * Amounts are whole units of the storefront currency (rupees or dollars), which
 * is how the sample data is written.
 *
 * Kept free of imports so it can be tested directly under Node.
 */

export type WorkspaceTaskStatus = 'todo' | 'in_progress' | 'done';

export const TASK_STATUS_ORDER: readonly WorkspaceTaskStatus[] = ['todo', 'in_progress', 'done'];
export const MAX_EXPENSES = 12;
export const MAX_LABEL_LENGTH = 40;

export interface WorkspaceExpense {
  id: string;
  label: string;
  category: string;
  amount: number;
  paid: boolean;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  category: string;
  owner: string;
  status: WorkspaceTaskStatus;
}

export interface WorkspaceState {
  budget: number;
  expenses: WorkspaceExpense[];
  tasks: WorkspaceTask[];
  /** Counts every expense ever added here, so new ids never collide. */
  added: number;
}

export type WorkspaceAction =
  | { type: 'add-expense'; label: string; amount: number }
  | { type: 'toggle-paid'; id: string }
  | { type: 'remove-expense'; id: string }
  | { type: 'set-budget'; value: number }
  | { type: 'cycle-task'; id: string }
  // Reset carries the state to go back to: the reducer is pure and cannot know
  // which sample workspace this demo started from.
  | { type: 'reset'; to: WorkspaceState };

export interface WorkspaceTotals {
  committed: number;
  paid: number;
  remaining: number;
  over: boolean;
  /** 0–100, for the progress bar. */
  committedPercent: number;
  paidPercent: number;
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export function makeWorkspace(budget: number, expenses: WorkspaceExpense[], tasks: WorkspaceTask[]): WorkspaceState {
  return { budget: positive(budget), expenses, tasks, added: 0 };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'add-expense': {
      const label = action.label.trim().slice(0, MAX_LABEL_LENGTH);
      const amount = positive(action.amount);
      // Nothing to add without both a name and an amount, and the list stays
      // short enough to read on a phone.
      if (!label || amount === 0 || state.expenses.length >= MAX_EXPENSES) return state;
      const added = state.added + 1;
      return {
        ...state,
        added,
        expenses: [...state.expenses, { id: `added-${added}`, label, category: 'Added by you', amount, paid: false }],
      };
    }
    case 'toggle-paid':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.id ? { ...expense, paid: !expense.paid } : expense),
      };
    case 'remove-expense':
      return { ...state, expenses: state.expenses.filter((expense) => expense.id !== action.id) };
    case 'set-budget':
      return { ...state, budget: positive(action.value) };
    case 'cycle-task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, status: TASK_STATUS_ORDER[(TASK_STATUS_ORDER.indexOf(task.status) + 1) % TASK_STATUS_ORDER.length] }
            : task),
      };
    case 'reset':
      return action.to;
    default:
      return state;
  }
}

/** What the numbers add up to. `remaining` goes negative once you are over budget. */
export function workspaceTotals(state: WorkspaceState): WorkspaceTotals {
  const committed = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paid = state.expenses.reduce((sum, expense) => sum + (expense.paid ? expense.amount : 0), 0);
  const percent = (value: number) => (state.budget > 0 ? Math.min(100, Math.round((value / state.budget) * 100)) : 0);
  return {
    committed,
    paid,
    remaining: state.budget - committed,
    over: committed > state.budget,
    committedPercent: percent(committed),
    paidPercent: percent(paid),
  };
}

export function taskStatusLabel(status: WorkspaceTaskStatus): string {
  return status === 'todo' ? 'To do' : status === 'in_progress' ? 'In progress' : 'Done';
}
