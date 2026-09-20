import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Inter } from "next/font/google";

import { store, persistor } from "@/redux/store";

const inter = Inter({ subsets: ["latin"] });

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps | any) => {
    return (
        <SessionProvider session={session}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <div className={inter.className}>
                        <Component {...pageProps} />
                    </div>
                </PersistGate>
            </Provider>
        </SessionProvider>
    );
};

export default App;
