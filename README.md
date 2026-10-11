# কুইজঘর — DU Science preparation

A responsive Bangla-version quiz app built with plain HTML, CSS, and JavaScript. Its cream, orange, and green interface follows the supplied visual reference.

## Live app

[Open কুইজঘর](https://quazirazeen2002.github.io/du-ka-quiz/)

## Run

Open `index.html` directly in a browser, or run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8080. No build step or package installation is required. Google Fonts enhances the typography when online; system fonts are used otherwise. Browser progress is tied to the origin, so use the same URL each time.

## Included

- 200 original Bangla MCQs: 100 Physics across 11 topic groups, 100 Chemistry across 10.
- Chapter practice with immediate explanations and correct/incorrect states.
- Started quizzes open in a focused, scrollable modal; Escape, backdrop, or the back button closes it without resetting progress. Adjust `--quiz-modal-width` in `styles.css` to change the desktop width (default 780px).
- Daily mixed practice: 10 Physics + 10 Chemistry questions, 15 minutes, explanations after submission. This is a focused practice set, not a full DU mock exam.
- Automatic submission when the daily timer expires, including after a reload.
- Mistake notebook including skipped questions; correct reattempts resolve mistakes.
- Bookmarks, personalized greeting, first-attempt and overall accuracy, and saved sessions.
- Keyboard shortcuts: 1–4 to answer, Enter from the page body to continue.
- Responsive desktop and mobile layouts, focus states, and reduced-motion support.

## Content status

The bank is original HSC-based practice, not a verified reproduction of past papers, an official DU syllabus, or a prediction of the next exam. Topic allocation follows the agreed starting blueprint. Past-paper frequency analysis and independent teacher review have not been performed. Check the applicable admission circular and have a subject teacher review the content before using it as a formal admission coaching product. Daily timing is a practice choice; no official negative marking or full-exam scoring is claimed.

Progress and profile names stay in this browser's localStorage. There are no accounts, backend, or cross-device sync. Clearing browser storage removes progress. Starting another set replaces the one active session; question history and bookmarks remain.

## Files

- `index.html`: accessible app shell.
- `styles.css`: reference-inspired responsive design.
- `app.js`: quiz, timer, progress, and storage behavior.
- `data/questions.js`: editable question bank, including correct answer indices and explanations.
- `tests/quiz.test.js`: state and content integrity checks.

## Check

```sh
node --test tests/quiz.test.js
```
