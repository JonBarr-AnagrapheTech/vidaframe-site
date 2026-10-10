# Anagraphe Tech

Coming-soon site for [VidaFrame](https://anagraphetech.com/), an iPad app from Anagraphe Tech LLC. The page is a static preview. It is not deployed, and this repo does not configure hosting or DNS.

VidaFrame turns an iPad into a full-screen photo frame for iCloud Photos. Favorites, albums, and iCloud Shared Albums play on the device. Swipe up from the frame for Apple Home. Photos stay on the iPad.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:4327](http://127.0.0.1:4327).

To build the static files and preview that build:

```bash
npm run build
npm run preview
```

`npm run build` writes a static site to `dist/`. `npm run check` runs the waitlist validation checks.

## Waitlist

Both email forms post to Buttondown. The username lives in one place:

```js
// site.config.js
export const BUTTONDOWN_USERNAME = "anagraphe";
```

`anagraphe` is a placeholder. Change it to the real Buttondown username once that account exists, then rebuild. Vite injects the form action from this constant:

`https://buttondown.com/api/emails/embed-subscribe/<username>`

Each form sends an `email` field and a hidden `embed` field. Without JavaScript, the browser validates the address and opens Buttondown's confirmation page. With JavaScript, the address is checked first and the result is shown on the page. If Buttondown needs the visitor to continue there (for example a CAPTCHA), the form falls back to the full-page post.

To add another form, copy a `form.waitlist` block. Give the email field, status, and privacy line their own ids, and point `for`, `aria-describedby`, and `aria-errormessage` at those ids. `src/main.js` binds every form with the class `waitlist`.

## Deploy later

Host the contents of `dist/` on any static host. No environment variables are required. Update `BUTTONDOWN_USERNAME` and rebuild before the first public deploy.

- **Cloudflare Pages:** build command `npm run build`, output directory `dist`.
- **Vercel:** framework preset Vite, output directory `dist`.
- **Anywhere else:** upload `dist/` as the site root.

The intended public URL is `https://anagraphetech.com/`. Canonical and Open Graph tags already use that host. The social image is `public/og.png`.
