import Link from 'next/link';
import { PROOF_TILES } from '@/lib/content/shopHome';
import styles from './ProofStrip.module.css';

/**
 * Four things the invitation does, as tiles rather than as demos.
 *
 * This is what replaced the two full-screen interactive demos that used to take
 * about 1,800px of the homepage between them and sold nothing directly. Each
 * tile links to the page that carries the real detail — and, now, the demo
 * itself: the guest experience on /features, the planning tools on
 * /wedding-planning-tools.
 */
export function ProofStrip() {
  return (
    <ul className={styles.strip}>
      {PROOF_TILES.map((tile) => (
        <li key={tile.id}>
          <Link href={tile.href} className={styles.tile}>
            <span className={styles.title}>{tile.title}</span>
            <span className={styles.text}>{tile.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
