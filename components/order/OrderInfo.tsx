import { CheckBadgeIcon, ChevronRightIcon, XCircleIcon } from "@heroicons/react/24/outline";

const OrderInfo = ({ order }: any) => {
    return (
        <div className="border-b border-slate-200 pb-4 mb-2">
            <div className="flex items-center flex-wrap text-sm text-slate-600">
                <span>Home</span>
                <ChevronRightIcon className="h-3 mx-1" />
                <span>Orders</span>
                <ChevronRightIcon className="h-3 mx-1" />
                <span>{order._id}</span>
            </div>

            <div className="flex items-center gap-2 mt-3">
                <span className="font-semibold">Payment Status:</span>
                {order.isPaid ? (
                    <CheckBadgeIcon className="w-8 h-8 fill-green-500" />
                ) : (
                    <XCircleIcon className="w-8 h-8 text-red-500" />
                )}
            </div>

            <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold">Order Status:</span>
                <span className={order.status === "Completed" ? "text-green-600" : "text-red-600"}>
                    {order.status}
                </span>
            </div>
        </div>
    );
};

export default OrderInfo;
