"use client";

import Button from "@/components/ui/Button";
import { Notice } from "@/components/ui/Layout";
import { useAppDispatch } from "@/redux/hooks";
import { openAssistant } from "@/redux/slices/AssistantSlice";

// No chat, no call-back, no ticket. Rather than three buttons that each open a
// dialog admitting they do nothing, the page says it once and offers the thing
// that does work.
const ContactPanel = () => {
    const dispatch = useAppDispatch();

    return (
        <Notice tone="neutral" title="There is nobody to call">
            <p>
                Markaz is a coursework project with no support desk behind it, so there is no chat queue, no phone
                line and no ticket to raise. The pages above describe exactly what this build does, and Shabana can
                answer questions about the catalogue.
            </p>
            <Button size="sm" className="mt-3" onClick={() => dispatch(openAssistant({}))}>
                Ask Shabana
            </Button>
        </Notice>
    );
};

export default ContactPanel;
