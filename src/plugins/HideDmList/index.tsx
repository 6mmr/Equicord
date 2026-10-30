/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import definePlugin, { IconComponent } from "@utils/types";
import { useState } from "@webpack/common";
import { Devs } from "@utils/constants";
// cycle: default -> hide channels/DMs -> also hide server list -> default
const STATES = [[], ["vc-hide-sidebar"], ["vc-hide-sidebar", "vc-hide-guilds"]];
const TOOLTIPS = ["Hide channel list", "Hide server list too", "Show everything"];
let state = 0;

const Icon: IconComponent = ({ height = 20, width = 20, className }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" className={className}>
        <path fill="currentColor" d="M3 3h6v18H3zm8 0h10v18H11zm2 2v14h6V5z" />
    </svg>
);

function setState(next: number) {
    document.body.classList.remove(...STATES[state]);
    document.body.classList.add(...STATES[next]);
    state = next;
}

const HideDmsButton: ChatBarButtonFactory = ({ isMainChat }) => {
    const [current, setCurrent] = useState(state);
    if (!isMainChat) return null;

    return (
        <ChatBarButton
            tooltip={TOOLTIPS[current]}
            onClick={() => {
                setState((state + 1) % STATES.length);
                setCurrent(state);
            }}
        >
            <Icon />
        </ChatBarButton>
    );
};

export default definePlugin({
    name: "HideDmList",
    description: "Adds a chat bar button that cycles hiding the channel/DM list and the server list",
    authors: [Devs.r],

    chatBarButton: { icon: Icon, render: HideDmsButton },

    stop() {
        setState(0);
    }
});
