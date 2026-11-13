# Kakrat: batch publishing runbook

How articles and their social posts are prepared in a batch, approved once by
the owner, and then published one at a time on set dates by an agent. Written
so that a small model or a new human helper can follow it step by step.

If a step here is unclear or fails, **stop and tell the owner**. Do not
improvise.

Last updated: 13 Nov 2026.

## 1. The idea in five lines

1. Each article waits as its own pull request (PR). The PR holds the article,
   its cover, its social images and its captions.
2. The PR title carries the publish date: `Publish 2026-11-27: Title`.
3. The owner reads the preview and approves. Approval is the label
   `approved` on the PR.
4. On the date, an agent merges the PR. Merging to `main` publishes the
   article (Cloudflare Pages deploys it in a few minutes).
5. After the article is live, the same agent schedules the social posts for
   that evening in Metricool. The owner sends the newsletter.

The queue is simply the list of open PRs whose titles start with `Publish`.
There is no other list to keep in step.

## 2. What you need

| Need | Detail |
| --- | --- |
| GitHub | Repo `kakrat-bio/Website`, with push access. In a Claude session, add the repo with push access first. |
| Metricool connector | Brand label `kakratian`, blog id `7648804`, timezone `Asia/Kolkata`. Call `getBrandSettings` to confirm before posting. |
| Networks in Metricool | Instagram only. Metricool's free plan does not include X or LinkedIn. Never try to post to a network that `getBrandSettings` does not list. |
| Buffer (X and LinkedIn) | The owner uses Buffer for X and LinkedIn and will add a Buffer connector later. Do not route this through Zapier. Until a Buffer connector is listed among your tools, X and LinkedIn posts are prepared in the captions file and the owner schedules them in Buffer himself. |
| Node | `npm ci`, `npm run test`, `npm run build`, `npm run optimize-images`. |
| Rules | `CLAUDE.md` (technical), `content/articles/README.md` (article format), `docs/OPERATIONS.md`, and the Kakrat playbook (brand, voice, checklist, who may do what). |

Not available to agents: the newsletter (Buttondown has no connector; the
owner sends it), comment approval, and any password.

## 3. Batch day: preparing one article (repeat per article)

Done by the preparing agent or helper, with the owner's drafts.

1. **Date.** The owner gives the publish date. If he gives none, use 14 days
   after the previous piece. One article per date.
2. **Branch.** From the latest `main`: `article/<slug>`. The slug is
   permanent once published, so choose it with care.
3. **Article file.** `content/articles/<year>/<slug>.mdx`, following
   `content/articles/README.md`. Set `draft: false` (drafts do not show in the
   preview) and `publishedAt` to the planned date.
4. **Cover.** Source image in `content/images-src/<year>/<slug>/`, add a
   `SOURCE.md` saying where it came from, run `npm run optimize-images`,
   commit the source and the generated files.
5. **Checklist.** Run the nine-point "Before a piece goes up" checklist in
   the playbook. Open every reference link and check it says what the piece
   says.
6. **Social images.** 1080×1350 JPG, in
   `public/social/<yyyy-mm>-<short-name>/`, named `01.jpg`, `02.jpg`, … in
   posting order. Same template as the earlier carousels in `public/social/`.
7. **Captions file.** `docs/social/<yyyy-mm>-<short-name>.md`, in exactly the
   format in section 7. Write captions in the owner's voice.
8. **Check.** `npm ci && npm run test && npm run build`. Both must pass.
9. **PR.** Push, open a PR into `main`.
   - Title: `Publish YYYY-MM-DD: <article title>`
   - Body: the template in section 8.
10. **Preview.** Cloudflare adds a preview link to the PR within a few
    minutes. Send the owner that link and the PR link.

## 4. Approval

- The owner reads the preview article and looks at the images and captions in
  the PR (the GitHub phone app shows both).
- He approves by adding the label `approved`, or by saying "Go ahead" for
  that PR in a chat, in which case the agent in that chat adds the label and
  writes a PR comment: `Approved by the owner in chat on <date>.`
- Any change to the article, images or captions after approval removes the
  approval. Take the label off and ask again. Fixing a typo does not.
- No label, no publishing. An agent never adds the label on its own
  judgement.

## 5. Publish day (the daily check)

Run once each morning, India time. A small model can do this.

1. List open PRs whose title starts with `Publish `. Read the date in each
   title. Keep those whose date is today or earlier.
2. None? Stop. Say nothing.
3. More than one? Take the earliest date only. The rest wait for tomorrow.
   Mention them in the report.
4. No `approved` label? Do not publish. Tell the owner
   "`<title>` was due today and is not approved." Stop.
