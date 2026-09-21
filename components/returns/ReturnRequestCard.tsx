import Link from "next/link";
import Image from "next/image";

import { formatDate, orderNumber, statusBadge, statusHint } from "@/lib/returns";

const ReturnRequestCard = ({ request }: any) => {
    return (
        <article className="border border-slate-300 rounded-lg bg-white p-4 flex flex-col md:flex-row gap-4">
            <Image
                src={request.image}
                alt={request.name}
                width={96}
                height={96}
                className="rounded object-contain w-24 h-24 bg-white shrink-0"
            />

            <div className="grow min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                    <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusBadge(
                            request.status
                        )}`}
                    >
                        {request.status}
                    </span>
                    <span className="text-xs text-slate-600">
                        Requested {formatDate(request.requestedAt)}
                    </span>
                </div>

                <p className="text-sm mt-2 line-clamp-2">{request.name}</p>

                <p className="text-xs text-slate-600 mt-1">
                    Qty: {request.qty} · {request.reason} · Refund to {request.refundTo}
                </p>

                {request.comments && (
                    <p className="text-xs text-slate-600 mt-1 italic">&quot;{request.comments}&quot;</p>
                )}

                <p className="text-xs text-slate-700 mt-2">{statusHint(request.status)}</p>
            </div>

            <div className="md:w-[220px] shrink-0 md:text-right text-xs">
                <p className="uppercase text-slate-600">Order # {orderNumber(request.orderId)}</p>
                <Link
                    href={`/order/${request.orderId}`}
                    className="text-[#0F5FA6] hover:text-[#C7511F] hover:underline"
                >
                    View order details
                </Link>
            </div>
        </article>
    );
};

export default ReturnRequestCard;
