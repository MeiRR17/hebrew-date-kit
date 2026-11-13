# hebrew-date-kit
Hebrew calendar dates, holidays and Hebrew numerals, in plain JavaScript.
## What to build
A zero-dependency library that converts Gregorian dates to Hebrew dates and back, lists the Jewish holidays of any year (with Israel and diaspora variants), and formats numbers as Hebrew numerals (gematria) such as "תשפ״ז". Tested against a fixture table of known date pairs across many years, including leap years.
## Stack and form
- Node.js 22+ with no npm dependencies at all, ES modules.
- Tests with `node --test`, including fixture files in the repo, so they pass on any machine.
- If it is a CLI: a `bin` entry in package.json, `--help`, clear exit codes, and a `--json` output mode.
- If it is a library: a small clean API, JSDoc on every export, and an examples/ folder that runs with plain node.
## Publishing (this repository is public, part of Meir Dvir's portfolio)
- README.md in English: the name, a one-line pitch, why it exists, features, quick start, usage examples, how to run the tests, project structure, and a final "Author" section: "Built by Meir Dvir · [https://github.com/MeiRR17](https://github.com/MeiRR17)".
- LICENSE: MIT, copyright 2026 Meir Dvir.
- Keep it small and complete: a finished, polished tool is better than a large unfinished one. No placeholder sections, no fake screenshots, no "coming soon".
- No secrets, keys or personal data anywhere in the repository.
