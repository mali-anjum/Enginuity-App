import hardwareReducer, {
  addHardwareThunk,
  fetchHardwareThunk,
  selectAllHardware,
  type HardwareItem,
} from '@/hardware/state/hardwareSlice';

import type { RootState } from '@/sharedModules/state/store';

describe('hardwareSlice — library list', () => {
  it('merge fetchHardwareThunk.fulfilled sets hardware from server', () => {
    let state = hardwareReducer(undefined, { type: '@@INIT' });
    const items: HardwareItem[] = [
      {
        id: 'h1',
        name: 'ESP32',
        category: 'MCU',
        specs: '',
        datasheetUrl: '',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];
    state = hardwareReducer(state, fetchHardwareThunk.fulfilled(items, 'r1', undefined));
    const root = { hardware: state } as unknown as RootState;
    expect(selectAllHardware(root)).toEqual(items);
  });

  it('addHardwareThunk.fulfilled prepends local hardware when offline-style id is used', () => {
    let state = hardwareReducer(undefined, { type: '@@INIT' });
    const item: HardwareItem = {
      id: 'hw-123',
      name: 'Arduino Nano',
      category: 'MCU',
      specs: '5V',
      datasheetUrl: '',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    state = hardwareReducer(
      state,
      addHardwareThunk.fulfilled(item, 'r2', { name: item.name, category: item.category }),
    );
    expect(state.hardware[0].name).toBe('Arduino Nano');
  });
});
