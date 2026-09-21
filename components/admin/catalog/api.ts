import axios from "axios";

// Every admin mutation goes through here: the server's message is what the
// admin sees, whether the call worked or not.
export const adminRequest = async (method: "post" | "put" | "delete", url: string, body: any) => {
    try {
        const { data } = await axios.request({ method, url, data: body });
        return { data };
    } catch (err: any) {
        return { error: err.response?.data?.message || err.message || "Something went wrong." };
    }
};

// Dates are formatted in UTC so the server render and the browser agree.
const dateFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});

export const formatDate = (value: any) => (value ? dateFormat.format(new Date(value)) : "—");
