'use client';

import { useMemo, useReducer, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { PLANNING_TOOLS } from '@/lib/content/entitlements';
import {
  SAMPLE_BUDGET_TOTAL,
  SAMPLE_EXPENSES,
  SAMPLE_TASKS,
  SAMPLE_TIMELINE,
  SAMPLE_VENDORS,
  SAMPLE_WORKSPACE_NOTICE,
} from '@/lib/content/sampleWorkspace';
import { cx } from '@/lib/cx';
import { makeWorkspace, taskStatusLabel, workspaceReducer, workspaceTotals } from '@/lib/demos/workspace';
import { formatMoney, STOREFRONT } from '@/lib/storefront';
import { track } from '@/lib/track';
import styles from './PlanningDemo.module.css';

/**
 * The planning tools, working, on the homepage.
 *
 * Budget and tasks are real: the numbers add up, expenses can be added, marked
 * paid and removed, and tasks move through the three stages the dashboard uses.
 * Nothing is stored or sent, and the tools that are only previewed here say so
 * rather than pretending to be interactive.
 */

/** Sample amounts are whole rupees or dollars; formatMoney takes minor units. */
const money = (amount: number) => formatMoney(Math.round(amount) * 100);

const PREVIEW_TOOLS = ['inventory', 'gifts', 'moodboard', 'photowall'];

export function PlanningDemo() {
  const initial = useMemo(
    () => makeWorkspace(
      SAMPLE_BUDGET_TOTAL[STOREFRONT],
      SAMPLE_EXPENSES.map((expense) => ({
        id: expense.id,
        label: expense.label,
        category: expense.category,
        amount: expense.amount[STOREFRONT],
        paid: expense.paid,
      })),
      SAMPLE_TASKS.map((task) => ({ ...task })),
    ),
    [],
  );
  const [state, dispatch] = useReducer(workspaceReducer, initial);
  const [draft, setDraft] = useState({ label: '', amount: '' });
  const reported = useRef<Set<string>>(new Set());
  const totals = workspaceTotals(state);

  /** One event per kind of interaction, so a curious visitor is not a hundred events. */
  function report(action: string) {
    if (reported.current.has(action)) return;
    reported.current.add(action);
    track('planning_demo_interaction', { action });
  }

  const budgetPanel = (
    <div className={styles.panelInner}>
      <div className={styles.budgetHead}>
        <label className={styles.label} htmlFor="demo-budget">
          Total budget
        </label>
        <input
          id="demo-budget"
          className={styles.control}
          type="number"
          min={0}
          step={1000}
          value={state.budget}
          onChange={(event) => {
            dispatch({ type: 'set-budget', value: Number(event.target.value) });
            report('budget');
          }}
        />
      </div>

      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Budget committed"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={totals.committedPercent}
        aria-valuetext={`${money(totals.committed)} of ${money(state.budget)} committed`}
      >
        <span className={cx(styles.fill, totals.over && styles.over)} style={{ width: `${totals.committedPercent}%` }} />
        <span className={styles.paidFill} style={{ width: `${totals.paidPercent}%` }} />
      </div>

      <p className={styles.totals} aria-live="polite">
        <span>
          <strong>{money(totals.committed)}</strong> committed
        </span>
        <span>
          <strong>{money(totals.paid)}</strong> paid
        </span>
        <span className={totals.over ? styles.overText : undefined}>
          <strong>{money(Math.abs(totals.remaining))}</strong> {totals.over ? 'over budget' : 'left'}
        </span>
      </p>

      <ul className={styles.rows}>
        {state.expenses.map((expense) => (
          <li key={expense.id}>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{expense.label}</span>
              <span className={styles.rowMeta}>{expense.category}</span>
            </span>
            <span className={styles.rowAmount}>{money(expense.amount)}</span>
            <button
              type="button"
              aria-pressed={expense.paid}
              className={cx(styles.paidToggle, expense.paid && styles.paidOn)}
              onClick={() => {
                dispatch({ type: 'toggle-paid', id: expense.id });
                report('paid');
              }}
            >
              {expense.paid ? 'Paid' : 'Unpaid'}
            </button>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${expense.label}`}
              onClick={() => {
                dispatch({ type: 'remove-expense', id: expense.id });
                report('remove');
              }}
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>

      <form
        className={styles.addRow}
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: 'add-expense', label: draft.label, amount: Number(draft.amount) });
          setDraft({ label: '', amount: '' });
          report('add');
        }}
      >
        <label className="visually-hidden" htmlFor="demo-expense-label">
          Expense
        </label>
        <input
          id="demo-expense-label"
          className={styles.control}
          placeholder="Mehendi artist"
          value={draft.label}
          onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
        />
        <label className="visually-hidden" htmlFor="demo-expense-amount">
          Amount
        </label>
        <input
          id="demo-expense-amount"
          className={styles.control}
          type="number"
          min={0}
          placeholder="15000"
          value={draft.amount}
          onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
        />
        <Button type="submit" variant="secondary" disabled={!draft.label.trim() || Number(draft.amount) <= 0}>
          Add
        </Button>
      </form>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          dispatch({ type: 'reset', to: initial });
          report('reset');
        }}
      >
        Reset the sample
      </Button>
    </div>
  );

  const tasksPanel = (
    <div className={styles.panelInner}>
      <p className={styles.note}>Tap a status to move a task on. Who is responsible is a label, not a separate login.</p>
      <ul className={styles.rows}>
        {state.tasks.map((task) => (
          <li key={task.id}>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{task.title}</span>
              <span className={styles.rowMeta}>
                {task.category} · {task.owner}
              </span>
            </span>
            <button
              type="button"
              className={cx(styles.status, styles[task.status])}
              onClick={() => {
                dispatch({ type: 'cycle-task', id: task.id });
                report('task');
              }}
            >
              {taskStatusLabel(task.status)}
              <span className="visually-hidden"> — change status</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const vendorsPanel = (
    <div className={styles.panelInner}>
      <ul className={styles.rows}>
        {SAMPLE_VENDORS.map((vendor) => (
          <li key={vendor.id}>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{vendor.name}</span>
              <span className={styles.rowMeta}>{vendor.type}</span>
            </span>
            <Badge tone={vendor.status === 'Booked' ? 'success' : 'neutral'}>{vendor.status}</Badge>
          </li>
        ))}
      </ul>
      <p className={styles.note}>{PLANNING_TOOLS.find((tool) => tool.key === 'vendors')?.limit}</p>
    </div>
  );

  const timelinePanel = (
    <div className={styles.panelInner}>
      <ol className={styles.timeline}>
        {SAMPLE_TIMELINE.map((entry) => (
          <li key={entry.id}>
            <span className={styles.time}>{entry.time}</span>
            <span className={styles.rowMain}>
              <span className={styles.rowTitle}>{entry.title}</span>
              <span className={styles.rowMeta}>{entry.who}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className={styles.note}>{PLANNING_TOOLS.find((tool) => tool.key === 'timeline')?.limit}</p>
    </div>
  );

  return (
    // data-demo is a stable hook for the browser tests; see GuestExperienceDemo.
    <div className={styles.wrap} data-demo="planning">
      <Tabs
        label="Planning tools"
        className={styles.tabs}
        onChange={(id) => report(`tab:${id}`)}
        items={[
          { id: 'budget', label: 'Budget', content: budgetPanel },
          { id: 'tasks', label: 'Tasks', content: tasksPanel },
          { id: 'vendors', label: 'Vendors', content: vendorsPanel },
          { id: 'timeline', label: 'Day-of timeline', content: timelinePanel },
        ]}
      />
      {/* A sentence, not a label — see GuestExperienceDemo. */}
      <p className={styles.sampleNote}>{SAMPLE_WORKSPACE_NOTICE}</p>

      <h3 className={styles.previewTitle}>Also in your dashboard</h3>
      <ul className={styles.previews}>
        {PLANNING_TOOLS.filter((tool) => PREVIEW_TOOLS.includes(tool.key)).map((tool) => (
          <li key={tool.key}>
            <p className={styles.previewName}>{tool.name}</p>
            <p className={styles.previewText}>{tool.does}</p>
            <p className={styles.previewLimit}>{tool.limit}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
