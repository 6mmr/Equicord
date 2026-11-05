import definePlugin from "@utils/types";
import { findByPropsLazy, findStoreLazy } from "@webpack";
import {
    UserStore,
    PermissionStore,
    PermissionsBits,
    ChannelStore,
    RestAPI,
    Constants
} from "@webpack/common";
import { Devs } from "@utils/constants";

// Stores / Actions
const VoiceStateStore = findStoreLazy("VoiceStateStore");
const VoiceActions = findByPropsLazy("toggleSelfMute");

interface VoiceState {
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    guildId?: string;
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
    selfStream: boolean;
    selfVideo: boolean;
    sessionId: string;
    suppress: boolean;
    requestToSpeakTimestamp: string | null;
}

// فك السيرفر ميوت عن طريق API
async function unmuteUserViaAPI(
    userId: string,
    guildId: string
): Promise<void> {
    try {
        console.log(
            `[AutoUnmute] محاولة فك السيرفر ميوت عن ${userId} في السيرفر ${guildId}`
        );

        await RestAPI.patch({
            url: Constants.Endpoints.GUILD_MEMBER(guildId, userId),
            body: { mute: false }
        });

        console.log(
            `[AutoUnmute] تم فك السيرفر ميوت عن ${userId} عبر API بنجاح`
        );
    } catch (error) {
        console.error("[AutoUnmute] خطأ أثناء فك السيرفر ميوت عبر API:", error);
        throw error;
    }
}

// فك السيرفر ديفن عن طريق API
async function undeafenUserViaAPI(
    userId: string,
    guildId: string
): Promise<void> {
    try {
        console.log(
            `[AutoUnmute] محاولة فك السيرفر ديفن عن ${userId} في السيرفر ${guildId}`
        );

        await RestAPI.patch({
            url: Constants.Endpoints.GUILD_MEMBER(guildId, userId),
            body: { deaf: false }
        });

        console.log(
            `[AutoUnmute] تم فك السيرفر ديفن عن ${userId} عبر API بنجاح`
        );
    } catch (error) {
        console.error(
            "[AutoUnmute] خطأ أثناء فك السيرفر ديفن عبر API:",
            error
        );
        throw error;
    }
}

export default definePlugin({
    name: "AutoUnmute",
    description:
        "يفك عنك السيرفر ميوت / ديفن تلقائيًا إذا تم تفعيلهم عليك وكان عندك الصلاحيات (بدون تنبيهات).",
    authors: [
        Devs.r
    ],

    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[] }) {
            const currentUser = UserStore.getCurrentUser();
            if (!currentUser) {
                console.warn("[AutoUnmute] ما قدر يجيب المستخدم الحالي");
                return;
            }

            const currentUserId = currentUser.id;

            for (const state of voiceStates) {
                const {
                    userId,
                    channelId,
                    guildId,
                    mute,
                    selfMute,
                    deaf,
                    selfDeaf
                } = state;

                // نهتم فقط بحالات المستخدم الحالي
                if (userId !== currentUserId) continue;

                // لازم يكون في روم وفي سيرفر
                if (!channelId || !guildId) continue;

                const channel = ChannelStore.getChannel(channelId);
                if (!channel) {
                    console.warn("[AutoUnmute] ما قدر يجيب الروم");
                    continue;
                }

                // ===================== سيرفر ميوت =====================
                if (mute && !selfMute) {
                    console.log(
                        `[AutoUnmute] تم اكتشاف سيرفر ميوت على ${currentUserId} في روم ${channelId}`
                    );

                    const hasMutePermission = PermissionStore.can(
                        PermissionsBits.MUTE_MEMBERS,
                        channel
                    );

                    if (hasMutePermission) {
                        console.log(
                            "[AutoUnmute] عندك صلاحية MUTE_MEMBERS، جاري محاولة فك الميوت تلقائيًا..."
                        );

                        setTimeout(async () => {
                            try {
                                await unmuteUserViaAPI(currentUserId, guildId);
                                console.log(
                                    "[AutoUnmute] تم فك السيرفر ميوت تلقائيًا عبر API"
                                );
                            } catch (error) {
                                console.error(
                                    "[AutoUnmute] خطأ أثناء فك السيرفر ميوت عبر API:",
                                    error
                                );

                                // محاولة احتياطية: toggleSelfMute
                                try {
                                    console.log(
                                        "[AutoUnmute] محاولة الاحتياط: toggleSelfMute..."
                                    );
                                    VoiceActions.toggleSelfMute();
                                    console.log(
                                        "[AutoUnmute] تم فك الميوت بالاحتياط بنجاح"
                                    );
                                } catch (fallbackError) {
                                    console.error(
                                        "[AutoUnmute] خطأ أثناء محاولة الاحتياط:",
                                        fallbackError
                                    );
                                }
                            }
                        }, 100);
                    } else {
                        console.log(
                            "[AutoUnmute] ما عندك صلاحية MUTE_MEMBERS، ما راح يفك الميوت تلقائيًا"
                        );
                    }
                }

                // ===================== سيرفر ديفن =====================
                if (deaf && !selfDeaf) {
                    console.log(
                        `[AutoUnmute] تم اكتشاف سيرفر ديفن على ${currentUserId} في روم ${channelId}`
                    );

                    const hasDeafenPermission = PermissionStore.can(
                        PermissionsBits.DEAFEN_MEMBERS,
                        channel
                    );

                    if (hasDeafenPermission) {
                        console.log(
                            "[AutoUnmute] عندك صلاحية DEAFEN_MEMBERS، جاري محاولة فك الديفن تلقائيًا..."
                        );

                        setTimeout(async () => {
                            try {
                                await undeafenUserViaAPI(currentUserId, guildId);
                                console.log(
                                    "[AutoUnmute] تم فك السيرفر ديفن تلقائيًا عبر API"
                                );
                            } catch (error) {
                                console.error(
                                    "[AutoUnmute] خطأ أثناء فك السيرفر ديفن عبر API:",
                                    error
                                );

                                // محاولة احتياطية: toggleSelfDeaf
                                try {
                                    console.log(
                                        "[AutoUnmute] محاولة الاحتياط: toggleSelfDeaf..."
                                    );
                                    VoiceActions.toggleSelfDeaf();
                                    console.log(
                                        "[AutoUnmute] تم فك الديفن بالاحتياط بنجاح"
                                    );
                                } catch (fallbackError) {
                                    console.error(
                                        "[AutoUnmute] خطأ أثناء محاولة الاحتياط:",
                                        fallbackError
                                    );
                                }
                            }
                        }, 100);
                    } else {
                        console.log(
                            "[AutoUnmute] ما عندك صلاحية DEAFEN_MEMBERS، ما راح يفك الديفن تلقائيًا"
                        );
                    }
                }
            }
        }
    },

    start() {
        console.log("[AutoUnmute] البلجن اشتغل");

        if (!VoiceStateStore || !VoiceActions || !UserStore || !PermissionStore) {
            console.error(
                "[AutoUnmute] خطأ: بعض ستورات ديسكورد أو الأكشنز غير متوفرة"
            );
            return;
        }
    },

    stop() {
        console.log("[AutoUnmute] البلجن توقف");
    }
});
