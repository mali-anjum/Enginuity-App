import { persistStore } from 'redux-persist';

import { store } from '@/shared/state/store';

export const persistor = persistStore(store);
