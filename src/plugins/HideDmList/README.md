# HideDmList

A [Vencord](https://github.com/Vendicated/Vencord) user plugin that adds a button to the chat bar for hiding Discord's side panels. Each click moves to the next state:

1. Hide the channel list (or the DM list when you're in DMs)
2. Also hide the server list
3. Show everything again

## Install

User plugins need a [custom Vencord build](https://docs.vencord.dev/installing/custom-plugins/).

```sh
cd Vencord
git clone https://github.com/Va1bhav512/HideDmList src/userplugins/hideDmList
pnpm build
pnpm inject   # only needed once
```

Restart Discord, then enable **HideDmList** under Settings → Vencord → Plugins.

## Note

The plugin hides elements by matching Discord's internal class names (`sidebarList_`, `privateChannels_`, `guilds_`). If a Discord update breaks it, update the selectors in `style.css`.
