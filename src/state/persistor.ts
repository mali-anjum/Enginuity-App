import { persistStore } from 'redux-persist';

import { store } from '@/state/store';

export const persistor = persistStore(store);

