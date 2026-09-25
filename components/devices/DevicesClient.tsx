"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    BookOpenIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    SpeakerWaveIcon,
    TvIcon,
} from "@heroicons/react/24/outline";

import { formatDate } from "@/lib/localStore";
import { deregisterDevice, deviceStore, registerDevice } from "@/lib/devices";

const icons: any = {
    BookOpenIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    SpeakerWaveIcon,
    TvIcon,
};

const tabs = [
    { id: "devices", label: "Devices" },
    { id: "content", label: "Content Library" },
];

const DevicesClient = ({ devices, titles }: any) => {
    const deregistered: any = useSyncExternalStore(
        deviceStore.subscribe,
        deviceStore.getSnapshot,
        deviceStore.getServerSnapshot
    );

    const [tab, setTab] = useState<string>("devices");

    const gone = Array.isArray(deregistered) ? deregistered : [];
    const registered = devices.filter((device: any) => !gone.includes(device.id));

    return (
        <div>
            <div role="tablist" aria-label="Devices and content" className="flex border-b border-slate-300">
                {tabs.map((entry) => (
                    <button
                        key={entry.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === entry.id}
                        onClick={() => setTab(entry.id)}
                        className={`px-5 py-3 text-sm font-semibold cursor-pointer border-b-4 ${
                            tab === entry.id
                                ? "border-b-accent-deep text-accent-deep"
                                : "border-b-transparent hover:text-accent-deep"
                        }`}
                    >
                        {entry.label}
                    </button>
                ))}
            </div>

            {tab === "devices" ? (
                <div className="mt-6">
                    {registered.length === 0 ? (
                        <div className="border border-slate-300 rounded-lg bg-white p-8 text-center">
                            <p className="font-semibold">No devices are registered to this account.</p>
                            <p className="mt-2 text-sm text-slate-600">
                                Deregistering here only hides a device in this browser; the list is
                                simulated.
                            </p>
                            <button
                                type="button"
                                onClick={() => gone.forEach((id: string) => registerDevice(id))}
                                className="mt-5 px-6 py-2 rounded-full bg-accent text-ink-900 cursor-pointer"
                            >
                                Restore the device list
                            </button>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {registered.map((device: any) => {
                                const Icon = icons[device.icon] || ComputerDesktopIcon;

                                return (
                                    <li
                                        key={device.id}
                                        className="border border-slate-300 rounded-lg bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                                    >
                                        <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-accent-soft text-accent-ink">
                                            <Icon className="w-7 h-7" />
                                        </span>

                                        <div className="grow">
                                            <p className="font-bold">
                                                {device.name}
                                                {device.isCurrent && (
                                                    <span className="ml-2 text-xs font-semibold px-2 py-1 rounded bg-success-soft text-success">
                                                        This device
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-600">{device.type}</p>
                                            <p className="text-sm text-slate-600 mt-1">{device.detail}</p>
                                            <p className="text-sm text-slate-600 mt-1">
                                                Registered {formatDate(device.registeredOn)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => deregisterDevice(device.id)}
                                            className="self-start sm:self-center px-5 py-2 rounded-full text-sm font-semibold border border-slate-400 cursor-pointer"
                                        >
                                            Deregister
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {registered.length > 0 && gone.length > 0 && (
                        <div className="mt-6 text-sm text-slate-600">
                            {gone.length} device{gone.length === 1 ? "" : "s"} deregistered in this
                            browser.{" "}
                            <button
                                type="button"
                                onClick={() => gone.forEach((id: string) => registerDevice(id))}
                                className="text-accent-ink hover:text-accent-deep hover:underline cursor-pointer"
                            >
                                Register them again
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-6">
                    {titles.length === 0 ? (
                        <div className="border border-slate-300 rounded-lg bg-white p-8 text-center">
                            <p className="font-semibold">Your content library is empty.</p>
                            <p className="mt-2 text-sm text-slate-600">
                                Digital titles come from the Markaz Movies catalogue, which has nothing
                                in it yet.
                            </p>
                            <Link
                                href="/movies"
                                className="inline-block mt-5 px-6 py-2 rounded-full bg-accent text-ink-900"
                            >
                                Open Markaz Movies
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600">
                                Digital purchases on your account, playable on any registered device.
                            </p>

                            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                                {titles.map((title: any) => (
                                    <li
                                        key={title._id}
                                        className="border border-slate-300 rounded-lg bg-white overflow-hidden"
                                    >
                                        <div className="relative w-full h-[230px] bg-slate-100">
                                            {title.posterPath && (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w500${title.posterPath}`}
                                                    alt={title.title}
                                                    fill
                                                    sizes="200px"
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="p-3">
                                            <p className="font-medium text-sm line-clamp-2">
                                                {title.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">
                                                {(title.releaseDate || "").slice(0, 4)} ·{" "}
                                                {title.mediaType === "tv" ? "TV show" : "Movie"}
                                            </p>
                                            <Link
                                                href="/movies"
                                                className="inline-block mt-2 text-sm text-accent-ink hover:text-accent-deep hover:underline"
                                            >
                                                Watch now
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default DevicesClient;
