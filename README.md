# Plagx Draft Preflight for Drupal

*A free academic writing tool by Plagiarism Checker X.*

**Plagx Draft Preflight is a free, open-source draft checker module for Drupal.** It adds a Draft Preflight panel to the content edit form that checks word count and reading time, in-text citations against the reference list, punctuation and basic grammar before you publish. Use it as an **essay checker**, **word count and reading time tool**, **citation checker** or **reference list checker** for articles, pages and academic content.

- Works with CKEditor 5 and plain text areas, for every content type
- Runs in the browser: no external requests, nothing sent anywhere, nothing added to the public site
- APA and MLA in-text citations
- Same rules as the [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) library

**[Try the live demo →](https://plagiarismcheckerx.github.io/plagx-preflight/)**

Developer downloads: [Packagist](https://packagist.org/packages/plagiarismcheckerx/plagx-preflight) · [npm](https://www.npmjs.com/package/plagx-preflight) · [Maven Central](https://central.sonatype.com/artifact/io.github.plagiarismcheckerx/plagx-preflight) · [NuGet](https://www.nuget.org/packages/Plagx.Preflight) · [GitHub](https://github.com/plagiarismcheckerx/plagx-preflight)

Need a quick citation online? Use the [free citation generator](https://plagiarismcheckerx.com/citation-generator?utm_source=plagx-preflight-drupal).

> Plagx Draft Preflight is a free academic writing utility by Plagiarism Checker X. It checks structure, references, punctuation and basic grammar. Plagiarism checking and AI-generated text detection are available in Plagiarism Checker X, linked at the end of this page.

## Table of contents

- Requirements
- Installation
- Configuration
- Checks
- Development
- Maintainers

## Requirements

Drupal 10.3 or later, or Drupal 11. No other modules or libraries are needed.

## Installation

Install as you would normally install a contributed Drupal module:

```bash
composer require drupal/plagx_draft_preflight
drush en plagx_draft_preflight
```

See [Installing Drupal modules](https://www.drupal.org/docs/extending-drupal/installing-drupal-modules) for more information.

## Configuration

1. Open any content edit form. The **Draft Preflight** panel is in the sidebar.
2. Click **Check draft**. Word limits and citation style can be changed in the panel for each check.
3. Optional: set default word limits, citation style and checks at **Configuration → Content authoring → Draft Preflight** (`/admin/config/content/plagx-draft-preflight`). This page needs the *Administer site configuration* permission.

## Checks

| Group | Examples |
|---|---|
| Length & structure | Word, sentence and paragraph counts, reading time, word limits, long sentences and paragraphs |
| References | Citations with no entry in the References section, references that are never cited |
| Punctuation | Unmatched quotes and brackets, double spaces, spacing around punctuation |
| Basic grammar | Repeated words, *a* / *an*, sentence capitals, common word confusions; optional passive-voice hints |

The references section is the first heading named References, Bibliography, Works Cited, Sources or similar. Each paragraph or list item after it is one reference.

## Development

```bash
npm install
npm test           # converter and rule tests
npm run sync       # copy the latest core from ../plagx-preflight/src
```

The core library in `js/lib/` is copied from [plagx-preflight](https://github.com/plagiarismcheckerx/plagx-preflight) (MIT).

## Maintainers

- Plagiarism Checker X - [plagiarismcheckerx](https://www.drupal.org/u/plagiarismcheckerx)

## Plagx Preflight - Free Draft & Grammar Checker

An open-source writing utility for students, researchers and developers. Check length, structure, citations, punctuation and basic grammar before you submit.

Developed by Plagiarism Checker X.

Plagx Preflight gives writing suggestions; it does not detect plagiarism or AI-generated text. For full document checks, explore [Text Similarity Detector](https://plagiarismcheckerx.com/?utm_source=plagx-preflight-drupal) and its [AI Content Detector](https://plagiarismcheckerx.com/ai-content-detector?utm_source=plagx-preflight-drupal).

## License

GPL-2.0-or-later © Plagiarism Checker X. The bundled Plagx Preflight core (`js/lib/`) is MIT licensed.
