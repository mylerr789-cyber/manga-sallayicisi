/// <reference path="../pb_data/types.d.ts" />
// Turleri settings'ten ozelleştirilebilir hale getir.
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId("settings");
    col.fields.add(
      new Field({
        name: "genres",
        type: "json",
        maxSize: 20000,
      })
    );
    app.save(col);

    const records = app.findRecordsByFilter("settings", "id != ''", "", 1, 0);
    if (records.length) {
      records[0].set("genres", [
        "Aksiyon", "Macera", "Komedi", "Dram", "Fantastik", "Korku",
        "Gizem", "Romantizm", "Bilim Kurgu", "Spor", "Doğaüstü", "Psikolojik",
        "Tarihi", "Dövüş Sanatları", "İsekai", "Okul", "Askeri", "Yaşamdan Kesitler",
      ]);
      app.save(records[0]);
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId("settings");
    col.fields.removeByName("genres");
    app.save(col);
  }
);