5. Check out the PR branch. Merge the latest `main` into it.
   - If `public/images/generated/manifest.json` conflicts: accept either
     side, run `npm run optimize-images` (it rebuilds the manifest from all
     source images), and commit.
   - Any other conflict: stop and tell the owner.
6. In the article file set `publishedAt` to today's date. Change nothing
   else.
7. `npm ci && npm run test && npm run build`. If either fails, stop and tell
   the owner. Push.
8. Wait for the PR's checks (the Cloudflare preview build) to pass.
9. Merge the PR (squash). This is the moment of publishing.
10. Wait five minutes. Open `https://kakrat.com/articles/<slug>`. It must
    load and show the title. If it does not after fifteen minutes, tell the
    owner and stop. Do not schedule social posts for an article that is not
    live.
11. Open each image at `https://kakrat.com/social/<folder>/<file>`. Each
    must load.
12. Schedule the social posts (section 6).
13. Comment on the merged PR: the time published, the live link, and the
    Metricool `plannerUrl` of each scheduled post.
14. Tell the owner in one line: "Published `<title>`. Social scheduled for
    `<time>`. Newsletter is yours to send." His reminder email with a
    ready-to-paste draft arrives within the hour.

## 6. Scheduling the social posts in Metricool

1. Call `getBrandSettings`. Use the brand labelled `kakratian`. Note which
   networks are connected.
2. Read the captions file for the article.
3. For each network in the file **that is connected**, call
   `createScheduledPost` with:
   - `blogId`: the brand id.
   - `date` and `publicationDate`: today, at the time in the captions file,
     timezone `Asia/Kolkata`. If the time has passed, use the same time
     tomorrow.
   - `media`: the image URLs on `https://kakrat.com/social/...`, in order.
   - `text`: the caption for that network, exactly as written.
   - `autoPublish`: true. `draft`: false.
   - Instagram: type `POST` (several images make a carousel).
   - X (`twitter`): one post, never split into a thread.
   - LinkedIn: type `post`.
4. X and LinkedIn go through Buffer, not Metricool. If a Buffer connector is
   among your tools, schedule them there with the text and times from the
   captions file. If it is not, skip them and say in the report that the
   owner needs to schedule X and LinkedIn in Buffer. Do not use Zapier for
   this.
5. If Metricool returns an error, do not edit the text to make it fit. Report
   the error to the owner.

Never post anything that is not in an approved captions file. That includes
replies, comments and "One Caw" cards, which have their own approval.

## 7. Captions file format

`docs/social/<yyyy-mm>-<short-name>.md`:

```
# Social: <article title>

article: https://kakrat.com/articles/<slug>
images: public/social/<yyyy-mm>-<short-name>/ (01.jpg to 0N.jpg)

## Instagram
time: 19:30
caption:
<text, with the link line "Read it at kakrat.com (link in bio)">

## X
time: 20:00
text:
<text ending with the article link>

## LinkedIn
time: 09:30 next day
text:
<text ending with the article link>

## Alt text
01: <what slide 1 shows>
02: <...>

## Share card
file: card.jpg
line: <the one line on the card>
```

## 8. PR body template

```
Publish date: YYYY-MM-DD
Article: content/articles/<year>/<slug>.mdx
Social images: public/social/<folder>/
Captions: docs/social/<folder>.md

Checklist (playbook section 4)
- [ ] One-sentence view stated
- [ ] Three smiles, first within 150 words
- [ ] Every reference opened and checked
- [ ] Invented facts labelled in the same sentence
- [ ] Length, title, description within limits
- [ ] Cover with alt text and SOURCE.md
- [ ] Read aloud once
- [ ] Tests and build pass

Owner: read the preview link below, then add the label `approved`.
```

## 9. When the owner is away

The away rule in the playbook applies. In short: an approved PR is published
on its date; nothing unapproved is. Because the newsletter is sent by hand,
subscribers hear about pieces published while he is away only when he is
back, unless RSS-to-email is switched on in Buttondown (a paid feature; see
`docs/OPERATIONS.md`).

## 10. When things go wrong

| Problem | Do |
| --- | --- |
| Build or tests fail | Do not merge. Report the error text. |
| Article live but wrong | Do not delete it. Tell the owner. A factual fix needs a dated correction (see the article README). |
| Social post went out with an error | Tell the owner. Do not delete or repost without his word. |
| Date passed while unapproved | Leave it. When approved later, it publishes the next morning with that day's date. |
| Two agents running at once | Check the PR for a "Published" comment before step 9. If it is there, stop. |
