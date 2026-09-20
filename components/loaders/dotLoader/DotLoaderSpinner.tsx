"use client";

import { DotLoader } from "react-spinners";

const DotLoaderSpinner = ({ loading }: any) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white/50 z-20 flex items-center justify-center">
            <DotLoader color="#febd69" loading={loading} size={60} />
        </div>
    );
};

export default DotLoaderSpinner;
