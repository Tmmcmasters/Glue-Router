type NavigateOptions = {
    replace?: boolean;
    scroll?: boolean; // future support for restore/none/reset
};

type CachedEntry = {
    html: string;
    layouts: Map<string, string>;
    title?: string;
    headContent?: DocumentFragment;
    scripts: Set<string>;
};

class GlueRouter {
    private cache = new Map<string, CachedEntry>();
    private inFlight = new Map<string, Promise<void>>();
    private currentUrl = new URL(location.href);
    private pageSelector = "[data-glue-page]";
    private layoutSelector = "[data-glue-layout]";
    private scriptSelector = "[data-glue-script]";
    private headSelector = "[data-glue-head], template[data-glue-head]";

    constructor() {
        window.addEventListener("popstate", () => this.handlePopState());
        this.cacheCurrentPage();
    }

    private getRootContainer() {
        const el = document.querySelector(this.pageSelector);
        if (!el) {
            throw new Error(`No ${this.pageSelector} element found`);
        }
        return el as HTMLElement;
    }

    private cacheCurrentPage() {
        const entry = this.extractPageData(document);
        this.cache.set(this.currentUrl.href, entry);
    }

    private extractPageData(doc: Document): CachedEntry {
        const pageEl = doc.querySelector(this.pageSelector);
        if (!pageEl) throw new Error(`No ${this.pageSelector} element found`);

        const layouts = new Map<string, string>();
        doc.querySelectorAll(this.layoutSelector).forEach((el) => {
            const name = el.getAttribute("data-glue-layout");
            if (name) layouts.set(name, el.innerHTML);
        });

        const headEl = doc.querySelector(this.headSelector);
        const headContent = headEl ? this.cloneHeadContent(headEl) : undefined;

        const scripts = new Set<string>();
        doc.querySelectorAll(this.scriptSelector).forEach((script) => {
            const src = script.getAttribute("src");
            scripts.add(src || this.hashContent(script.textContent || ""));
        });

        return {
            html: pageEl.innerHTML,
            layouts,
            title: doc.title || undefined,
            headContent,
            scripts,
        };
    }

    private cloneHeadContent(
        headEl: Element | HTMLTemplateElement
    ): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const nodes =
            headEl instanceof HTMLTemplateElement
                ? headEl.content.children
                : headEl.children;

        for (const node of nodes) {
            fragment.appendChild(node.cloneNode(true));
        }

        return fragment;
    }

    /**
     * A simple hash function that takes a string and returns a string that can be used to identify inline content.
     * The hash is based on the djb2 algorithm and is designed to be fast and simple, but not cryptographically secure.
     * @param content The string to hash.
     * @returns A string in the format "inline:<hash>" where <hash> is a numeric hash of the content.
     */
    private hashContent(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
        }
        return `inline:${hash}`;
    }

    private async fetchAndCache(url: string): Promise<CachedEntry> {
        if (this.inFlight.has(url))
            return this.inFlight.get(url)! as Promise<CachedEntry>;

        const promise = fetch(url, { headers: { "X-Glue-Request": "true" } })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then((html) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                return this.extractPageData(doc);
            })
            .then((entry) => {
                this.cache.set(url, entry);
                this.inFlight.delete(url);
                return entry;
            });

        this.inFlight.set(url, promise as Promise<void>);
        return promise;
    }

    private applyEntry(entry: CachedEntry, url: string) {
        // Apply Layouts (deepest first)
        const root = this.getRootContainer();
        const currentLayouts = document.querySelectorAll(this.layoutSelector);

        // Replace deepest layouts first
        for (const [name, html] of entry.layouts) {
            const target = document.querySelector(
                `[data-glue-layout="${name}"]`
            );
            if (target) target.innerHTML = html;
        }

        // Finally replace page content
        root.innerHTML = entry.html;

        // Apply Head
        if (entry.headContent) {
            document
                .querySelectorAll("[data-glue-dynamic]")
                .forEach((el) => el.remove());
            for (const node of entry.headContent.children) {
                const clone = node.cloneNode(true) as Element;
                clone.setAttribute("data-glue-dynamic", "");
                if (clone.tagName === "TITLE") {
                    document.title = clone.textContent || "";
                } else {
                    document.head.appendChild(clone);
                }
            }
        } else if (entry.title) {
            document.title = entry.title;
        }

        // Re-execute scripts if needed (always re-run on new visit)
        // Potential improvement with data-glue-run-once / run-always
        document.querySelectorAll(this.scriptSelector).forEach((script) => {
            const src = script.getAttribute("src");
            const key = src || this.hashContent(script.textContent || "");
            if (!entry.scripts.has(key)) return;

            const newScript = document.createElement("script");
            if (src) newScript.src = src;
            if (script.textContent) newScript.textContent = script.textContent;
            for (const attr of script.attributes) {
                if (attr.name.startsWith("data-glue")) continue;
                newScript.setAttribute(attr.name, attr.value);
            }
            script.replaceWith(newScript);
        });

        this.currentUrl = new URL(url);
        window.dispatchEvent(new Event("glue:navigated"));
    }

    private async navigate(url: string, options: NavigateOptions = {}) {
        const fullUrl = new URL(url, location.origin).href;
        if (fullUrl === this.currentUrl.href) return;

        let entry: CachedEntry;

        if (this.cache.has(fullUrl)) {
            entry = this.cache.get(fullUrl)!;
        } else {
            entry = await this.fetchAndCache(fullUrl);
        }

        this.applyEntry(entry, fullUrl);

        if (options.replace) {
            history.replaceState(null, "", fullUrl);
        } else {
            history.pushState(null, "", fullUrl);
        }

        if (options.scroll !== false) window.scrollTo(0, 0);
    }

    private handlePopstate() {
        const url = location.href;
        if (!this.cache.has(url)) {
            location.reload(); // safety
            return;
        }
        const entry = this.cache.get(url)!;
        this.applyEntry(entry, url);
    }

    // Public API
    push(url: string, options?: Omit<NavigateOptions, "replace">) {
        return this.navigate(url, { ...options, replace: false });
    }

    replace(url: string, options?: Omit<NavigateOptions, "replace">) {
        return this.navigate(url, { ...options, replace: true });
    }

    prefetch(url: string) {
        const fullUrl = new URL(url, location.origin).href;
        if (this.cache.has(fullUrl) || this.inFlight.has(fullUrl)) return;
        this.fetchAndCache(fullUrl).catch(() => {});
    }

    back() {
        history.back();
    }
    forward() {
        history.forward();
    }
}

function initalizeGlueRouter() {
    return new GlueRouter();
}

const version = "0.1.0";

export default initalizeGlueRouter;
export { initalizeGlueRouter, version, GlueRouter };

export const glue = initalizeGlueRouter(); // auto-init convenience

module.exports = {
    initalizeGlueRouter,
    version,
};
