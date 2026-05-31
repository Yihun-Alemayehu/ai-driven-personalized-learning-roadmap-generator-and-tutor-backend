# System Documentation → LaTeX Conversion Guide
### Professional CS Textbook Style (Stallings Typography)

---

## Table of Contents

2. [VS Code Setup](#2-vs-code-setup)
3. [Exporting from Google Docs](#3-exporting-from-google-docs)
4. [Project Structure](#4-project-structure)
5. [LaTeX Package Installation](#5-latex-package-installation)
6. [Claude Code Setup](#6-claude-code-setup)
7. [Step-by-Step Prompts](#7-step-by-step-prompts)
8. [Reference: Final Preamble Style Contract](#8-reference-final-preamble-style-contract)

---


## 2. VS Code Setup

### Install VS Code

- **Linux:** `sudo pacman -S code` (or download from [code.visualstudio.com](https://code.visualstudio.com))
- **Windows:** Download installer from [code.visualstudio.com](https://code.visualstudio.com)

### Install the LaTeX Workshop Extension

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search **LaTeX Workshop** by James Yu → Install

### VS Code Settings

Open settings (`Ctrl+Shift+P` → "Open User Settings JSON") and add:

```json
{
  "latex-workshop.latex.autoBuild.run": "onSave",
  "latex-workshop.view.pdf.viewer": "tab",
  "latex-workshop.latex.clean.fileTypes": [
    "*.aux", "*.bbl", "*.blg", "*.idx", "*.ind",
    "*.lof", "*.lot", "*.out", "*.toc", "*.acn",
    "*.acr", "*.alg", "*.glg", "*.glo", "*.gls",
    "*.fls", "*.log", "*.fdb_latexmk", "*.synctex.gz"
  ],
  "latex-workshop.latex.recipes": [
    {
      "name": "pdflatex",
      "tools": ["pdflatex", "pdflatex"]
    }
  ]
}
```

> The double `pdflatex` run resolves cross-references and ToC on first build.

### Install Claude Code

**Linux:**
```bash
npm install -g @anthropic-ai/claude-code
```

**Windows (PowerShell as Administrator):**
```powershell
npm install -g @anthropic-ai/claude-code
```

> Requires Node.js 18+. Download from [nodejs.org](https://nodejs.org) if not installed.

---

## 3. Exporting from Google Docs

### Step 1 — Install the "Docs to Markdown" Add-on

1. Open your Google Doc
2. Go to **Extensions → Add-ons → Get add-ons**
3. Search **Docs to Markdown** → Install it
4. After install: **Extensions → Docs to Markdown → Convert**
5. Copy the generated Markdown into a file named `doc.md`

### Step 2 — Download All Images

1. In Google Docs: **File → Download → Web Page (.html, zipped)**
2. Extract the zip — you will find an `images/` folder containing all embedded images
3. Keep those image files — you will use them later

### What You Should Have After This Step

```
downloads/
├── doc.md          ← the markdown export
└── images/         ← all embedded images extracted from the doc
    ├── image1.png
    ├── image2.png
    └── ...
```

---

## 4. Project Structure

Create this folder structure manually or let Claude Code create it:

```
project/
├── main.tex                  ← master document
├── preamble.tex              ← all style and package definitions
├── chapters/
│   ├── ch01_intro.tex
│   ├── ch02_architecture.tex
│   └── ...                   ← one file per top-level chapter
├── figures/
│   ├── images/               ← copy all exported images here
│   └── diagrams/             ← TikZ diagram files go here
│       ├── ch01_diagram1.tex
│       └── ...
└── bibliography.bib          ← if references exist
```

**Copy your exported images:**

Linux:
```bash
cp downloads/images/* project/figures/images/
```

Windows (PowerShell):
```powershell
Copy-Item downloads\images\* project\figures\images\
```

---

## 5. LaTeX Package Installation

### Linux — Verify All Required Packages

```bash
kpsewhich newtxtext.sty    # Times-compatible body font
kpsewhich newtxmath.sty    # Times-compatible math font
kpsewhich helvet.sty       # Helvetica for headings
kpsewhich microtype.sty    # Professional spacing
kpsewhich titlesec.sty     # Heading style control
kpsewhich caption.sty      # Caption formatting
kpsewhich fancyhdr.sty     # Headers and footers
kpsewhich booktabs.sty     # Professional tables
kpsewhich tikz.sty         # Diagrams
kpsewhich todonotes.sty    # Diagram placeholders during conversion
```

If any return empty, run:
```bash
sudo pacman -S texlive-fontsextra texlive-latexextra
```

### Windows — MiKTeX Auto-install

MiKTeX installs missing packages automatically on first build. If a package fails:

1. Open **MiKTeX Console**
2. Go to **Packages** tab
3. Search the package name → Install manually

---

## 6. Claude Code Setup

### Start Claude Code in Your Project

**Linux:**
```bash
cd project/
claude
```

**Windows (PowerShell):**
```powershell
cd project
claude
```

### Model to Use

| Task | Model |
|---|---|
| Audit and inventory | **Sonnet** |
| Preamble and style system design | **Opus** |
| Chapter-by-chapter conversion | **Sonnet** |
| TikZ diagram redrawing | **Opus** |
| Consistency review pass | **Sonnet** |

Switch models in Claude Code with `/model` command:
```
/model claude-opus-4-5
/model claude-sonnet-4-5
```

---

## 7. Step-by-Step Prompts

Run these prompts **in order**. Do not skip or combine steps.

---

### Prompt 1 — Audit the Raw Material
**Model: Sonnet**

```
Read doc.md and give me a structured inventory of:
(1) All headings and their full hierarchy (H1, H2, H3, etc.)
(2) All images referenced — list their filenames and which section they appear in
(3) Every Mermaid diagram block — paste each one in full with its section location
(4) Every UML diagram — describe what type it is (class, sequence, flowchart) and which section
(5) All tables — list their headings and which section they appear in
(6) All code blocks — note the language and section

Do not convert anything. Produce only a structured inventory.
```

---

### Prompt 2 — Generate Preamble and Document Skeleton
**Model: Opus**

```
Generate preamble.tex and main.tex for a CS academic project documentation.

Requirements:
- Class: report, 11pt, A4, twoside
- Font body: newtxtext + newtxmath (Times-style, matching Stallings COA textbook quality)
- Font headings: helvet scaled 0.92 (Helvetica, sans-serif, bold)
- Spacing: microtype for professional kerning, setspace at 1.3 line spacing
- Geometry: A4, top 2.5cm, bottom 2.5cm, inner 3cm (binding), outer 2.5cm, includeheadfoot
- Chapter headings: large bold sans-serif, horizontal rule underneath
- Section headings: bold sans-serif, progressively smaller per level
- Caption rules (strict — must be enforced everywhere):
    * Figure captions: BELOW the figure, label format "Figure X.Y — Title"
    * Table captions: ABOVE the table, label format "Table X.Y — Title"
    * Diagram/Listing labels: ABOVE, label format "Diagram X.Y — Title" or "Listing X.Y"
  All caption labels in bold sans-serif, caption text in italic
- Headers: chapter name on even pages (left), section name on odd pages (right)
- Footer: page number centered
- Include packages: titlesec, caption, fancyhdr, geometry, setspace, tikz, pgf-umlcd,
  pgf-umlsd, listings, hyperref, booktabs, xcolor, todonotes, graphicx, inputenc, fontenc

main.tex structure:
- \input{preamble}
- Title page placeholder
- Abstract placeholder
- Table of contents
- List of figures
- List of tables
- \input{} for each chapter found in the audit, using pattern chapters/chXX_name.tex

No content — structure and style only.
```

---

### Prompt 3 — Convert Chapters (Repeat Per Chapter)
**Model: Sonnet**

> Replace `[CHAPTER NAME]` and `[XX]` with the actual chapter title and number each time.

```
Convert the section titled "[CHAPTER NAME]" from doc.md into chapters/chXX_name.tex.

Rules:
(1) Preserve the exact heading hierarchy from the markdown — do not flatten or promote levels
(2) All images: wrap in \begin{figure}[htbp], use \includegraphics{figures/images/filename},
    caption BELOW with \caption{}, \label{fig:chXX_descriptivename}
(3) Do NOT convert any Mermaid or UML diagrams yet — replace each with:
    \missingfigure{Diagram: [paste the diagram title or description here]}
    so the placeholder appears in the PDF at the correct location
(4) All tables: convert to booktabs style (\toprule \midrule \bottomrule),
    caption ABOVE with \caption{}, \label{tab:chXX_descriptivename}
(5) All code blocks: use lstlisting environment with the correct language set
(6) Preserve all existing naming and placement conventions from the original doc
(7) Write only this chapter file — do not touch any other file
```

---

### Prompt 4 — Convert Diagrams
**Model: Opus**

```
Look at all \missingfigure{} placeholders across all chapter files.

For each placeholder, do the following based on its original type:

(a) Mermaid flowchart or sequence diagram:
    - Redraw as a TikZ diagram
    - Save to figures/diagrams/chXX_diagramname.tex
    - Replace the \missingfigure{} with:
        \begin{figure}[htbp]
          \caption*{\textbf{Diagram X.Y — Title}}   % label ABOVE
          \input{figures/diagrams/chXX_diagramname}
          \label{diag:chXX_diagramname}
        \end{figure}

(b) UML class diagram:
    - Use pgf-umlcd
    - Same file and replacement pattern as above

(c) UML sequence diagram:
    - Use pgf-umlsd
    - Same file and replacement pattern as above

(d) Raster image with no diagram source:
    - Use \includegraphics from figures/images/
    - Apply standard figure environment with caption below

Process one diagram at a time. Show me the TikZ code and confirm placement before
moving to the next diagram.
```

---

### Prompt 5 — Consistency Review
**Model: Sonnet**

```
Do a full consistency review across all chapter files and the main document.

Check and fix each of the following:
(1) Every figure has caption BELOW and a \label{fig:chXX_name}
(2) Every table has caption ABOVE and a \label{tab:chXX_name}
(3) Every diagram has its label ABOVE and a \label{diag:chXX_name}
(4) All \label{} names follow the patterns: fig:chXX_name, tab:chXX_name, diag:chXX_name
(5) All \ref{} and \pageref{} calls match an existing \label — no broken references
(6) Heading levels are consistent across all chapters — no level is skipped anywhere
(7) No \missingfigure{} placeholders remain
(8) lstlisting environments all have a language specified
(9) All \input{figures/diagrams/...} paths resolve to existing files

Report every issue found, fix each one, and confirm when done.
```

---

### Prompt 6 — Title Page and Front Matter
**Model: Sonnet**

```
Generate the final title page inside main.tex.

Include:
- Project title (large, bold, sans-serif)
- Subtitle if present in the original doc
- Author name(s)
- Institution name and department
- Submission date
- A horizontal rule separating the title block from the author/institution block
- Style must use the same helvet sans-serif font as the rest of the document headings

Then confirm:
- Table of contents is generated with \tableofcontents
- List of figures is generated with \listoffigures
- List of tables is generated with \listoftables
- hyperref is loaded last in preamble.tex so all ToC entries and cross-references
  are clickable in the final PDF
```

---

## 8. Reference: Final Preamble Style Contract

This is the complete typography and layout specification. Use this as reference if you
need to manually check or correct `preamble.tex`.

```latex
% ============================================================
% FONT SYSTEM — Stallings/Pearson CS Textbook Style
% ============================================================
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{newtxtext}          % Times-style body font
\usepackage{newtxmath}          % Times-compatible math
\usepackage[scaled=0.92]{helvet} % Helvetica for headings
\usepackage[final,
  tracking=true,
  kerning=true,
  spacing=true]{microtype}      % Professional typesetting

% ============================================================
% PAGE GEOMETRY — A4, academic binding margins
% ============================================================
\usepackage[
  a4paper,
  top=2.5cm,
  bottom=2.5cm,
  inner=3cm,
  outer=2.5cm,
  includeheadfoot
]{geometry}

% ============================================================
% HEADINGS — bold sans-serif with rule under chapters
% ============================================================
\usepackage{titlesec}

\titleformat{\chapter}[display]
  {\normalfont\sffamily\huge\bfseries}
  {\chaptertitlename\ \thechapter}
  {20pt}
  {\Huge\sffamily\bfseries}
  [\vspace{2pt}\titlerule]

\titleformat{\section}
  {\normalfont\sffamily\large\bfseries}
  {\thesection}{1em}{}

\titleformat{\subsection}
  {\normalfont\sffamily\normalsize\bfseries}
  {\thesubsection}{1em}{}

% ============================================================
% CAPTIONS — bold sans label, italic text, position enforced
% ============================================================
\usepackage[
  font=small,
  labelfont={sf,bf},
  textfont=it,
  labelsep=period,
  justification=justified
]{caption}

\captionsetup[figure]{position=below}
\captionsetup[table]{position=above}

% ============================================================
% LINE SPACING & PARAGRAPH
% ============================================================
\usepackage{setspace}
\setstretch{1.3}
\setlength{\parskip}{4pt}
\setlength{\parindent}{1.5em}

% ============================================================
% HEADERS & FOOTERS
% ============================================================
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE]{\small\sffamily\leftmark}
\fancyhead[RO]{\small\sffamily\rightmark}
\fancyfoot[C]{\small\sffamily\thepage}
\renewcommand{\headrulewidth}{0.4pt}

% ============================================================
% LOAD LAST
% ============================================================
\usepackage[
  colorlinks=true,
  linkcolor=black,
  citecolor=black,
  urlcolor=blue
]{hyperref}
```

---

## Quick Reference — Prompt Order

```
1. Audit          →  Sonnet   →  understand what's in the doc
2. Preamble       →  Opus     →  establish the style contract
3. Chapters       →  Sonnet   →  convert content, one chapter at a time
4. Diagrams       →  Opus     →  redraw Mermaid/UML as TikZ
5. Consistency    →  Sonnet   →  fix all labels, captions, references
6. Front matter   →  Sonnet   →  title page, ToC, LoF, LoT
```

**Rule: never run a later prompt before the earlier one is fully complete and the PDF builds without errors.**
