/**
 * Discord Server Configuration
 *
 * Replace YOUR_INVITE_CODE with your actual Discord server invite code
 * You can get this from Discord: Server Settings → Invites → Create Invite
 * Or use a permanent invite link like: https://discord.gg/your-invite-code
 */

export const DISCORD_SERVER_INVITE_URL =
  import.meta.env.VITE_DISCORD_INVITE_URL ||
  'https://discord.gg/YOUR_INVITE_CODE';

console.log(DISCORD_SERVER_INVITE_URL);
