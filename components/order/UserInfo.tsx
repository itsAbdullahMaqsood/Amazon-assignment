import Image from "next/image";

const AddressBlock = ({ title, address }: any) => (
    <div className="mt-4">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2 mb-2">{title}</h3>

        <div className="text-sm space-y-1">
            <p>{`${address?.firstName || ""} ${address?.lastName || ""}`.trim()}</p>
            <p>{`${address?.city}/${address?.state}/${address?.country}`}</p>
            <p>{address?.address1}</p>
            {address?.address2 && <p>{address.address2}</p>}
            <p>{address?.zipCode}</p>
            <p>{address?.phoneNumber}</p>
        </div>
    </div>
);

const UserInfo = ({ user, address }: any) => {
    return (
        <div>
            <h2 className="text-2xl font-bold border-b border-slate-200 pb-3 mb-3">
                Customer&apos;s Order
            </h2>

            <div className="flex items-center gap-3">
                <Image
                    src={user?.image || "/assets/images/user-image-default.jpg"}
                    alt=""
                    width={65}
                    height={65}
                    className="rounded-full object-cover"
                />

                <div>
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
            </div>

            <AddressBlock title="Shipping Address" address={address} />
            <AddressBlock title="Billing Address" address={address} />
        </div>
    );
};

export default UserInfo;
