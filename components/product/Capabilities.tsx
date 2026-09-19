import { Badge } from '@/components/ui/Badge';
import type { TemplateCapabilities } from '@/lib/api/types';
import { languageLabel } from '@/lib/format';
import styles from './Capabilities.module.css';

/**
 * What this design asks you to fill in, read from the published design itself
 * rather than written by hand, so it cannot drift from what a buyer receives.
 *
 * Anything the design does not declare is left out entirely, and RSVP and guest
 * wishes are shown only when they are known either way — an unreadable design
 * says nothing rather than guessing.
 */
export function Capabilities({ capabilities }: { capabilities: TemplateCapabilities }) {
  const { people, ceremonyFields, mediaSlots, customFieldLabels, languages, rsvp, wishes } = capabilities;
  const guestFeatures = [
    rsvp === true ? 'RSVP form' : null,
    wishes === true ? 'Guest wishes' : null,
  ].filter((v): v is string => v !== null);

  const groups: { id: string; title: string; items: string[] }[] = [
    people && people.length > 0 ? { id: 'people', title: 'Names on the invitation', items: people.map((p) => p.label) } : null,
    ceremonyFields && ceremonyFields.length > 0 ? { id: 'ceremony', title: 'For each ceremony', items: ceremonyFields } : null,
    mediaSlots && mediaSlots.length > 0
      ? {
          id: 'media',
          title: 'Photos, video and music',
          items: mediaSlots.map((slot) => (slot.multiple && slot.max ? `${slot.label} (up to ${slot.max})` : slot.label)),
        }
      : null,
    customFieldLabels && customFieldLabels.length > 0 ? { id: 'custom', title: 'Other details', items: customFieldLabels } : null,
    languages.length > 0 ? { id: 'languages', title: 'Languages', items: languages.map(languageLabel) } : null,
    guestFeatures.length > 0 ? { id: 'guests', title: 'For your guests', items: guestFeatures } : null,
  ].filter((group): group is { id: string; title: string; items: string[] } => group !== null);

  if (groups.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <dl className={styles.groups}>
        {groups.map((group) => (
          <div key={group.id} className={styles.group}>
            <dt className={styles.groupTitle}>{group.title}</dt>
            <dd className={styles.groupItems}>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <Badge>{item}</Badge>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <p className={styles.note}>Read from this invite itself, so it matches what you receive.</p>
    </div>
  );
}
