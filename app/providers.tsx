"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "@/redux/store";
import DialogModal from "@/components/shared/DialogModal";

const Providers = ({ children, session }: any) => {
    return (
        <SessionProvider session={session}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <DialogModal />
                    {children}
                </PersistGate>
            </Provider>
        </SessionProvider>
    );
};

export default Providers;
