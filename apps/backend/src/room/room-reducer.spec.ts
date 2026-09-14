import { describe, expect, it } from 'vitest';

import { applyAction, initRoomState } from './room-reducer.js';

describe('room-reducer', () => {
  it('joins a player in lobby', () => {
    const state = initRoomState({
      id: 'ABC123',
      hostId: 'p1',
      hostNickname: 'Host',
      now: 1000,
    });

    const { next, emit } = applyAction(state, {
      type: 'joinRoom',
      playerId: 'p2',
      nickname: 'Guest',
      now: 2000,
    });

    expect(next.players).toHaveLength(2);
    expect(emit).toEqual([
      {
        type: 'player.joined',
        player: {
          id: 'p2',
          nickname: 'Guest',
          joinedAt: 2000,
          connected: true,
        },
      },
    ]);
  });

  it('promotes host on host leave', () => {
    let state = initRoomState({
      id: 'ABC123',
      hostId: 'p1',
      hostNickname: 'Host',
      now: 1000,
    });
    ({ next: state } = applyAction(state, {
      type: 'joinRoom',
      playerId: 'p2',
      nickname: 'Guest',
      now: 2000,
    }));

    const { next, emit } = applyAction(state, {
      type: 'leaveRoom',
      playerId: 'p1',
    });

    expect(next.hostId).toBe('p2');
    expect(emit.some((e) => e.type === 'host.changed')).toBe(true);
  });
});
