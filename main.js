// Portfolio scripts: footer dates, project cards, project filters.
// Everything here is progressive enhancement: the page still works without JS.

const SITE_REPO = "Matt-tedesco98/Matt-tedesco98.github.io";
const DATE_FORMAT = { year: "numeric", month: "long", day: "numeric" };

/** Date of the most recent commit on a repo's default branch, or null. */
async function getLastCommitDate(repo) {
    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`);
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const [latest] = await res.json();
        return latest ? new Date(latest.commit.committer.date) : null;
    } catch (err) {
        console.warn(`Couldn't load last commit for ${repo}:`, err);
        return null;
    }
}

/** Fill a <time> element with a date, leaving its fallback text if date is null. */
function setTime(target, date) {
    if (!target || !date) return;
    target.dateTime = date.toISOString();
    target.textContent = date.toLocaleDateString("en-US", DATE_FORMAT);
}

/** Small helper for building elements without innerHTML. */
function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else node.setAttribute(key, value);
    }
    for (const child of [].concat(children)) {
        if (child) node.append(child);
    }
    return node;
}

function renderProjectCard(project) {
    const repoUrl = `https://github.com/${project.repo}`;

    const links = el("div", { class: "project-links" }, [
        project.caseStudy && el("a", { class: "button", href: project.caseStudy, text: "Read the case study" }),
        el("a", {
            class: project.caseStudy ? "button button-ghost" : "button",
            href: repoUrl,
            text: "View code",
            "aria-label": `View ${project.title} code on GitHub`,
        }),
    ]);

    const card = el("article", {
        class: project.featured ? "project-card featured" : "project-card",
        "data-categories": project.categories.join(" "),
    }, [
        project.featured && el("p", { class: "eyebrow", text: "Featured project" }),
        el("h3", { text: project.title }),
        el("p", { class: "project-summary", text: project.summary }),
        project.highlights.length > 0 &&
            el("ul", { class: "project-highlights" }, project.highlights.map((h) => el("li", { text: h }))),
        el("ul", { class: "stack", "aria-label": "Tech stack" }, project.stack.map((s) => el("li", { text: s }))),
        project.featured && el("p", { class: "project-activity" }, [
            "Last commit: ",
            el("time", { class: "repo-updated", text: "recently" }),
        ]),
        links,
    ]);

    if (project.featured) {
        getLastCommitDate(project.repo).then((date) => setTime(card.querySelector(".repo-updated"), date));
    }
    return card;
}

function applyFilter(filterId, grid, buttons) {
    for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.filter === filterId));
    }
    let visible = 0;
    for (const card of grid.children) {
        const show = filterId === "all" || card.dataset.categories.split(" ").includes(filterId);
        card.hidden = !show;
        if (show) visible++;
    }
    const status = document.getElementById("project-count");
    if (status) status.textContent = `Showing ${visible} project${visible === 1 ? "" : "s"}`;
}

async function renderProjects() {
    const grid = document.getElementById("project-grid");
    const filterBar = document.getElementById("project-filters");
    if (!grid || !filterBar) return;

    let data;
    try {
        const res = await fetch("data/projects.json");
        if (!res.ok) throw new Error(`projects.json ${res.status}`);
        data = await res.json();
    } catch (err) {
        console.warn("Couldn't load projects:", err);
        return; // the fallback link in the HTML stays visible
    }

    grid.replaceChildren(...data.projects.map(renderProjectCard));

    const buttons = data.categories.map((category) =>
        el("button", {
            type: "button",
            class: "filter-chip",
            "data-filter": category.id,
            "aria-pressed": "false",
            text: category.label,
        })
    );
    filterBar.replaceChildren(...buttons);
    filterBar.hidden = false;
    filterBar.addEventListener("click", (event) => {
        const button = event.target.closest(".filter-chip");
        if (button) applyFilter(button.dataset.filter, grid, buttons);
    });

    applyFilter("all", grid, buttons);
}

/** Light/dark toggle. Follows the system setting until the visitor picks one. */
function setupThemeToggle() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

    const sync = () => {
        const current = currentTheme();
        const next = current === "dark" ? "light" : "dark";
        button.dataset.current = current;
        button.setAttribute("aria-label", `Switch to ${next} mode`);
        button.title = `Switch to ${next} mode`;
    };

    button.addEventListener("click", () => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
        sync();
    });

    // If the visitor hasn't chosen, keep the icon in step with system changes.
    systemDark.addEventListener("change", sync);

    sync();
    button.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    getLastCommitDate(SITE_REPO).then((date) => setTime(document.getElementById("last-updated"), date));
    renderProjects();
});
