import { persistStore } from 'redux-persist';

import { store } from '@/sharedModules/state/store';

export const persistor = persistStore(store);
