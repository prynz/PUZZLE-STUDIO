/** The part of RNTL's host element this audit needs. */
interface HostNode {
  type: unknown;
  props: Record<string, unknown>;
  children: (HostNode | string)[];
  queryAll(predicate: (n: HostNode) => boolean): HostNode[];
}

export interface A11yIssue {
  testID: string;
  problem: string;
}

const textOf = (node: HostNode): string => node.children.map((c) => (typeof c === 'string' ? c : textOf(c))).join('');

/**
 * Every touchable host element must expose a role and a spoken name (label or visible text) –
 * VoiceOver / TalkBack read exactly this. Jest only (docs/development/testing.md, Phase 8).
 */
export function auditTouchables(root: HostNode | null): A11yIssue[] {
  if (!root) throw new Error('nothing rendered');
  const touchables = root.queryAll(
    (n) => typeof n.type === 'string' && typeof n.props.onClick === 'function' && n.props.accessible !== false,
  );
  const issues: A11yIssue[] = [];
  for (const n of touchables) {
    const id = String(n.props.testID ?? n.props.accessibilityLabel ?? '?');
    const label = n.props.accessibilityLabel ?? n.props['aria-label'];
    const name = typeof label === 'string' && label.trim() ? label : textOf(n).trim();
    if (!n.props.accessibilityRole && !n.props.role) issues.push({ testID: id, problem: 'no role' });
    if (!name) issues.push({ testID: id, problem: 'no spoken name' });
  }
  return issues;
}

export const touchableCount = (root: HostNode | null) =>
  (root?.queryAll((n) => typeof n.type === 'string' && typeof n.props.onClick === 'function') ?? []).length;
