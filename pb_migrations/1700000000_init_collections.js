/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // ---------- mangas ----------
    const mangas = new Collection({
      name: "mangas",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "title", type: "text", required: true, max: 255 },
        { name: "slug", type: "text", required: true, max: 255, pattern: "^[a-z0-9-]+$" },
        {
          name: "cover",
          type: "file",
          maxSelect: 1,
          maxSize: 10485760,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          thumbs: ["300x420", "600x0"],
        },
        { name: "description", type: "text", max: 10000 },
        { name: "author", type: "text", max: 255 },
        { name: "artist", type: "text", max: 255 },
        {
          name: "status",
          type: "select",
          maxSelect: 1,
          values: ["ongoing", "completed", "hiatus", "cancelled"],
        },
        {
          name: "type",
          type: "select",
          maxSelect: 1,
          values: ["manga", "webtoon", "manhwa", "manhua"],
        },
        { name: "genres", type: "json", maxSize: 5000 },
        { name: "featured", type: "bool" },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_mangas_slug ON mangas (slug)"],
    });
    app.save(mangas);

    // ---------- chapters ----------
    const chapters = new Collection({
      name: "chapters",
      type: "base",
      listRule: "published = true",
      viewRule: "published = true",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "manga",
          type: "relation",
          required: true,
          collectionId: mangas.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: "number", type: "number", required: true },
        { name: "title", type: "text", max: 255 },
        {
          name: "pages",
          type: "file",
          maxSelect: 200,
          maxSize: 10485760,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          thumbs: ["0x100"],
        },
        { name: "published", type: "bool" },
        { name: "created", type: "autodate", onCreate: true },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE INDEX idx_chapters_manga ON chapters (manga)",
        "CREATE UNIQUE INDEX idx_chapters_manga_number ON chapters (manga, number)",
      ],
    });
    app.save(chapters);

    // ---------- settings ----------
    const settings = new Collection({
      name: "settings",
      type: "base",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "site_name", type: "text", required: true, max: 100 },
        { name: "site_description", type: "text", max: 500 },
        {
          name: "logo",
          type: "file",
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
        },
        { name: "accent_color", type: "text", max: 20 },
        { name: "theme", type: "select", maxSelect: 1, values: ["dark", "light"] },
        { name: "hero_enabled", type: "bool" },
        { name: "items_per_page", type: "number", min: 1, max: 100 },
        { name: "footer_text", type: "text", max: 500 },
        { name: "social_links", type: "json", maxSize: 5000 },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    });
    app.save(settings);
  },
  (app) => {
    for (const name of ["chapters", "settings", "mangas"]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) {}
    }
  }
);
