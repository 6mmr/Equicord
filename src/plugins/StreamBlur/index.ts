/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { ApplicationStreamingStore, ChannelStore } from "@webpack/common";
import { Devs } from "@utils/constants";
import managedStyle from "./style.css?managed";

const BLUR_CLASS = "vc-stream-blur";

// children of the chat have pointer-events: none while blurred, so any click lands on main itself
function unblur(e: MouseEvent) {
    if (!document.body.classList.contains(BLUR_CLASS)) return;
    if (!(e.target as HTMLElement).closest?.('main[class*="chatContent"]')) return;

    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove(BLUR_CLASS);
}

export default definePlugin({
    name: "StreamBlur",
    description: "Blurs DMs you open while streaming, click to reveal them.",
    authors: [Devs.r],
    managedStyle,

    flux: {
        CHANNEL_SELECT({ channelId }: { channelId: string | null; }) {
            const streaming = !!ApplicationStreamingStore.getCurrentUserActiveStream();
            const isDM = !!channelId && !!ChannelStore.getChannel(channelId)?.isPrivate();
            document.body.classList.toggle(BLUR_CLASS, streaming && isDM);
        }
    },

    start() {
        document.addEventListener("click", unblur, true);
    },

    stop() {
        document.removeEventListener("click", unblur, true);
        document.body.classList.remove(BLUR_CLASS);
    }
});
