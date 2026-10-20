SITE SOURCE AND MEDIA EXPORT

Included:
- source/: Application source code, package lockfile, configuration and local images/files.
- content/: Current teaching, course, lesson, project and site settings database records (JSON).
- media/: Downloaded uploaded files and external images, documents, audio, video and fonts where accessible.
- media-manifest.json: Mapping of original URLs to the files in this archive.
- EXTERNAL-LINKS.txt: Videos and other resources that remain hosted on external services.
- UNAVAILABLE-FILES.txt: Any files that could not be retrieved.

This is a source-and-content backup, not a standalone offline HTML site.
YouTube/Vimeo videos are links, not downloaded video files.
User accounts, password hashes, session data, private messages, prayer requests,
user progress, certificates, environment secrets, Git history, caches and node_modules are excluded.
Only referenced private media is included; unreferenced private user files are excluded.

To run the application:
1. Install Node.js and run npm ci inside source/.
2. Configure your own PostgreSQL connection (DATABASE_URL), SESSION_SECRET and App Storage.
3. Run npm run db:push to create the schema in a new database.
4. Import content/*.json into the matching tables with a PostgreSQL-compatible import tool.
   Import courses before lessons to preserve foreign keys. Preserve original IDs.
5. Upload media/public-objects/ files to your public storage prefix preserving filenames.
   Restore any media/objects/ files to private storage with appropriate access rules.
   For external downloads, consult media-manifest.json if changing URLs to local assets.
6. Run npm run dev.

The app's startup seed code may modify content. Review source/server/seed.ts
before restoring a backup in a new environment. External links still need internet access.
This export is from the current workspace's configured application database;
no separate production database was queried.

Export notes: Content database exported successfully.
