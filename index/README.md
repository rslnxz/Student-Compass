# Student Compass

A free, no-login student command center for SAT practice, APUSH, GPA planning, university selection, writing practice, and U.S. school-system guidance.

## Local use

Open `index.html` directly in a browser, or serve the folder with any static server.

## GitHub Pages

1. Create a GitHub repository.
2. Upload everything in this `index` folder.
3. In GitHub, open Settings -> Pages.
4. Deploy from branch `main`, folder `/root`.

## Structure

- `index.html` - app markup
- `css/styles.css` - all app styles
- `js/` - app logic split in execution order
- `data/` - question banks and large data declarations
- `assets/` - logo and static assets
- `manifest.json` and `service-worker.js` - PWA/offline support for hosted deployments
