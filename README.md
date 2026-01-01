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
- data-glue-script - *Scripts belonging to this page/layout. Deduped and parsed by glue-router when routing.*
  - EXAMPLE: `<script data-glue-script src="/app.js">`
- data-glue-head - *Head Tag that is intended to replace the current <head> element when pages are swapped.* It works be merging the children of the new head tag.
  - EXAMPLE:

    ```html
    <head data-glue-head> // This head will replace the current head
     <title>New Page Title</title> // This title will be updated
    </head>
    ```

#### Optional Future Tags | NOT Currently Built-in

* data-glue-run-once - Executes script tags only the first time ever.
* data-glue-run-always - Re-execute on every visit to this page/layout
* data-glue-scroll="reset | restore | none" - Default is to reset the scroll position. Restore is to restore the scroll position on back and forward and none is to do nothing.
