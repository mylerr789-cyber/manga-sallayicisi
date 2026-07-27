/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId("settings");
    const record = new Record(settings);
    record.set("site_name", "Manga Sallayıcısı");
    record.set("site_description", "Ücretsiz manga ve webtoon okuma sitesi");
    record.set("accent_color", "#e11d48");
    record.set("theme", "dark");
    record.set("hero_enabled", true);
    record.set("items_per_page", 24);
    record.set("footer_text", "Manga Sallayıcısı — açık kaynak manga & webtoon platformu");
    record.set("social_links", { discord: "", twitter: "", instagram: "" });
    app.save(record);
  },
  (app) => {
    const records = app.findRecordsByFilter("settings", "id != ''", "", 10, 0);
    for (const r of records) {
      app.delete(r);
    }
  }
);
