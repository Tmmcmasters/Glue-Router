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

    private cloneHeadContent(headEl: Element | HTMLTemplateElement): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const nodes = headEl instanceof HTMLTemplateElement ? headEl.content.children : headEl.children;

        for (const node of nodes) {
            fragment.appendChild(node.cloneNode(true));
        }

        return fragment;
    }

    private hashContent(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
        }
        return `inline:${hash}`;
    }
}

const version = "0.1.0";

module.exports = {
    initalizeGlueRouter,
    version,
};
