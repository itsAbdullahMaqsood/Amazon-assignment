import { ChevronRightIcon } from "@heroicons/react/24/outline";

const ButtonInput = ({ text }: any) => {
    return (
        <button
            type="submit"
            className="button-orange w-full py-[0.5rem] text-sm text-gray-900 flex items-center justify-center cursor-pointer"
        >
            {text}
            <ChevronRightIcon className="h-3 ml-1" />
        </button>
    );
};

export default ButtonInput;
