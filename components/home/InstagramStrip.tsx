import { getInstagramHandle } from '@/lib/publicEnv';
import styles from './InstagramStrip.module.css';

/**
 * A follow strip, and nothing more.
 *
 * No API, no embedded feed, no follower count — the owner asked for the simple
 * version, and it is also the honest one: an embedded grid would need a token
 * and would break the day it expired, and a follower figure the site cannot
 * read is a number nobody can check.
 *
 * WHY THERE IS NO SENTENCE ABOUT WHAT IS ON THE ACCOUNT. Anything of the form
 * "new designs land here first" or "see what couples made of theirs" is a claim
 * about content this site cannot verify, which is the kind of line the claims
 * rules exist to keep off the page. The handle and the button are true on their
 * own. If the owner confirms what the account posts, one line goes here.
 *
 * The handle comes from NEXT_PUBLIC_INSTAGRAM_HANDLE, the same value the footer
 * and the Organization JSON-LD use, so there is one account to keep current.
 */
export function InstagramStrip() {
  const handle = getInstagramHandle();

  return (
    <div className={styles.strip}>
      <span className={styles.mark} aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <p className={styles.handle}>@{handle}</p>
      <a
        href={`https://www.instagram.com/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.follow}
      >
        Follow on Instagram
      </a>
    </div>
  );
}
