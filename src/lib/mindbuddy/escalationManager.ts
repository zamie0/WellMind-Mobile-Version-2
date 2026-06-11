import type { DetectionDecision, EscalationOutcome } from './types';

const STORAGE_KEY = 'mindbuddy_escalation_state_v1';
const DEFAULT_COOLDOWN_MS = 10 * 60 * 1000;
const DEFAULT_DELTA_THRESHOLD = 25;

interface EscalationState {
  lastEscalationTimestamp: number;
  lastEscalationRisk: number;
}

const readState = (): EscalationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastEscalationTimestamp: 0, lastEscalationRisk: 0 };
    const parsed = JSON.parse(raw) as EscalationState;
    return {
      lastEscalationTimestamp: parsed?.lastEscalationTimestamp || 0,
      lastEscalationRisk: parsed?.lastEscalationRisk || 0,
    };
  } catch {
    return { lastEscalationTimestamp: 0, lastEscalationRisk: 0 };
  }
};

const writeState = (state: EscalationState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
};

export const applyEscalationCooldown = (
  requestedDecision: DetectionDecision,
  overallRisk: number,
  options?: { cooldownMs?: number; escalationDeltaThreshold?: number }
): EscalationOutcome => {
  const cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const escalationDeltaThreshold = options?.escalationDeltaThreshold ?? DEFAULT_DELTA_THRESHOLD;

  if (requestedDecision !== 'crisis_escalation') {
    return {
      finalDecision: requestedDecision,
      escalationAllowed: true,
      preventedByCooldown: false,
      reasons: ['no crisis escalation requested'],
    };
  }

  const now = Date.now();
  const state = readState();
  const elapsed = now - state.lastEscalationTimestamp;
  const riskDelta = overallRisk - state.lastEscalationRisk;

  if (elapsed < cooldownMs && riskDelta <= escalationDeltaThreshold) {
    return {
      finalDecision: 'peer_support_suggestion',
      escalationAllowed: false,
      preventedByCooldown: true,
      reasons: ['crisis escalation prevented by cooldown', `elapsed=${elapsed}ms`, `riskDelta=${riskDelta}`],
    };
  }

  writeState({ lastEscalationTimestamp: now, lastEscalationRisk: overallRisk });

  return {
    finalDecision: 'crisis_escalation',
    escalationAllowed: true,
    preventedByCooldown: false,
    reasons: ['crisis escalation allowed', `elapsed=${elapsed}ms`, `riskDelta=${riskDelta}`],
  };
};
