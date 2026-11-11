# Kakrat — how the site is run (operations notes)

Living record of the services, accounts and decisions around kakrat.com that
aren't obvious from the code. **Read this before changing anything to do with
subscribers, comments, notifications, Google, Cloudflare or publishing.**
Update it whenever one of these changes.

Last updated: 11 Nov 2026.

## Accounts

Everything for the site lives under **kakratkosh@gmail.com** (Google account,
Cloudflare account, Search Console, Apps Script, Google Sheet), except:

- GitHub repo: `kakrat-bio/Website` (public). Merging to `main` deploys.
- Buttondown newsletter: account username `kakrat`.

In the Claude browser several Google accounts are signed in; kakratkosh is
usually `/u/2/` (e.g. `script.google.com/u/2/…`, `mail.google.com/mail/u/2/`).
saleskoshkey@gmail.com is a different (KoshKey) account; don't use it for Kakrat.

## Owner's working rules

- "Go ahead" from the owner means: make the change **live** (push, open PR,
  merge), not stop at a preview. Merging still needs his explicit go-ahead in
  the chat.
- Write in his voice; avoid text that "sounds like Claude".
- Don't say on the site that Kakrat is a Gujarati word; readers find that in
  the Kakrat essay itself.

## Hosting and deploys

- Cloudflare Pages project **`kakrat`** (account kakratkosh). Build
  `npm run build`, output `out`, production branch `main`.
- Secrets in Pages → Settings → Variables and secrets (values never in git):
  `GITHUB_TOKEN`, `PUBLISH_SECRET` (publish tool), `COMMENTS_WEBHOOK_TOKEN`
  (comment alerts, see below). D1 binding `COMMENTS_DB` → `kakrat-comments`.
- Cloudflare Web Analytics is on (cookie-free).

## Newsletter sign-ups

- The sign-up box (`src/components/article/NewsletterSignup.tsx` +
  `SignupForm.tsx`) appears on home, about, archive, topic, tag, author and
  article pages, with an optional **First name** field.
- Each sign-up goes to **two places**:
  1. **Buttondown** (form posts to its embed endpoint): sends the
     confirmation email and handles unsubscribes. This is the **official
     list**: only confirmed Buttondown subscribers receive newsletters.
  2. **Google Sheet "Kakrat subscribers"** (kakratkosh Drive, sheet
     "Sign-ups": Date IST, First name, Email, Page). It's a convenience copy,
     and includes people who never confirmed. Sent by `navigator.sendBeacon`
     to the Apps Script web app (`SIGNUP_SHEET_URL` in
     `src/lib/seo/constants.ts`); duplicates are skipped.
- Buttondown is on the **free plan** (up to 100 subscribers). Its new-subscriber
  email notification is on. Subscriber names are only in the Sheet (Buttondown
  metadata is a paid feature).
- **Sending newsletters is manual.** RSS-to-email needs Buttondown Basic
  ($9/mo); the owner hasn't bought it. Instead he gets a reminder email per new
  article (below) and sends it from Buttondown → New email.

## Google Apps Script ("Untitled project", account kakratkosh)

Source copy: `docs/apps-script/Code.gs` (token blanked out). Deployed as a
**web app** (execute as kakratkosh, access "Anyone"); the deployment URL is
`SIGNUP_SHEET_URL` and also `DEFAULT_WEBHOOK_URL` in
`functions/api/comments/index.ts`. To change the code: edit in the Apps Script
editor, save, then Deploy → Manage deployments → edit → **New version** →
Deploy (keeps the same URL). Each new Google permission needs the owner to
click Allow himself.

It does three things:

1. **`doPost` sign-ups** → appends to the Sheet.
2. **`doPost` with `type=comment`** → emails a new-comment alert to
   kakratkosh@gmail.com. Only acts if `token` matches `COMMENT_TOKEN`, which
   must equal the Cloudflare secret `COMMENTS_WEBHOOK_TOKEN`.
3. **`checkNewArticles`** (hourly time trigger, made by `setupReminders`) →
   reads `https://kakrat.com/rss.xml` and emails a "send the newsletter"
   reminder, with a ready-to-paste draft, once per new article.

All alerts go to **kakratkosh@gmail.com**.

## Comments

- Moderated: every comment waits as "pending" at `kakrat.com/admin/comments`
  (admin password, which only the owner has).
- New-comment alert: the comments Pages Function calls the Apps Script when
  `COMMENTS_WEBHOOK_TOKEN` is set (Resend path is a fallback that isn't
  configured).

## Google Search Console

- URL-prefix property `https://kakrat.com/` under kakratkosh (verified via the
  existing DNS record). Sitemap `sitemap.xml` submitted.
- Guest-writing page moved from `/write-for-kakrat` to `/write-for-us`
  (301 in `public/_redirects`). The homepage title is
  "Kakrat: Essays on science, business and culture".
