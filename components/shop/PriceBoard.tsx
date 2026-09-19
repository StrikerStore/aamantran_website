import { LinkButton } from '@/components/ui/Button';
import type { TemplateSummary } from '@/lib/api/types';
import { PLANNING_TOOLS } from '@/lib/content/entitlements';
import { pluralize } from '@/lib/format';
import { priceTiers } from '@/lib/priceTiers';
import styles from './PriceBoard.module.css';

/**
 * The price board, the way a shop puts one on the wall.
 *
 * The prices and the counts come from the live catalogue (lib/priceTiers.ts), so
 * this cannot disagree with what checkout charges or go stale when a design
 * ships. When the catalogue has more prices than a board can usefully carry, it
 * renders nothing and the page's "from ___" line does the work instead.
 *
 * The honest headline here is that the price is about the design and nothing
 * else. It lists only the inclusions `INCLUDED` marks as independent of the
 * design; the template-dependent ones (RSVP, wishes, maps, media) are left to
 * each design's own page, which is where they are confirmed. Answering "what
 * does the extra money buy?" on the shop floor is what makes this a sales
 * section rather than a knowledge one.
 */
export function PriceBoard({ templates }: { templates: readonly TemplateSummary[] }) {
  const tiers = priceTiers(templates);
  if (tiers.length < 2) return null;

  return (
    <div className={styles.board}>
      <ul className={styles.tiers}>
        {tiers.map((tier) => (
          <li key={tier.minor} className={styles.tier}>
            <p className={styles.amount}>
              {tier.label}
            </p>
            <p className={styles.count}>{pluralize(tier.count, 'invite')}</p>
          </li>
        ))}
      </ul>
      <p className={styles.same}>
        The price is for the look. Whichever invite you choose, you get the same invitation link, the same guest list, the
        same second link for selected ceremonies and the same {PLANNING_TOOLS.length} planning tools, for one
        payment. What a particular invite supports is listed on its own page.
      </p>
      <p className={styles.action}>
        <LinkButton href="/templates">See every invite</LinkButton>
      </p>
    </div>
  );
}
