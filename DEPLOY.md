# Fellowship Hub — deploying to a Hostinger VPS

This is the Replit "Fellowship Hub" app, converted to run on any standard Linux server:

- Database: standard PostgreSQL (`pg` driver) instead of Replit/Neon.
- File uploads: stored on the server's disk (`/var/lib/fellowship-hub/uploads`) instead of Replit Object Storage, still served at `/public-objects/...`, so existing links keep working.
- Replit-only build plugins were removed.
- Password hashes are no longer sent to the browser in user API responses.
- `deploy/content/` holds the exported teachings, courses, lessons, projects and site settings. `deploy/media/public-objects/` holds the 4 uploaded files.

User accounts, messages and prayer requests weren't in the Replit export, so everyone (including you) needs to register again. The installer creates your admin account.

## First install

1. In hPanel → VPS, use Ubuntu 22.04/24.04 or AlmaLinux 9 (the installer handles both) and note the server **IP** and **hostname** (looks like `srv123456.hstgr.cloud`).
2. From your computer (Windows PowerShell, Mac or Linux terminal):

   ```
   scp fellowship-hub-deploy.tar.gz root@YOUR_VPS_IP:/root/
   ssh root@YOUR_VPS_IP
   ```

3. On the VPS:

   ```
   cd /root && tar -xzf fellowship-hub-deploy.tar.gz && cd fellowship-hub
   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='pick-a-strong-one' bash deploy/install.sh
   ```

   It takes about 3–5 minutes. It installs Node.js 22, PostgreSQL, nginx and a free HTTPS certificate, then prints the live URL (`https://srv123456.hstgr.cloud`).

## Moving to a real domain later

Point the domain's A record at the VPS IP, wait for DNS to update, then re-run the installer with `DOMAIN=yourdomain.com` (same command as above, plus `DOMAIN=...`). Your content, users and uploads are kept.

## Updating the code

Upload the new bundle, unpack it, and re-run `bash deploy/install.sh`. Content is only imported on the first install.

## Useful commands on the VPS

| What | Command |
|---|---|
| App logs | `journalctl -u fellowship-hub -f` |
| Restart app | `systemctl restart fellowship-hub` |
| Settings / secrets | `/etc/fellowship-hub.env` |
| Reset an admin password | `cd /opt/fellowship-hub && set -a && . /etc/fellowship-hub.env && sudo -u fellowship -E npx tsx script/create-admin.ts EMAIL NEWPASSWORD` |
| Database backup | `sudo -u postgres pg_dump fellowship > backup.sql` |

## Voice channels

Voice channels carry live audio. Each browser sends audio directly to the others (WebRTC), and the site's WebSocket only introduces them to each other. The installer also sets up a TURN relay (coturn on port 3478, UDP relay ports 49160–49200) so people behind strict networks can still connect.

- Each room works well for up to ~8–10 people speaking at once; default rooms are capped at 10.
- Mute and moderator-mute silence the microphone itself. Moderators are the channel's creator/moderator and site admins.
- The browser must allow microphone access. If it's blocked, the user can still listen.
- Manage rooms in the admin page; "Fellowship Lounge" and "Prayer Room" are created automatically.
- If voice fails for some users, check that ports 3478 (UDP/TCP) and 49160–49200 (UDP) are open in hPanel → VPS → Firewall, and `systemctl status coturn`.
