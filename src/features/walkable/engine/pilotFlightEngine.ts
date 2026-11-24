import type { PilotCheckpoint } from '@/src/data/pilotExperienceContent';

export type PilotMode = 'parked' | 'course' | 'landing-preview' | 'approach' | 'flare' | 'landed';
export type PilotAxes = { side: number; lift: number };

export type FlightState = {
  x: number;
  height: number;
  z: number;
  lateral: number;
  vertical: number;
  bank: number;
  pitch: number;
  runwayStart: number;
  flareTime: number;
};

export const PILOT_LANDING_TOLERANCE = 24;

export function initialFlightState(milestone: number): FlightState {
  return {
    x: milestone >= 3 && milestone < 4 ? -65 : 0,
    height: milestone === 1 || milestone >= 4 ? 3 : milestone === 3 ? 88 : 102,
    z: 0, lateral: 0, vertical: 0, bank: 0, pitch: 0,
    runwayStart: milestone === 1 || milestone >= 4 ? -20 : 380,
    flareTime: 0,
  };
}

export function prepareLanding(state: FlightState) {
  state.runwayStart = state.z + 320;
  state.height = Math.max(65, state.height);
  state.lateral = 0;
  state.vertical = 0;
}

const limit = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function stepPilotFlight(
  state: FlightState, mode: PilotMode, axes: PilotAxes, dt: number,
  target: PilotCheckpoint | undefined, tolerance: number, drift: number, canAdvance: boolean,
): 'checkpoint' | 'aligned' | 'landed' | undefined {
  const controlled = mode === 'course' || mode === 'approach';
  const side = controlled ? axes.side : 0;
  const lift = controlled ? axes.lift : 0;
  const response = Math.min(1, dt * 7);
  state.bank += ((side * 0.106) - state.bank) * response;
  state.pitch += ((lift * 19) - state.pitch) * response;

  if (mode === 'flare') {
    const remaining = Math.max(0, 2.7 - state.flareTime);
    state.flareTime += dt;
    state.height = 3 + (state.height - 3) * Math.max(0, 1 - dt / Math.max(dt, remaining));
    state.x += -state.x * Math.min(1, dt * 1.6);
    state.z += Math.max(18, remaining * 30) * dt;
    return remaining <= dt && canAdvance ? 'landed' : undefined;
  }

  if (!controlled) return;

  const breeze = mode === 'course' ? Math.sin(state.z / 148 + 1) * drift : 0;
  state.lateral += (side * 84 + breeze - state.lateral) * response;
  state.vertical += (lift * 70 - state.vertical) * response;
  state.x = limit(state.x + state.lateral * dt, -165, 165);
  state.height = limit(state.height + state.vertical * dt, mode === 'approach' ? 12 : 62, 220);

  if (mode === 'course' && target) {
    const aligned = Math.abs(state.x - target.x) <= tolerance && Math.abs(state.height - target.height) <= tolerance * 0.82;
    const depth = aligned && canAdvance ? target.z - 46 : target.z - 74;
    state.z = Math.min(Math.max(state.z, depth), state.z + 69 * dt);
    if (aligned && canAdvance && state.z >= target.z - 46) {
      state.z = target.z + 1;
      return 'checkpoint';
    }
  } else if (mode === 'approach') {
    const aligned = Math.abs(state.x) <= PILOT_LANDING_TOLERANCE && state.height <= 31;
    const depth = state.runwayStart - (aligned && canAdvance ? 52 : 100);
    state.z = Math.min(Math.max(state.z, depth), state.z + 61 * dt);
    if (aligned && canAdvance && state.z >= state.runwayStart - 52) {
      state.flareTime = 0;
      return 'aligned';
    }
  }
}

export function pilotCorrection(state: FlightState, target: PilotCheckpoint | undefined, tolerance: number, landing: boolean) {
  const x = landing ? 0 : target?.x ?? state.x;
  const y = landing ? 25 : target?.height ?? state.height;
  const dx = x - state.x;
  const dy = y - state.height;
  const horizontal = Math.abs(dx) <= tolerance ? '' : dx > 0 ? 'Sağa' : 'Sola';
  const vertical = landing ? (state.height <= 31 ? '' : 'Alçal') : Math.abs(dy) <= tolerance * 0.82 ? '' : dy > 0 ? 'Yüksel' : 'Alçal';
  return { horizontal, vertical };
}
