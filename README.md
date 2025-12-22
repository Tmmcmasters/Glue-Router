# Glue-Router

A Framework Agnostic HTML attribute driven Javascript router. Intended for SSR/SSG designed web applications. 

### Features

- Swap layouts
- Easily prefetch routes.
- Nested/Named Layouts
- Framework Agnostic
- Built with Pure Typescript
- Easily Update Meta Data
- Easily Update Head Tags From Server

### Attributes

- data-glue-page - *Root container that gets replaced on route navigation.*
  - EXAMPLE: `<main data-glue-page>`
- data-glue-layout - *Named layout for nesting. Allows the ability to keep layout content while switching pages.*
  - EXAMPLE: `<div data-glue-layout="dashboard"`
- data-glue-script - *Scripts belonging to this page/layout. Deduped and parsed by glue when routing.*
  - EXAMPLE: `<script data-glue-script src="/app.js">`
-
